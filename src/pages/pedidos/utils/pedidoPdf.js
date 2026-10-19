import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  AZUL_RGB,

  GRIS_RGB,
  datosEmpresaDocumento,
  estadoLabel,
  fechaGeneracion,
  fechaLegible,
  formatoCop,
  itemsNormalizados,
  modalidad,
  nombreArchivo,
  numeroPedido,
  resumenTotales,
} from './pedidoFormato';

/**
 * ============================================================================
 * EXPORTACIÓN DE PEDIDOS A PDF (jsPDF + autoTable)
 * ============================================================================
 */
export const exportPedidoToPdf = (order, empresa = {}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const mx = 40;

  // Encabezado empresarial desde public.empresa
  const { nombreComercial, razonSocial, nit, direccion } = datosEmpresaDocumento(empresa);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text(nombreComercial, mx, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Razón social: ${razonSocial}`, mx, 56);
  doc.text(`NIT: ${nit}`, mx, 70);
  doc.text(`Dirección: ${direccion}`, mx, 84, { maxWidth: ancho - (mx * 2) - 180 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30);
  doc.text(`Orden ${numeroPedido(order)}`, ancho - mx, 42, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`Estado: ${estadoLabel(order.estado)}`, ancho - mx, 58, { align: 'right' });

  doc.setDrawColor(225);
  doc.line(mx, 100, ancho - mx, 100);

  // Datos generales del pedido
  autoTable(doc, {
    startY: 114,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2, textColor: [40, 40, 40] },
    body: [
      ['Cliente', order.cliente_nombre || '—', 'Fecha', fechaLegible(order)],
      ['WhatsApp', order.whatsapp || '—', 'Modalidad', modalidad(order)],
      ['Dirección', order.direccion_entrega || '—', 'N° Pedido', numeroPedido(order)],
    ],
    columnStyles: {
      0: { fontStyle: 'bold', textColor: GRIS_RGB, cellWidth: 66 },
      2: { fontStyle: 'bold', textColor: GRIS_RGB, cellWidth: 66 },
    },
  });

  // Artículos cotizados
  const items = itemsNormalizados(order);
  const cuerpo = items.length
    ? items.map((it) => [
        it.codigo ? `${it.producto}  (${it.codigo})` : it.producto,
        String(it.cantidad),
        formatoCop(it.unitario),
        formatoCop(it.subtotal),
      ])
    : [['No hay productos registrados en esta orden', '', '', '']];

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [['Producto', 'Cant.', 'Valor Unitario', 'Subtotal']],
    body: cuerpo,
    theme: 'grid',
    headStyles: { fillColor: AZUL_RGB, textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 5, textColor: [40, 40, 40] },
    columnStyles: {
      1: { halign: 'center', cellWidth: 46 },
      2: { halign: 'right', cellWidth: 96 },
      3: { halign: 'right', cellWidth: 96 },
    },
  });

  // Totales
  const filasTotales = resumenTotales(order);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3 },
    tableWidth: 200,
    margin: { left: ancho - mx - 200 },
    body: filasTotales.map(([etiqueta, valor]) => [etiqueta, formatoCop(valor)]),
    columnStyles: {
      0: { textColor: GRIS_RGB },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === filasTotales.length - 1) {
        data.cell.styles.fontSize = 11;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = AZUL_RGB;
      }
    },
  });

  // Pie de página en todas las hojas
  const paginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= paginas; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generado el ${fechaGeneracion()} · Página ${i} de ${paginas}`, ancho / 2, alto - 24, {
      align: 'center',
    });
  }

  doc.save(`Pedido_${nombreArchivo(order)}.pdf`);
};

export default exportPedidoToPdf;
