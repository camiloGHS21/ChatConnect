import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  construirDireccionTexto,
  formatearCoordenadas,
  tieneCoordenadas,
  urlBuscarDireccion,
  urlGoogleMaps,
} from '@/utils/geo';

/**
 * Muestra la ubicación del cliente en formato texto (ciudad / dirección)
 * y, si existen, sus coordenadas. Ambos casos son clicables y abren
 * Google Maps: el texto por dirección y las coordenadas por lat/lng.
 */
const ClienteUbicacion = ({ cliente = {} }) => {
  const conCoordenadas = tieneCoordenadas(cliente);
  const direccionTexto = construirDireccionTexto(cliente);
  const conTexto = Boolean(direccionTexto);

  const ciudad = cliente.ciudad && cliente.ciudad !== 'No especificada' ? cliente.ciudad : '';
  const direccion = cliente.direccion && cliente.direccion !== 'Sin dirección' ? cliente.direccion : '';

  if (!conTexto && !conCoordenadas) {
    return <span className="text-muted fs-11 fst-italic">Sin ubicación registrada</span>;
  }

  return (
    <div className="d-flex flex-column gap-1">
      {conTexto && (
        <a
          href={urlBuscarDireccion(direccionTexto)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none link-ubicacion"
          title={`Abrir "${direccionTexto}" en Google Maps`}
        >
          <div className="d-flex align-items-center gap-1 text-dark fs-12">
            <IconifyIcon icon="tabler:map-pin" className="text-danger fs-14" />
            <span className="fw-medium">
              {ciudad || 'Ver ubicación'}
              {cliente.departamento ? ` (${cliente.departamento})` : ''}
            </span>
          </div>
          {direccion && (
            <div
              className="text-muted fs-11 text-truncate"
              style={{ maxWidth: 200 }}
              title={direccion}
            >
              {direccion}
            </div>
          )}
        </a>
      )}

      {conCoordenadas && (
        <a
          href={urlGoogleMaps(cliente.latitud, cliente.longitud)}
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-flex align-items-center gap-1 text-primary text-decoration-none font-monospace fs-11"
          title="Abrir coordenadas en Google Maps"
        >
          <IconifyIcon icon="tabler:current-location" className="fs-13" />
          {formatearCoordenadas(cliente.latitud, cliente.longitud)}
        </a>
      )}
    </div>
  );
};

export default ClienteUbicacion;
