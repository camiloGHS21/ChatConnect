/**
 * Overlay de pantalla completa que bloquea todas las acciones de la interfaz
 * durante operaciones críticas (subida, guardado, eliminación o sincronización con Meta WhatsApp).
 */
const FullPageLoader = ({
  show = false,
  title = 'Procesando operación...',
  message = 'Por favor espera un momento, estamos actualizando la base de datos y el catálogo de Meta WhatsApp.',
  badge = 'Sincronización con Meta WhatsApp en progreso',
}) => {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        cursor: 'wait',
        userSelect: 'none',
      }}
    >
      <div
        className="card border-0 shadow-lg text-center p-4"
        style={{
          maxWidth: '430px',
          width: '90%',
          borderRadius: '16px',
          background: 'var(--bs-card-bg, #ffffff)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div className="card-body p-2">
          <div className="position-relative d-inline-block mb-3">
            <div
              className="spinner-border text-success"
              style={{ width: '3.6rem', height: '3.6rem', borderWidth: '0.28rem' }}
              role="status"
            >
              <span className="visually-hidden">Cargando...</span>
            </div>
            <div
              className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
              style={{ width: '2rem', height: '2rem' }}
            >
              <i className="bx bxl-whatsapp text-success fs-24" />
            </div>
          </div>

          <h5 className="fw-bold mb-2 text-body-emphasis">{title}</h5>
          <p className="text-muted fs-13 mb-3">{message}</p>

          {badge && (
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-body-tertiary text-success fs-12 fw-medium border border-success-subtle">
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '0.5rem', height: '0.5rem' }} />
              {badge}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullPageLoader;
