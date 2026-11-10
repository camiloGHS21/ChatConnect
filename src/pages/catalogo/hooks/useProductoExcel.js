import { useState } from 'react';
import productoService from '@/services/productoService';
import { buildProductWorkbook, downloadWorkbook, readProductFile } from '../utils/productoExcel';
import { parseProductRow } from '../utils/productoExcelSchema';

export default function useProductoExcel(onImported) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [report, setReport] = useState(null);
  const [pending, setPending] = useState(null);
  const errorText = error => String(error.response?.data?.message || error.message || 'Error inesperado');

  const download = async (template) => {
    setBusy(true);
    setProgress(template ? 'Preparando plantilla...' : 'Exportando todos los productos...');
    try {
      const [catalogos, products] = await Promise.all([
        productoService.getCatalogos(), template ? Promise.resolve([]) : productoService.getProductos(),
      ]);
      let exportProducts = products;
      if (!template) {
        exportProducts = [];
        // Limitar concurrencia para no saturar PostgreSQL con las consultas de detalle.
        for (let index = 0; index < products.length; index += 4) {
          setProgress(`Exportando detalles ${Math.min(index + 4, products.length)} de ${products.length}...`);
          const details = await Promise.all(products.slice(index, index + 4).map(p => productoService.getProducto(p.id)));
          exportProducts.push(...details);
        }
      }
      const wb = await buildProductWorkbook(catalogos, exportProducts);
      await downloadWorkbook(wb, template ? 'plantilla-productos.xlsx' : 'productos.xlsx');
    } catch (error) { setReport({ error: errorText(error) }); }
    finally { setBusy(false); }
  };

  const prepare = async (file) => {
    if (!file) return;
    setBusy(true);
    setReport(null);
    setProgress('Validando archivo...');
    try {
      const [rows, catalogos, products] = await Promise.all([
        readProductFile(file), productoService.getCatalogos(), productoService.getProductos(),
      ]);
      const codes = new Set(products.map(p => String(p.sku || '').trim().toLowerCase()));
      const valid = [];
      const errors = [];
      for (const row of rows) {
        try {
          if (row.formula) throw new Error('Use valores simples, sin fórmulas, enlaces ni celdas enriquecidas');
          const dto = parseProductRow(row.values, catalogos, codes);
          if (dto.codigo_interno) codes.add(dto.codigo_interno.toLowerCase());
          valid.push({ fila: row.fila, dto });
        } catch (error) { errors.push({ fila: row.fila, message: errorText(error) }); }
      }
      setPending({ valid, errors, total: rows.length });
    } catch (error) { setReport({ error: errorText(error) }); }
    finally { setBusy(false); }
  };

  const importProducts = async () => {
    if (!pending) return;
    const { valid, errors: initialErrors, total } = pending;
    setPending(null);
    setBusy(true);
    const errors = [...initialErrors];
    let created = 0;
    try {
      for (let index = 0; index < valid.length; index++) {
        const row = valid[index];
        setProgress(`Importando ${index + 1} de ${valid.length}...`);
        try {
          await productoService.crearProducto(row.dto);
          created++;
        } catch (error) {
          const uncertain = !error.response || error.response.status >= 500;
          errors.push({ fila: row.fila, message: uncertain
            ? 'Respuesta no confirmada. Revise el catálogo antes de reintentar esta fila.' : errorText(error) });
          if (uncertain) {
            for (const remaining of valid.slice(index + 1)) errors.push({ fila: remaining.fila, message: 'No procesada: importación detenida por fallo de conexión o servidor' });
            break;
          }
        }
      }
      setReport({ created, total, errors });
    } finally {
      setBusy(false);
      await onImported?.();
    }
  };

  return { busy, progress, report, pending, download, prepare, importProducts,
    closePreview: () => setPending(null), closeReport: () => setReport(null) };
}
