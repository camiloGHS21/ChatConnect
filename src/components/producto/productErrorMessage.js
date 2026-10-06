// Heurística de idioma: admite identificadores técnicos dentro de mensajes españoles.
const isSpanishMessage = (message) => {
  if (typeof message !== 'string' || !message.trim()) return false;
  const normalized = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return /\b(el|la|los|las|un|una|de|del|para|por|ya|debe|deben|puede|puedes|existe|existen|minimo|maximo|intentalo|validacion|demasiado|faltan|revisa|insuficientes?|inexistentes?|(?:obligatori|requerid|invalid|duplicad|bloquead|permitid|caducad|agotad|incorrect|fallid|vaci|prohibid|encontrad|deshabilitad|cancelad|rechazad|autorizad|incomplet|intern)[oa]s?)\b/.test(normalized) ||
    /\bno (se|hay|es|son|tiene|tienes|permite)\b/.test(normalized);
};

const spanishMessage = (message) => {
  if (Array.isArray(message)) {
    return message.filter(isSpanishMessage).join('\n');
  }
  return isSpanishMessage(message) ? message : '';
};

/** Conserva detalles de negocio en español; no deduce causas a partir del estado HTTP. */
export const getProductErrorMessage = (error, fallback) => {
  const detail = spanishMessage(error?.response?.data?.message) || spanishMessage(error?.message);
  if (detail) return detail;

  const message = typeof error?.message === 'string' ? error.message.trim() : '';
  if (error?.code === 'ERR_NETWORK' || /^(network error|failed to fetch|network request failed)$/i.test(message)) {
    return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
  }
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || /^timeout of \d+ms exceeded$/i.test(message)) {
    return 'Se agotó el tiempo de espera de la solicitud. Inténtalo de nuevo.';
  }
  if (error?.code === 'ERR_CANCELED' || /^(canceled|cancelled|request aborted)$/i.test(message)) {
    return 'La solicitud fue cancelada.';
  }

  const status = error?.response?.status;
  if (status === 401) return 'La solicitud requiere autenticación. Inicia sesión para continuar.';
  if (status === 403) return 'El servidor no permite realizar esta operación.';
  if (status === 409) return `${fallback} El servidor informó de un conflicto al procesar la solicitud.`;
  if (status === 413) return 'El archivo o los datos enviados superan el tamaño permitido.';
  if (status === 429) return 'Se han realizado demasiadas solicitudes. Espera un momento e inténtalo de nuevo.';
  if (status >= 500 && status < 600) return `${fallback} Se produjo un error en el servidor al procesar la solicitud.`;
  return fallback;
};
