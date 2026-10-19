/**
 * ============================================================================
 * FORMATO COMPARTIDO DE PEDIDOS (PDF / Excel)
 * ============================================================================
 * Constantes y utilidades puras reutilizadas por los exportadores de pedidos.
 */

export const EMPRESA = 'ChatConnect';
export const ESLOGAN = 'Gestión de Pedidos · WhatsApp Cloud API';

/** Colores en formato RGB (para jsPDF) y ARGB (para ExcelJS). */
export const AZUL_RGB = [41, 98, 255];
export const AZUL_HEX = 'FF2962FF';
export const GRIS_RGB = [110, 110, 110];
export const TEXTO_HEX = 'FF1F2937';
export const GRIS_TEXTO_HEX = 'FF6B7280';
export const BORDE_HEX = 'FFD3DAE6';
export const AZUL_CLARO_HEX = 'FFEFF4FF';

const ESTADOS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  despachado: 'Despachado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

/** Colores de fondo y texto por estado (para las celdas de Excel). */
export const ESTADO_COLORES = {
  entregado: { fondo: 'FFE6F4EA', texto: 'FF1E7B34' },
  despachado: { fondo: 'FFE8F0FE', texto: 'FF1A56DB' },
  en_preparacion: { fondo: 'FFE7F6F9', texto: 'FF0E7490' },
  confirmado: { fondo: 'FFFFF4E5', texto: 'FF92400E' },
  cancelado: { fondo: 'FFFDE8E8', texto: 'FFB91C1C' },
  default: { fondo: 'FFF1F2F4', texto: 'FF4B5563' },
};

export const datosEmpresaDocumento = (empresa = {}) => ({
  nombreComercial: empresa.nombre_comercial || empresa.nombre || 'Empresa',
  razonSocial: empresa.razon_social || '—',
  nit: empresa.nit || '—',
  direccion: [empresa.direccion, empresa.ciudad, empresa.departamento].filter(Boolean).join(', ') || '—',
});

export const estadoLabel = (estado) => ESTADOS[estado] || 'Pendiente';

export const coloresEstado = (estado) => ESTADO_COLORES[estado] || ESTADO_COLORES.default;

export const formatoCop = (valor) => `$${Number(valor || 0).toLocaleString('es-CO')}`;

export const numeroPedido = (order) => order.numero_pedido || `#${order.id}`;

export const nombreArchivo = (order) =>
  String(numeroPedido(order)).replace(/[^a-z0-9_-]+/gi, '_') || `pedido_${order.id}`;

export const fechaLegible = (order) => {
  const raw = order.created_at || order.fecha;
  const d = raw ? new Date(raw) : null;
  if (!d || Number.isNaN(d.getTime())) return order.fecha || '—';
  return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
};

export const fechaGeneracion = () => new Date().toLocaleString('es-CO');

export const modalidad = (order) =>
  order.tipo_entrega === 'domicilio' ? 'Envío a domicilio' : 'Retiro en tienda';

export const itemsNormalizados = (order) =>
  (order.items || []).map((it) => ({
    producto: it.producto || `Producto #${it.producto_id || ''}`,
    codigo: it.codigo || '',
    cantidad: Number(it.cantidad || 0),
    unitario: Number(it.unitario ?? it.precio_unitario ?? 0),
    subtotal: Number(it.subtotal ?? it.total ?? 0),
  }));

/** Devuelve el desglose de totales como pares [etiqueta, valor numérico]. */
export const resumenTotales = (order) => {
  const filas = [['Subtotal', Number(order.subtotal || 0)]];
  if (Number(order.descuento)) filas.push(['Descuento', -Number(order.descuento)]);
  if (Number(order.impuesto)) filas.push(['IVA / Impuesto', Number(order.impuesto)]);
  if (Number(order.envio)) filas.push(['Envío', Number(order.envio)]);
  filas.push(['Total', Number(order.total || 0)]);
  return filas;
};
