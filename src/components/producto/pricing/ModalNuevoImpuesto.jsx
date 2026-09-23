import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';

const ModalNuevoImpuesto = ({
  show,
  onHide,
  target, // 'compra' | 'venta'
  onSave,
  existingTaxes = [],
}) => {
  const [form, setForm] = useState({
    nombre: '',
    tipo_calculo: 'PORCENTAJE',
    porcentaje: 19,
    valor_fijo: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');
    const name = form.nombre.trim();
    if (!name) return;
    if (existingTaxes.some(t => t.nombre?.trim().toLowerCase() === name.toLowerCase())) {
      setError(`Ya existe un impuesto con el nombre "${name}".`);
      return;
    }
    try {
      setLoading(true);
      const isPorc = form.tipo_calculo === 'PORCENTAJE';
      const created = await productoService.crearImpuesto({
        nombre: name,
        tipo_calculo: form.tipo_calculo,
        porcentaje: isPorc ? parseFloat(form.porcentaje) || 0 : 0,
        valor: !isPorc ? parseFloat(form.valor_fijo) || 0 : 0,
        tipo: form.tipo_calculo,
      });
      const newTax = {
        ...created,
        id: created.id,
        impuesto_id: created.id,
        tipo_calculo: created.tipo || form.tipo_calculo,
        porcentaje: parseFloat(created.porcentaje) || 0,
        valor_fijo: parseFloat(created.valor) || 0,
      };
      onSave(newTax, target);
      setForm({ nombre: '', tipo_calculo: 'PORCENTAJE', porcentaje: 19, valor_fijo: 0 });
      onHide();
    } catch (err) {
      console.error('Error al guardar impuesto en DB:', err);
      setError(err.response?.data?.message || 'Error al guardar el impuesto en la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-16 fw-bold">
          <IconifyIcon icon="bx:calculator" className="me-2 text-primary" />
          Crear Impuesto ({target === 'compra' ? 'Compra' : 'Venta'})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Nombre del Impuesto *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: Impuesto Ambiental Fijo, IVA 10%, etc."
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Modalidad de Cálculo</Form.Label>
          <Form.Select
            value={form.tipo_calculo}
            onChange={e => setForm({ ...form, tipo_calculo: e.target.value })}
          >
            <option value="PORCENTAJE">Porcentual (%) sobre la base</option>
            <option value="VALOR_FIJO">Valor Fijo ($) por unidad</option>
          </Form.Select>
        </Form.Group>

        {form.tipo_calculo === 'PORCENTAJE' ? (
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Tasa Porcentual (%)</Form.Label>
            <div className="input-group">
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={form.porcentaje}
                onChange={e => setForm({ ...form, porcentaje: e.target.value })}
              />
              <span className="input-group-text">%</span>
            </div>
          </Form.Group>
        ) : (
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Monto Fijo ($)</Form.Label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <Form.Control
                type="number"
                step="1"
                min="0"
                value={form.valor_fijo}
                onChange={e => setForm({ ...form, valor_fijo: e.target.value })}
              />
            </div>
            <Form.Text className="text-muted fs-12">
              Se suma de manera fija al costo o precio del producto.
            </Form.Text>
          </Form.Group>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={!form.nombre.trim() || loading}>
          {loading ? 'Guardando...' : 'Guardar y Asignar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNuevoImpuesto;
