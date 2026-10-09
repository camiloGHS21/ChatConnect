import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import inventarioService from '@/services/inventarioService';

const ModalAjustarStock = ({ show, onHide, producto, onStockUpdated }) => {
  const [nuevaExistencia, setNuevaExistencia] = useState('');
  const [motivo, setMotivo] = useState('Ajuste manual de conteo físico');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (producto && show) {
      setNuevaExistencia(String(producto.existencia ?? 0));
      setMotivo('Ajuste manual de conteo físico');
      setError('');
    }
  }, [producto, show]);

  if (!producto) return null;

  const handleSave = async () => {
    setError('');
    const cant = parseInt(nuevaExistencia, 10);
    if (isNaN(cant) || cant < 0) {
      setError('Por favor ingresa un número entero mayor o igual a 0.');
      return;
    }

    try {
      setLoading(true);
      const updated = await inventarioService.ajustarStock(producto.id || producto.producto_id, cant, motivo, 1);
      if (onStockUpdated) onStockUpdated(updated);
      onHide();
    } catch (err) {
      console.error('Error al ajustar existencias en PostgreSQL:', err);
      const msg = err.response?.data?.message || err.message || 'Error al actualizar existencias.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const diferencia = (parseInt(nuevaExistencia, 10) || 0) - (producto.existencia || 0);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton closeLabel="Cerrar" className="py-2 px-3 border-bottom">
        <Modal.Title className="fs-15 fw-semibold text-body-emphasis">
          Ajustar Existencia en Bodega
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="py-2 fs-12 mb-3">
            {error}
          </Alert>
        )}

        <div className="p-2 mb-3 bg-light rounded">
          <div className="fw-bold text-dark fs-14">{producto.nombre}</div>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className="badge bg-secondary-subtle text-secondary font-monospace">
              {producto.sku}
            </span>
            <span className="text-muted fs-12">{producto.categoria}</span>
          </div>
          <div className="d-flex justify-content-between mt-2 pt-2 border-top fs-12">
            <span>Existencia actual: <strong>{producto.existencia} uds</strong></span>
            <span>Reservado WhatsApp: <strong className="text-warning">{producto.reservado} uds</strong></span>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="fs-12 fw-medium mb-1">
            Nueva Existencia Física (Unidades) *
          </Form.Label>
          <Form.Control
            type="number"
            min="0"
            step="1"
            value={nuevaExistencia}
            onChange={(e) => setNuevaExistencia(e.target.value)}
            className="fw-bold fs-16"
          />
          {diferencia !== 0 && !isNaN(diferencia) && (
            <Form.Text className={diferencia > 0 ? 'text-success fw-medium' : 'text-danger fw-medium'}>
              {diferencia > 0 ? `+${diferencia} uds (Entrada)` : `${diferencia} uds (Salida/Merma)`}
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label className="fs-12 fw-medium mb-1">Motivo / Observación del Ajuste</Form.Label>
          <Form.Select
            size="sm"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          >
            <option value="Ajuste manual de conteo físico">Ajuste manual de conteo físico</option>
            <option value="Entrada de mercancía / Proveedor">Entrada de mercancía / Proveedor</option>
            <option value="Merma o producto averiado">Merma o producto averiado</option>
            <option value="Devolución de cliente">Devolución de cliente</option>
            <option value="Corrección de inventario inicial">Corrección de inventario inicial</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="py-2 px-3">
        <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={loading}
          className="d-flex align-items-center gap-1"
        >
          {loading && <Spinner size="sm" animation="border" />}
          <IconifyIcon icon="bx:check" />
          Guardar Ajuste
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAjustarStock;
