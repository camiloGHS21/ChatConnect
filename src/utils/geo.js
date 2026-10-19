/**
 * Utilidades de geolocalización para el módulo de Clientes.
 * Normalizan el manejo de coordenadas (latitud/longitud) que llegan
 * desde PostgreSQL y los enlaces de Google Maps.
 */

/** Indica si el cliente trae latitud y longitud válidas. */
export const tieneCoordenadas = (cliente = {}) =>
  cliente.latitud !== null &&
  cliente.latitud !== undefined &&
  cliente.longitud !== null &&
  cliente.longitud !== undefined;

/** Arma la dirección en texto (dirección, ciudad, departamento) del cliente. */
export const construirDireccionTexto = (cliente = {}) =>
  [cliente.direccion, cliente.ciudad, cliente.departamento]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v && v !== 'Sin dirección' && v !== 'No especificada')
    .join(', ');

/** Formatea las coordenadas para mostrarlas como texto legible. */
export const formatearCoordenadas = (lat, lng) =>
  `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;

/** Enlace externo para abrir la ubicación (coordenadas) en Google Maps. */
export const urlGoogleMaps = (lat, lng) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/** Enlace externo para buscar una dirección en texto en Google Maps. */
export const urlBuscarDireccion = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/** Enlace de mapa embebido (iframe) sin necesidad de API key. */
export const urlMapaEmbebido = (lat, lng) =>
  `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
