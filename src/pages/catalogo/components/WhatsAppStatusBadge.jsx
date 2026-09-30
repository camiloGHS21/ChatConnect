import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Insignia de estado inteligente de sincronización con WhatsApp Meta.
 * Explica al usuario el estado de validación y cómo refrescar en el móvil.
 */
const WhatsAppStatusBadge = ({ status, fbId }) => {
  const isSynced = status === 'sincronizado' || !!fbId;
  const isPending = status === 'pendiente';
  const isError = status === 'error';

  if (isSynced) {
    return (
      <span
        className="badge bg-success-subtle text-success fs-10 d-inline-flex align-items-center"
        title="Enviado a Meta. Meta valida políticas en 2-10 min. Para verlo en tu celular, cierra y abre WhatsApp."
        style={{ cursor: 'help' }}
      >
        <IconifyIcon icon="bxl:whatsapp" className="me-1" />
        WhatsApp Aprobado
      </span>
    );
  }

  if (isPending) {
    return (
      <span
        className="badge bg-warning-subtle text-warning fs-10 d-inline-flex align-items-center"
        title="En cola de sincronización con Meta WhatsApp (tarda entre 2 y 10 minutos)"
        style={{ cursor: 'help' }}
      >
        <IconifyIcon icon="bx:time-five" className="me-1" />
        En Validación Meta
      </span>
    );
  }

  if (isError) {
    return (
      <span
        className="badge bg-danger-subtle text-danger fs-10 d-inline-flex align-items-center"
        title="Error al subir a Meta. Haz clic en el botón verde de WhatsApp para reintentar."
        style={{ cursor: 'help' }}
      >
        <IconifyIcon icon="bx:error-circle" className="me-1" />
        Error WhatsApp
      </span>
    );
  }

  return null;
};

export default WhatsAppStatusBadge;
