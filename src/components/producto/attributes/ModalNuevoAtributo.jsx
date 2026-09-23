import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';

const ModalNuevoAtributo = ({ show, onHide, onSave, existingAttributes = [] }) => {
  const initialForm = {
    nombre: '',
    descripcion: '',
    permite_multiples: true,
    genera_variante: true,
    obligatorio: false,
    componentes_rapidos: '',
  };
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');
    const name = form.nombre.trim();
    if (!name) {
      setError('Por favor ingresa el nombre del atributo.');
      return;
    }
    if (existingAttributes.some(a => a.nombre?.trim().toLowerCase() === name.toLowerCase())) {
      setError(`Ya existe un atributo con el nombre "${name}".`);
      return;
    }

    try {
      setLoading(true);
      const created = await productoService.crearAtributo({
        nombre: name,
        descripcion: form.descripcion.trim(),
        permite_multiples: form.permite_multiples,
        genera_variante: form.genera_variante,
        obligatorio: form.obligatorio,
        componentes_rapidos: form.componentes_rapidos.trim(),
      });

      const newAttr = {
        ...created,
        id_atributo: created.id,
        componentes: (created.componentes || []).map(c => ({
          ...c,
          id_atributo_componente: c.id,
        })),
      };

      onSave(newAttr);
      setForm(initialForm);
      onHide();
    } catch (err) {
      console.error('Error al guardar atributo en DB:', err);
      setError(err.response?.data?.message || 'Error al guardar el atributo en la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-16 fw-bold">
          <IconifyIcon icon="bx:customize" className="me-2 text-primary" />
          Crear Nuevo Atributo
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold fs-12">Nombre del Atributo *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: Calibre, Acabado, Voltaje"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold fs-12">Opciones / Componentes Iniciales</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: 1/2 pulgada, 3/4 pulgada, 1 pulgada (separados por coma)"
            value={form.componentes_rapidos}
            onChange={e => setForm({ ...form, componentes_rapidos: e.target.value })}
          />
        </Form.Group>

        <Row className="g-2 mb-3">
          <Col xs={6}>
            <Form.Check
              type="switch"
              id="switch-genera-variante"
              label="Genera Variantes"
              className="fs-12 fw-semibold"
              checked={form.genera_variante}
              onChange={e => setForm({ ...form, genera_variante: e.target.checked })}
            />
          </Col>
          <Col xs={6}>
            <Form.Check
              type="switch"
              id="switch-obligatorio"
              label="Obligatorio"
              className="fs-12 fw-semibold"
              checked={form.obligatorio}
              onChange={e => setForm({ ...form, obligatorio: e.target.checked })}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={!form.nombre.trim() || loading}>
          {loading ? 'Guardando...' : 'Guardar Atributo'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNuevoAtributo;
