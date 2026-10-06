import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { getProductErrorMessage } from '../productErrorMessage';

/**
 * Modales rápidos de creación de Categoría, Subcategoría y Marca al vuelo.
 */
const GeneralQuickModals = ({
  categoryModal,
  setCategoryModal,
  onSaveCategory,
  subcategoryModal,
  setSubcategoryModal,
  onSaveSubcategory,
  brandModal,
  setBrandModal,
  onSaveBrand,
  currentCategoryName
}) => {
  const [catName, setCatName] = useState('');
  const [subName, setSubName] = useState('');
  const [brName, setBrName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (fn, name, resetFn, closeFn) => {
    if (!name.trim() || loading) return;
    setError('');
    try {
      setLoading(true);
      await fn(name.trim());
      resetFn('');
      closeFn(false);
    } catch (err) {
      console.error('No se pudo guardar el registro:', err);
      setError(getProductErrorMessage(err, 'No se pudo guardar el registro.'));
    } finally {
      setLoading(false);
    }
  };

  const submitCategory = () => handleAction(onSaveCategory, catName, setCatName, setCategoryModal);
  const submitSubcategory = () => handleAction(onSaveSubcategory, subName, setSubName, setSubcategoryModal);
  const submitBrand = () => handleAction(onSaveBrand, brName, setBrName, setBrandModal);

  const handleKeyDown = (e, submitFn) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitFn();
    }
  };

  const closeReset = (closeFn) => {
    if (loading) return;
    setError('');
    closeFn(false);
  };

  return (
    <>
      {/* Modal Nueva Categoría */}
      <Modal show={categoryModal} onHide={() => closeReset(setCategoryModal)} centered size="sm" style={{ '--bs-modal-bg': 'var(--bs-body-bg)', '--bs-modal-color': 'var(--bs-body-color)', '--bs-modal-border-color': 'var(--bs-border-color)', '--bs-modal-header-border-color': 'var(--bs-border-color)', '--bs-modal-footer-border-color': 'var(--bs-border-color)' }}>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title className="fs-15 fw-bold">Nueva Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" className="py-1 px-2 fs-12 mb-2">{error}</Alert>}
          <Form.Group controlId="nueva-categoria-nombre">
            <Form.Label className="fs-13 fw-semibold">Nombre de la Categoría</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Herramientas Neumáticas"
              value={catName}
              onChange={e => setCatName(e.target.value)}
              onKeyDown={e => handleKeyDown(e, submitCategory)}
              disabled={loading}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => closeReset(setCategoryModal)} disabled={loading}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={submitCategory} disabled={loading || !catName.trim()}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Nueva Subcategoría */}
      <Modal show={subcategoryModal} onHide={() => closeReset(setSubcategoryModal)} centered size="sm" style={{ '--bs-modal-bg': 'var(--bs-body-bg)', '--bs-modal-color': 'var(--bs-body-color)', '--bs-modal-border-color': 'var(--bs-border-color)', '--bs-modal-header-border-color': 'var(--bs-border-color)', '--bs-modal-footer-border-color': 'var(--bs-border-color)' }}>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title className="fs-15 fw-bold">Nueva Subcategoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" className="py-1 px-2 fs-12 mb-2">{error}</Alert>}
          <div className="mb-2 text-muted fs-12">
            Categoría Padre: <strong className="text-body">{currentCategoryName || 'Categoría actual'}</strong>
          </div>
          <Form.Group controlId="nueva-subcategoria-nombre">
            <Form.Label className="fs-13 fw-semibold">Nombre de la Subcategoría</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Compresores"
              value={subName}
              onChange={e => setSubName(e.target.value)}
              onKeyDown={e => handleKeyDown(e, submitSubcategory)}
              disabled={loading}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => closeReset(setSubcategoryModal)} disabled={loading}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={submitSubcategory} disabled={loading || !subName.trim()}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Nueva Marca */}
      <Modal show={brandModal} onHide={() => closeReset(setBrandModal)} centered size="sm" style={{ '--bs-modal-bg': 'var(--bs-body-bg)', '--bs-modal-color': 'var(--bs-body-color)', '--bs-modal-border-color': 'var(--bs-border-color)', '--bs-modal-header-border-color': 'var(--bs-border-color)', '--bs-modal-footer-border-color': 'var(--bs-border-color)' }}>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title className="fs-15 fw-bold">Nueva Marca</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" className="py-1 px-2 fs-12 mb-2">{error}</Alert>}
          <Form.Group controlId="nueva-marca-nombre">
            <Form.Label className="fs-13 fw-semibold">Nombre de la Marca</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Milwaukee"
              value={brName}
              onChange={e => setBrName(e.target.value)}
              onKeyDown={e => handleKeyDown(e, submitBrand)}
              disabled={loading}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => closeReset(setBrandModal)} disabled={loading}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={submitBrand} disabled={loading || !brName.trim()}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GeneralQuickModals;
