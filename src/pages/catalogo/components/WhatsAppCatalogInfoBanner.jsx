import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Banner informativo sobre tiempos de validación de Meta y caché de WhatsApp móvil.
 */
const WhatsAppCatalogInfoBanner = () => {
  const [show, setShow] = useState(() => {
    return localStorage.getItem('hide_wa_catalog_info') !== 'true';
  });

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('hide_wa_catalog_info', 'true');
  };

  if (!show) return null;

  return (
    <Alert variant="info" className="d-flex align-items-start gap-2 mb-3 py-2 px-3 border-info-subtle bg-info-subtle text-dark fs-13">
      <IconifyIcon icon="bxl:whatsapp" className="fs-22 text-success flex-shrink-0 mt-1" />
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-dark">Sincronización con Catálogo de WhatsApp (Meta):</strong>
          <button
            type="button"
            className="btn-close fs-10 p-1"
            aria-label="Cerrar"
            onClick={handleDismiss}
            title="Ocultar aviso"
          />
        </div>
        <p className="mb-1 text-secondary">
          Meta revisa automáticamente cada producto e imagen (demora habitual: <strong>2 a 10 minutos</strong>).
        </p>
        <span className="text-muted d-block fs-12">
          💡 <strong>Consejo para ver cambios de inmediato:</strong> La aplicación de WhatsApp en el celular guarda el catálogo en caché. Para actualizarlo, <strong>cierra WhatsApp</strong> (desde las aplicaciones recientes) y ábrelo nuevamente.
        </span>
      </div>
    </Alert>
  );
};

export default WhatsAppCatalogInfoBanner;
