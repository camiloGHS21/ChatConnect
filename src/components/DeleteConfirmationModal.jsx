import { Modal, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Modal reutilizable de confirmación para eliminar elementos en la plataforma Nodo.
 *
 * @param {boolean} show - Controla si el modal está visible o no.
 * @param {function} onHide - Callback al cerrar o cancelar el modal.
 * @param {function} onConfirm - Callback al confirmar la eliminación.
 * @param {string} title - Título del modal (ej: "¿Eliminar proveedor?").
 * @param {string} message - Mensaje o descripción opcional.
 * @param {string} itemName - Nombre o etiqueta específica del elemento a eliminar.
 * @param {string} itemType - Tipo de elemento (ej: "proveedor", "lista de precios", "código de barras").
 * @param {string} confirmBtnText - Texto del botón de confirmación (por defecto: "Sí, eliminar").
 * @param {string} cancelBtnText - Texto del botón de cancelación (por defecto: "Cancelar").
 */
const DeleteConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title = '¿Confirmar eliminación?',
  message,
  itemName = '',
  itemType = '',
  confirmBtnText = 'Sí, eliminar',
  cancelBtnText = 'Cancelar'
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="sm"
      backdrop="static"
      className="fade"
      style={{ zIndex: 1060 }}
    >
      <Modal.Body className="text-center p-4">
        {/* Ícono animado de advertencia / papelera con fondo suave */}
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger shadow-sm"
          style={{ width: '60px', height: '60px' }}
        >
          <IconifyIcon icon="bx:trash" className="fs-30 text-danger" />
        </div>

        {/* Título de la acción */}
        <h5 className="fs-16 fw-bold text-body-emphasis mb-2">
          {title}
        </h5>

        {/* Mensaje descriptivo */}
        <p className="text-muted fs-13 mb-3">
          {message || (
            <>
              ¿Estás seguro de que deseas eliminar {itemType ? `este ${itemType}` : 'este elemento'}?
              Esta acción no se puede deshacer.
            </>
          )}
        </p>

        {/* Detalle o nombre del ítem a eliminar */}
        {itemName && (
          <div className="bg-body-tertiary border border-danger-subtle py-2 px-3 mb-3 rounded-2 text-body fs-12 fw-semibold text-truncate text-start d-flex align-items-center gap-2">
            <IconifyIcon icon="bx:error-circle" className="text-danger fs-16 flex-shrink-0" />
            <span className="text-truncate">{itemName}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Button
            variant="outline-secondary"
            size="sm"
            className="px-3 fw-semibold border"
            onClick={onHide}
          >
            {cancelBtnText}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="px-3 fw-semibold d-flex align-items-center gap-1 shadow-sm"
            onClick={() => {
              if (onConfirm) onConfirm();
              if (onHide) onHide();
            }}
          >
            <IconifyIcon icon="bx:trash" />
            {confirmBtnText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmationModal;
