// Traducciones de presentación: no modifican los datos ni los estados originales.
const translations = new Map([
  ['commented on admin panel "Wow 😍! this admin looks good and awesome design"', 'comentó en el panel de administración: «¡Guau 😍! Este panel se ve bien y tiene un diseño excelente»'],
  ['Hi, How are you? What about our next meeting', 'Hola, ¿cómo estás? ¿Qué hay de nuestra próxima reunión?'],
  ["Answered to your comment on the cash flow forecast's graph 🔔.", 'Respondió a tu comentario en el gráfico de previsión del flujo de caja 🔔.'],
  ['Commented on Admin', 'Comentó en el panel de administración'],
  ['Delivery processing your order is being shipped', 'Entrega en proceso: tu pedido está siendo enviado'],
  ['Report-Fix / Update', 'Corrección del informe / Actualización'],
  ['Project Status', 'Estado del proyecto'],
  ['Reback Application UI v2.0.0', 'UI de la aplicación Reback v2.0.0'],
  ['Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.', 'Accede a más de 20 páginas, incluidos un panel de control, gráficos, un tablero kanban, un calendario y páginas de pedidos anticipados, comercio electrónico y mercadotecnia.'],
  ['Alex Smith Attached Photos', 'Alex Smith adjuntó fotos'],
  ['Rebecca J. added a new team member', 'Rebecca J. añadió un nuevo integrante al equipo'],
  ['Added a new member to Front Dashboard', 'Se añadió un nuevo integrante al panel principal'],
  ['Achievements', 'Logros'],
  ['Earned a "Best Product Award"', 'Ganó el premio al mejor producto'],
  ['completed', 'Completado'],
  ['latest', 'Más reciente'],
  ['task', 'Tarea'],
  ['design', 'Diseño'],
  ['achievement', 'Logro'],
]);

export const translateTopbarText = text => translations.get(text) ?? text;
