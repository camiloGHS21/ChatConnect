import { PRODUCT_COLUMNS } from './productoExcelSchema.js';
import { exportProductRelations } from './productoExcelRelations.js';

async function workbook() {
  const mod = await import('exceljs/dist/exceljs.min.js');
  return new (mod.default || mod).Workbook();
}

function styleSheet(sheet) {
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF145A32' } };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
}

export async function downloadWorkbook(wb, filename) {
  const buffer = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function buildProductWorkbook(catalogos, products = []) {
  const wb = await workbook();
  const sheet = wb.addWorksheet('Productos');
  sheet.columns = PRODUCT_COLUMNS.map(key => ({
    header: `${key} (${key === 'nombre' ? 'obligatorio' : 'opcional'})`,
    key, width: key === 'nombre' ? 40 : 34,
  }));
  for (const p of products) {
    const row = { ...p, ...exportProductRelations(p), codigo_interno: p.codigo_interno ?? p.sku,
      precio_base: Number(p.precio_base ?? p.precio),
      existencia_inicial: Number(p.existencia_inicial ?? p.existencia),
      maneja_inventario: p.maneja_inventario ? 'SI' : 'NO' };
    for (const key of ['costo_base', 'costo_impuesto', 'precio_impuesto', 'stock_minimo', 'stock_maximo']) row[key] = Number(p[key]) || 0;
    sheet.addRow(row);
  }
  for (const key of ['codigo_interno', 'referencia', 'codigos_barras', 'impuestos_compra_ids',
    'impuestos_venta_ids', 'proveedores_ids', 'listas_precios_valores']) sheet.getColumn(key).numFmt = '@';
  styleSheet(sheet);
  const requiredHeader = sheet.getCell(1, PRODUCT_COLUMNS.indexOf('nombre') + 1);
  requiredHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB03A2E' } };
  requiredHeader.note = 'Único campo obligatorio. Los demás campos pueden dejarse vacíos.';
  const instructions = wb.addWorksheet('Instrucciones');
  instructions.columns = [{ header: 'Guía de importación', width: 115 }];
  [
    'Complete la hoja Productos sin cambiar sus encabezados. Una fila por producto. Solo se aceptan archivos .xlsx.',
    'Solo nombre es obligatorio (encabezado rojo). Todos los demás campos son opcionales y pueden dejarse vacíos.',
    'codigo_interno vacío genera un código automático. Códigos existentes no se actualizan.',
    'Categoría, subcategoría, marca, medida y tipo de inventario son opcionales: no necesita crearlos para importar.',
    'Solo si completa un campo terminado en _id, use un ID de las hojas de catálogos de esta empresa.',
    'Si indica una subcategoría, también debe indicar su categoría correspondiente.',
    'Un catálogo vacío no impide importar: deje su campo vacío si su empresa no lo utiliza.',
    'Use números sin separadores de miles. Use SI o NO para maneja_inventario (vacío = SI).',
    'existencia_inicial es el inventario al crear. En una exportación representa la existencia actual, no la disponible.',
    'estado_producto: activo o inactivo. estado_publicacion: publicado o no_publicado. Vacíos: activo y publicado.',
    'Servicios: use maneja_inventario = NO y deje existencia_inicial, stock_minimo y stock_maximo vacíos o en cero.',
    'impuestos_compra_ids e impuestos_venta_ids son opcionales. Use IDs de la hoja Impuestos separados por punto y coma: 1;2.',
    'Los IDs de ejemplo son ilustrativos: consulte siempre los IDs reales de su empresa en las hojas de catálogos.',
    'Los impuestos se calculan sobre costo_base (compra) o precio_base (venta), según porcentaje o valor fijo del catálogo.',
    'costo_impuesto y precio_impuesto vacíos se calculan sumando los impuestos seleccionados a su base. Sin impuestos utilizan la base.',
    'codigos_barras: uno o varios códigos separados por punto y coma; el primero es el principal. Conserve los ceros iniciales como texto.',
    'proveedores_ids: IDs de la hoja Proveedores separados por punto y coma; el primero es el principal. Es opcional.',
    'listas_precios_valores: use ID:precio;ID:precio (por ejemplo 1:15000;2:14000), sin separadores de miles. Es opcional.',
    'descripcion_larga, ficha_tecnica, titulo_seo, descripcion_seo, palabras_clave y slug son opcionales.',
    'Las variantes, imágenes, atributos y retenciones se gestionan desde el formulario del producto; no se importan en esta plantilla.',
    'Se validan todas las filas antes de comenzar. Los errores de guardado no deshacen productos ya creados.',
    'Máximo 5000 filas por archivo y 10 MB. La creación conserva la sincronización habitual con WhatsApp.',
    'No vuelva a importar filas creadas con código automático sin asignarles su código: podría duplicar productos.',
  ].forEach(text => instructions.addRow([text]));
  styleSheet(instructions);
  for (const [key, label] of Object.entries({ categorias: 'Categorías', subcategorias: 'Subcategorías',
    marcas: 'Marcas', medidas: 'Medidas', tiposInventario: 'Tipos inventario', impuestos: 'Impuestos',
    proveedores: 'Proveedores', listasPrecios: 'Listas de precios' })) {
    const cat = wb.addWorksheet(label);
    cat.columns = [{ header: 'id', key: 'id', width: 15 }, { header: 'nombre', key: 'nombre', width: 45 },
      ...(key === 'subcategorias' ? [{ header: 'categoria_id', key: 'categoria_id', width: 20 }] : []),
      ...(key === 'impuestos' ? ['codigo', 'tipo', 'porcentaje', 'valor'].map(field => ({ header: field, key: field, width: 22 })) : []),
      ...(key === 'proveedores' ? [{ header: 'numero_documento', key: 'numero_documento', width: 24 }] : [])];
    cat.addRows(catalogos[key] || []);
    styleSheet(cat);
  }
  return wb;
}

export async function readProductFile(file) {
  if (!/\.xlsx$/i.test(file.name)) throw new Error('Seleccione un archivo Excel .xlsx');
  if (file.size > 10 * 1024 * 1024) throw new Error('El archivo supera los 10 MB');
  const wb = await workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const sheet = wb.getWorksheet('Productos');
  if (!sheet) throw new Error('No existe la hoja Productos. Descargue la plantilla.');
  if (sheet.rowCount > 5001) throw new Error('Máximo 5000 filas por importación');
  const headers = new Map();
  sheet.getRow(1).eachCell((cell, col) => {
    const header = String(cell.value || '').trim().replace(/\s*\((?:obligatorio|opcional)\)$/i, '');
    if (headers.has(header)) throw new Error(`Encabezado repetido: ${header}`);
    headers.set(header, col);
  });
  if (!headers.has('nombre')) throw new Error('Falta la columna nombre');
  for (const key of headers.keys()) if (!PRODUCT_COLUMNS.includes(key)) throw new Error(`Columna desconocida: ${key}`);
  const rows = [];
  sheet.eachRow((row, fila) => {
    if (fila === 1) return;
    const values = {};
    let formula = false;
    for (const [key, col] of headers) {
      const value = row.getCell(col).value;
      if (value && typeof value === 'object') formula = true;
      values[key] = value;
    }
    if (Object.values(values).some(v => v !== null && String(v).trim() !== '')) rows.push({ fila, values, formula });
  });
  if (!rows.length) throw new Error('La hoja Productos está vacía');
  return rows;
}
