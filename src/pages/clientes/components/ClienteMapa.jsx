import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  construirDireccionTexto,
  formatearCoordenadas,
  tieneCoordenadas,
  urlBuscarDireccion,
  urlGoogleMaps,
  urlMapaEmbebido,
} from '@/utils/geo';

/**
 * Mapa embebido de la ubicación del cliente (sin necesidad de API key).
 * Si no hay coordenadas pero sí dirección en texto, ofrece buscarla en Maps.
 */
const ClienteMapa = ({ cliente = {} }) => {
  const conCoordenadas = tieneCoordenadas(cliente);
  const direccionTexto = construirDireccionTexto(cliente);

  if (!conCoordenadas) {
    return (
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 bg-light rounded p-3 fs-12">
        <span className="d-inline-flex align-items-center gap-2 text-muted">
          <IconifyIcon icon="tabler:map-pin-off" className="fs-20" />
          {direccionTexto || 'Este cliente no tiene dirección ni coordenadas registradas.'}
        </span>
        {direccionTexto && (
          <a
            href={urlBuscarDireccion(direccionTexto)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-soft-primary d-inline-flex align-items-center gap-1"
            title="Buscar la dirección en Google Maps"
          >
            <IconifyIcon icon="tabler:external-link" className="fs-14" />
            Buscar dirección en Google Maps
          </a>
        )}
      </div>
    );
  }

  const { latitud, longitud } = cliente;

  return (
    <div className="rounded overflow-hidden border">
      <iframe
        title={`Ubicación de ${cliente.nombre || 'cliente'}`}
        src={urlMapaEmbebido(latitud, longitud)}
        width="100%"
        height={220}
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 bg-light px-3 py-2">
        <span className="d-inline-flex align-items-center gap-1 font-monospace fs-12 text-dark">
          <IconifyIcon icon="tabler:current-location" className="text-primary fs-14" />
          {formatearCoordenadas(latitud, longitud)}
        </span>
        <a
          href={urlGoogleMaps(latitud, longitud)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-soft-primary d-inline-flex align-items-center gap-1"
          title="Abrir ubicación en Google Maps"
        >
          <IconifyIcon icon="tabler:external-link" className="fs-14" />
          Abrir en Google Maps
        </a>
      </div>
    </div>
  );
};

export default ClienteMapa;
