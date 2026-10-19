import {
  AZUL_CLARO_HEX,
  AZUL_HEX,
  BORDE_HEX,
  GRIS_TEXTO_HEX,
  TEXTO_HEX,
  coloresEstado,
  datosEmpresaDocumento,
  estadoLabel,
  fechaGeneracion,
  fechaLegible,
  itemsNormalizados,
  modalidad,
  nombreArchivo,
  numeroPedido,
  resumenTotales,
} from './pedidoFormato.js';

/**
 * ============================================================================
 * EXPORTACIÓN DE PEDIDOS A EXCEL (ExcelJS)
 * ============================================================================
 * Genera un libro `.xlsx` con tabla estilizada: banda de título, ficha del
 * pedido, tabla de artículos con encabezado de color, filas alternas, bordes,
 * formato de moneda y fila de total.
 */

const MONEDA_FMT = '"$"#,##0';
const FONDO_ALT_HEX = 'FFF8FAFD';
const FONDO_LABEL_HEX = 'FFF3F6FC';
const ULTIMA_COLUMNA = 5;

/** Carga la distribución de navegador (compatible con Safari) sin inflar el bundle principal. */
const cargarExcelJS = async () => {
  const mod = await import('exceljs/dist/exceljs.min.js');
  return mod.default || mod;
};

const bordeFino = {
  top: { style: 'thin', color: { argb: BORDE_HEX } },
  left: { style: 'thin', color: { argb: BORDE_HEX } },
  bottom: { style: 'thin', color: { argb: BORDE_HEX } },
  right: { style: 'thin', color: { argb: BORDE_HEX } },
};

const pintar = (cell, argb) => {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
};

/** Aplica un estilo a cada celda del rango, lo combina y fija el valor. */
const combinarConEstilo = (ws, row, col1, col2, valor, estilizar) => {
  for (let c = col1; c <= col2; c += 1) estilizar(ws.getCell(row, c));
  if (col2 > col1) ws.mergeCells(row, col1, row, col2);
  ws.getCell(row, col1).value = valor;
};

/** Construye el libro Excel estilizado (sin descargarlo). */
export const buildPedidoWorkbook = async (order, empresa = {}) => {
  const ExcelJS = await cargarExcelJS();
  const wb = new ExcelJS.Workbook();
  const { nombreComercial, razonSocial, nit, direccion } = datosEmpresaDocumento(empresa);
  wb.creator = nombreComercial;
  wb.created = new Date();

  const ws = wb.addWorksheet('Pedido', {
    views: [{ showGridLines: false }],
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
    },
  });

  ws.columns = [
    { key: 'producto', width: 38 },
    { key: 'codigo', width: 18 },
    { key: 'cantidad', width: 12 },
    { key: 'unitario', width: 18 },
    { key: 'subtotal', width: 18 },
  ];

  // --- Banda de título ---
  combinarConEstilo(ws, 1, 1, ULTIMA_COLUMNA, `ORDEN DE PEDIDO  ·  ${numeroPedido(order)}`, (cell) => {
    pintar(cell, AZUL_HEX);
    cell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  });
  ws.getRow(1).height = 30;

  const empresaInfo = [
    [nombreComercial, true],
    [`Razón social: ${razonSocial}`, false],
    [`NIT: ${nit}`, false],
    [`Dirección: ${direccion}`, false],
  ];
  empresaInfo.forEach(([texto, destacado], index) => {
    const row = index + 2;
    combinarConEstilo(ws, row, 1, ULTIMA_COLUMNA, texto, (cell) => {
      pintar(cell, AZUL_CLARO_HEX);
      cell.font = {
        size: destacado ? 12 : 9,
        bold: destacado,
        color: { argb: destacado ? AZUL_HEX : GRIS_TEXTO_HEX },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
    });
    ws.getRow(row).height = destacado ? 23 : 18;
  });
  ws.getRow(6).height = 8;

  // --- Ficha del pedido ---
  const info = [
    ['Cliente', order.cliente_nombre || '—'],
    ['WhatsApp', order.whatsapp || '—'],
    ['Fecha del pedido', fechaLegible(order)],
    ['Estado', estadoLabel(order.estado)],
    ['Modalidad de entrega', modalidad(order)],
    ['Dirección de entrega', order.direccion_entrega || '—'],
  ];

  info.forEach(([label, valor], i) => {
    const r = 7 + i;
    const cLabel = ws.getCell(r, 1);
    cLabel.value = label;
    cLabel.font = { size: 10, bold: true, color: { argb: GRIS_TEXTO_HEX } };
    cLabel.alignment = { vertical: 'middle', indent: 1 };
    cLabel.border = bordeFino;
    pintar(cLabel, FONDO_LABEL_HEX);

    const colores = label === 'Estado' ? coloresEstado(order.estado) : null;
    combinarConEstilo(ws, r, 2, ULTIMA_COLUMNA, valor, (cell) => {
      cell.font = { size: 10, bold: Boolean(colores), color: { argb: colores ? colores.texto : TEXTO_HEX } };
      cell.alignment = { vertical: 'middle', indent: 1 };
      cell.border = bordeFino;
      if (colores) pintar(cell, colores.fondo);
    });
    ws.getRow(r).height = 18;
  });

  const filaEspacio = 7 + info.length;
  ws.getRow(filaEspacio).height = 8;

  // --- Encabezado de la tabla de artículos ---
  const filaEncabezado = filaEspacio + 1;
  ['Producto', 'Código', 'Cantidad', 'Valor Unitario', 'Subtotal'].forEach((txt, i) => {
    const cell = ws.getCell(filaEncabezado, i + 1);
    cell.value = txt;
    pintar(cell, AZUL_HEX);
    cell.font = { size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: i >= 2 ? 'center' : 'left', indent: i < 2 ? 1 : 0 };
    cell.border = bordeFino;
  });
  ws.getRow(filaEncabezado).height = 22;

  // --- Filas de artículos ---
  const items = itemsNormalizados(order);
  let fila = filaEncabezado;

  if (items.length === 0) {
    fila += 1;
    combinarConEstilo(ws, fila, 1, ULTIMA_COLUMNA, 'No hay productos registrados en esta orden', (cell) => {
      cell.font = { size: 10, italic: true, color: { argb: GRIS_TEXTO_HEX } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = bordeFino;
    });
    ws.getRow(fila).height = 20;
  } else {
    items.forEach((it, idx) => {
      fila += 1;
      [it.producto, it.codigo || '—', it.cantidad, it.unitario, it.subtotal].forEach((valor, i) => {
        const cell = ws.getCell(fila, i + 1);
        cell.value = valor;
        cell.border = bordeFino;
        cell.font = { size: 10, color: { argb: TEXTO_HEX } };

        if (i === 0) {
          cell.font = { size: 10, bold: true, color: { argb: TEXTO_HEX } };
          cell.alignment = { vertical: 'middle', indent: 1 };
        } else if (i === 1) {
          cell.font = { size: 10, color: { argb: GRIS_TEXTO_HEX } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (i === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
          cell.numFmt = MONEDA_FMT;
        }

        if (idx % 2 === 1) pintar(cell, FONDO_ALT_HEX);
      });
      ws.getRow(fila).height = 18;
    });
  }

  // --- Fila de TOTAL ---
  fila += 1;
  for (let c = 1; c <= 4; c += 1) {
    const cell = ws.getCell(fila, c);
    cell.border = bordeFino;
    pintar(cell, AZUL_CLARO_HEX);
  }
  ws.mergeCells(fila, 1, fila, 4);
  const celdaTotalLabel = ws.getCell(fila, 1);
  celdaTotalLabel.value = 'TOTAL';
  celdaTotalLabel.font = { size: 11, bold: true, color: { argb: AZUL_HEX } };
  celdaTotalLabel.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };

  const celdaTotalValor = ws.getCell(fila, ULTIMA_COLUMNA);
  celdaTotalValor.value = Number(order.total || 0);
  celdaTotalValor.numFmt = MONEDA_FMT;
  celdaTotalValor.font = { size: 11, bold: true, color: { argb: AZUL_HEX } };
  celdaTotalValor.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
  celdaTotalValor.border = bordeFino;
  pintar(celdaTotalValor, AZUL_CLARO_HEX);
  ws.getRow(fila).height = 22;

  // --- Desglose (subtotal, descuento, IVA, envío) ---
  const desglose = resumenTotales(order).slice(0, -1);
  if (desglose.length > 1) {
    desglose.forEach(([label, valor]) => {
      fila += 1;
      const cLabel = ws.getCell(fila, 4);
      cLabel.value = label;
      cLabel.font = { size: 9, color: { argb: GRIS_TEXTO_HEX } };
      cLabel.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };

      const cValor = ws.getCell(fila, ULTIMA_COLUMNA);
      cValor.value = Number(valor);
      cValor.numFmt = MONEDA_FMT;
      cValor.font = { size: 9, color: { argb: TEXTO_HEX } };
      cValor.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
      ws.getRow(fila).height = 16;
    });
  }

  // --- Pie ---
  fila += 1;
  combinarConEstilo(ws, fila, 1, ULTIMA_COLUMNA, `Generado el ${fechaGeneracion()} · ${nombreComercial}`, (cell) => {
    cell.font = { size: 8, italic: true, color: { argb: GRIS_TEXTO_HEX } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  ws.getRow(fila).height = 18;

  // Congela el encabezado y lo repite al imprimir
  ws.views = [{ state: 'frozen', ySplit: filaEncabezado, showGridLines: false }];
  ws.pageSetup.printTitlesRow = `${filaEncabezado}:${filaEncabezado}`;

  return wb;
};

/** Descarga el libro en el navegador como archivo `.xlsx`. */
const descargarWorkbook = async (workbook, nombre) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.style.display = 'none';
  document.body.appendChild(enlace);
  enlace.click();

  // Safari necesita que el enlace y el Blob permanezcan vivos hasta iniciar la descarga.
  globalThis.setTimeout(() => {
    enlace.remove();
    URL.revokeObjectURL(url);
  }, 1500);
};

export const exportPedidoToExcel = async (order, empresa = {}) => {
  const workbook = await buildPedidoWorkbook(order, empresa);
  await descargarWorkbook(workbook, `Pedido_${nombreArchivo(order)}.xlsx`);
};

export default exportPedidoToExcel;
