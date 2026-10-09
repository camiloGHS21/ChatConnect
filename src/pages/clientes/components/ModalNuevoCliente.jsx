import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import clienteService from '@/services/clienteService';
import productoService from '@/services/productoService';
import { calcularDvDian } from '@/components/producto/inventory/supplierUtils';

const INITIAL_CLIENTE_FORM = {
  tipo_persona: 'natural',
  nombre: '',
  apellido: '',
  razon_social: '',
  tipo_documento: 'CC',
  numero_documento: '',
  digito_verificacion: '',
  whatsapp: '',
  telefono: '',
  email: '',
  departamento: '',
  ciudad: '',
  id_departamento: '',
  id_ciudad: '',
  direccion: '',
};

const ModalNuevoCliente = ({ show, onHide, onSave }) => {
  const [form, setForm] = useState(INITIAL_CLIENTE_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  useEffect(() => {
    if (show) {
      setForm(INITIAL_CLIENTE_FORM);
      setError('');
      productoService.getDepartamentos()
        .then((data) => setDepartamentos(Array.isArray(data) ? data : []))
        .catch(() => setDepartamentos([]));
    }
  }, [show]);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleDocChange = (doc) => {
    const clean = doc.replace(/[^\d-]/g, '');
    const dv = form.tipo_documento === 'NIT' ? calcularDvDian(clean) : '';
    setForm((p) => ({ ...p, numero_documento: clean, digito_verificacion: dv }));
  };

  const handleDepartamentoChange = async (depId) => {
    const dep = departamentos.find((d) => String(d.id) === String(depId));
    setForm((p) => ({
      ...p,
      id_departamento: depId,
      departamento: dep?.nombre || '',
      id_ciudad: '',
      ciudad: '',
    }));
    if (depId) {
      try {
        const data = await productoService.getCiudades(depId);
        setCiudades(Array.isArray(data) ? data : []);
      } catch {
        setCiudades([]);
      }
    } else {
      setCiudades([]);
    }
  };

  const handleCiudadChange = (ciuId) => {
    const ciu = ciudades.find((c) => String(c.id) === String(ciuId));
    setForm((p) => ({
      ...p,
      id_ciudad: ciuId,
      ciudad: ciu?.nombre || '',
    }));
  };

  const handleSave = async () => {
    setError('');
    const esNatural = form.tipo_persona === 'natural';
    const nombre = form.nombre.trim();
    const apellido = form.apellido.trim();
    const razonSocial = form.razon_social.trim();

    if (esNatural && !nombre) {
      setError('Por favor ingresa el nombre del cliente.');
      return;
    }
    if (!esNatural && !razonSocial) {
      setError('Por favor ingresa la razón social del cliente.');
      return;
    }

    if (!form.whatsapp.trim()) {
      setError('Por favor ingresa el número de WhatsApp para contacto.');
      return;
    }

    try {
      setLoading(true);
      const created = await clienteService.crearCliente({
        tipo_persona: form.tipo_persona,
        nombre: esNatural ? nombre : null,
        apellido: esNatural ? apellido : null,
        razon_social: esNatural ? null : razonSocial,
        tipo_documento: form.tipo_documento,
        numero_documento: form.numero_documento || null,
        digito_verificacion: form.digito_verificacion || null,
        whatsapp: form.whatsapp.trim(),
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        id_departamento: form.id_departamento ? Number(form.id_departamento) : null,
        id_ciudad: form.id_ciudad ? Number(form.id_ciudad) : null,
        departamento: form.departamento || null,
        ciudad: form.ciudad || null,
        direccion: form.direccion.trim() || null,
      });

      if (onSave) onSave(created);
      onHide();
    } catch (err) {
      console.error('Error al guardar cliente en PostgreSQL:', err);
      const msg = err.response?.data?.message || err.message || 'Error al guardar cliente.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton closeLabel="Cerrar" className="py-2 px-3 border-bottom">
        <Modal.Title className="fs-15 fw-semibold text-body-emphasis">
          Registrar Nuevo Cliente WhatsApp
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="py-2 fs-12 mb-3">
            {error}
          </Alert>
        )}

        <Row className="g-3">
          <Col md={12}>
            <Form.Label className="fs-12 fw-medium mb-1">Tipo de Persona *</Form.Label>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="cliente-natural"
                name="tipo_persona"
                label="Persona Natural"
                checked={form.tipo_persona === 'natural'}
                onChange={() => update('tipo_persona', 'natural')}
              />
              <Form.Check
                type="radio"
                id="cliente-juridica"
                name="tipo_persona"
                label="Persona Jurídica (Empresa)"
                checked={form.tipo_persona === 'juridica'}
                onChange={() => update('tipo_persona', 'juridica')}
              />
            </div>
          </Col>

          {form.tipo_persona === 'natural' ? (
            <>
              <Col md={6}>
                <Form.Label className="fs-12 fw-medium mb-1">Nombres *</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Ej: Carlos Alberto"
                  value={form.nombre}
                  onChange={(e) => update('nombre', e.target.value)}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fs-12 fw-medium mb-1">Apellidos</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Ej: Pérez Gómez"
                  value={form.apellido}
                  onChange={(e) => update('apellido', e.target.value)}
                />
              </Col>
            </>
          ) : (
            <Col md={12}>
              <Form.Label className="fs-12 fw-medium mb-1">Razón Social *</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="Ej: Constructora del Eje S.A.S."
                value={form.razon_social}
                onChange={(e) => update('razon_social', e.target.value)}
              />
            </Col>
          )}

          <Col md={4}>
            <Form.Label className="fs-12 fw-medium mb-1">Tipo Documento</Form.Label>
            <Form.Select
              size="sm"
              value={form.tipo_documento}
              onChange={(e) => update('tipo_documento', e.target.value)}
            >
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="NIT">NIT</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="PP">Pasaporte</option>
              <option value="TI">Tarjeta de Identidad</option>
            </Form.Select>
          </Col>

          <Col md={form.tipo_documento === 'NIT' ? 5 : 8}>
            <Form.Label className="fs-12 fw-medium mb-1">Número Documento</Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder="Ej: 1088123456"
              value={form.numero_documento}
              onChange={(e) => handleDocChange(e.target.value)}
            />
          </Col>

          {form.tipo_documento === 'NIT' && (
            <Col md={3}>
              <Form.Label className="fs-12 fw-medium mb-1">DV</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                readOnly
                placeholder="DV"
                value={form.digito_verificacion}
                className="bg-light text-center font-monospace"
              />
            </Col>
          )}

          <Col md={6}>
            <Form.Label className="fs-12 fw-medium mb-1">WhatsApp Móvil *</Form.Label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-success">
                <IconifyIcon icon="bxl:whatsapp" />
              </span>
              <Form.Control
                type="text"
                placeholder="Ej: 573123456789"
                value={form.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
              />
            </div>
            <Form.Text className="fs-11 text-muted">Incluye código de país si es posible (Ej: 57)</Form.Text>
          </Col>

          <Col md={6}>
            <Form.Label className="fs-12 fw-medium mb-1">Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              size="sm"
              placeholder="cliente@ejemplo.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </Col>

          <Col md={6}>
            <Form.Label className="fs-12 fw-medium mb-1">Departamento</Form.Label>
            <Form.Select
              size="sm"
              value={form.id_departamento}
              onChange={(e) => handleDepartamentoChange(e.target.value)}
            >
              <option value="">Selecciona departamento...</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6}>
            <Form.Label className="fs-12 fw-medium mb-1">Ciudad</Form.Label>
            <Form.Select
              size="sm"
              value={form.id_ciudad}
              onChange={(e) => handleCiudadChange(e.target.value)}
              disabled={!form.id_departamento}
            >
              <option value="">Selecciona ciudad...</option>
              {ciudades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={12}>
            <Form.Label className="fs-12 fw-medium mb-1">Dirección de Entrega</Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder="Ej: Carrera 7 # 14-25, Barrio Centro"
              value={form.direccion}
              onChange={(e) => update('direccion', e.target.value)}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="py-2 px-3">
        <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="success" size="sm" onClick={handleSave} disabled={loading} className="d-flex align-items-center gap-1">
          {loading && <Spinner size="sm" animation="border" />}
          <IconifyIcon icon="bx:save" />
          Guardar Cliente
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNuevoCliente;
