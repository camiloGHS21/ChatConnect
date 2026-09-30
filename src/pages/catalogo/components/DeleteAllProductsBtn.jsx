import { useState } from 'react';
import { Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import productoService from '@/services/productoService';

/**
 * Botón y modal de confirmación para vaciar todos los productos del catálogo y WhatsApp.
 */
const DeleteAllProductsBtn = ({ disabled, onComplete, onError, onLoadingChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDeleteAll = async () => {
    setDeleting(true);
    onLoadingChange?.(true);
    try {
      const res = await productoService.eliminarTodosLosProductos();
      onComplete?.(res);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar todos los productos';
      onError?.(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setDeleting(false);
      onLoadingChange?.(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <Button
        variant="outline-danger"
        className="d-flex align-items-center"
        onClick={() => setShowModal(true)}
        disabled={disabled || deleting}
        title="Eliminar todos los productos de PostgreSQL y WhatsApp"
      >
        <IconifyIcon icon="bx:trash" className="me-1" />
        Borrar Todos
      </Button>

      <DeleteConfirmationModal
        show={showModal}
        onHide={() => !deleting && setShowModal(false)}
        onConfirm={handleConfirmDeleteAll}
        title="¿Eliminar TODOS los productos?"
        message="Se eliminarán permanentemente todos los productos de la base de datos PostgreSQL y se retirarán del catálogo de WhatsApp. Esta acción no se puede deshacer."
        confirmBtnText={deleting ? 'Eliminando...' : 'Sí, borrar todo'}
        cancelBtnText="Cancelar"
      />
    </>
  );
};

export default DeleteAllProductsBtn;
