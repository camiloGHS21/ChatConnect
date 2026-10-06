import spanishLocale from 'apexcharts/dist/locales/es.json';

export const spanishChartLocale = {
  locales: [spanishLocale],
  defaultLocale: 'es',
};

export const formatNumber = (value, options) => Number(value).toLocaleString('es-CO', options);
export const formatDate = (value) => new Date(value).toLocaleDateString('es-CO', {
  day: 'numeric', month: 'long', year: 'numeric',
});

export const statusLabel = (status) => ({
  Verified: 'Verificado', Pending: 'Pendiente', Blocked: 'Bloqueado',
  Cancelled: 'Cancelado', Processing: 'En proceso', Completed: 'Completado',
  Delivered: 'Entregado', Shipped: 'Despachado', Paid: 'Pagado',
  Unpaid: 'Sin pagar', Failed: 'Fallido', Success: 'Exitoso',
  OnHold: 'En espera', Onhold: 'En espera', 'Dr.': 'Débito', 'Cr.': 'Crédito',
  Dr: 'Débito', Cr: 'Crédito',
}[status] || status);

export const paymentMethodLabel = (method) => ({
  'Credit Card': 'Tarjeta de crédito', 'Debit Card': 'Tarjeta de débito',
  'Cash on Delivery': 'Pago contra entrega', 'Bank Transfer': 'Transferencia bancaria',
  Cash: 'Efectivo',
}[method] || method);
