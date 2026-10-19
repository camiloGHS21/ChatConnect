import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useAuthContext } from '@/context/useAuthContext';
import empresaService from '@/services/empresaService';

const EMPTY_FORM = {
  razon_social: '', nombre_comercial: '', nit: '', sector: '', email: '',
  telefono: '', whatsapp: '', pais: 'Colombia', departamento: '', ciudad: '',
  direccion: '', categoria_producto_obligatoria: true,
};

const EmpresaConfigTab = () => {
  const { user: session, saveSession } = useAuthContext();
  const empresaId = Number(session?.user?.empresa_id || session?.empresa?.id || 1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const controller = new AbortController();
    empresaService.obtenerPerfil(empresaId)
      .then(data => {
        if (!controller.signal.aborted) {
          setForm({
            ...EMPTY_FORM,
            ...data,
            categoria_producto_obligatoria: data.categoria_producto_obligatoria !== false,
          });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFeedback({ type: 'danger', message: 'No se pudo cargar la información de la empresa.' });
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [empresaId]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: '', message: '' });
    if (!form.nombre_comercial.trim()) {
      setFeedback({ type: 'danger', message: 'El nombre comercial es obligatorio.' });
      return;
    }
    try {
      setSaving(true);
      const saved = await empresaService.actualizarPerfil(form, empresaId);
      setForm(prev => ({ ...prev, ...saved }));
      if (session) {
        saveSession({
          ...session,
          empresa: {
            ...session.empresa,
            ...saved,
            id: saved.id,
            nombre: saved.nombre_comercial,
          },
        });
      }
      setFeedback({ type: 'success', message: 'Información de la empresa guardada correctamente.' });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'No se pudo guardar la información de la empresa.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      {feedback.message && <Alert variant={feedback.type} className="py-2 fs-13">{feedback.message}</Alert>}

      <Card className="border-0 shadow-sm mb-3">
        <Card.Header className="bg-transparent border-bottom py-3">
          <h5 className="mb-1 fw-bold d-flex align-items-center">
            <IconifyIcon icon="bx:building-house" className="me-2 text-primary fs-20" />
            Identidad de la Empresa
          </h5>
          <small className="text-muted">Información legal y comercial que identifica tu negocio.</small>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="empresa-nombre-comercial">
                <Form.Label>Nombre Comercial *</Form.Label>
                <Form.Control value={form.nombre_comercial} onChange={e => update('nombre_comercial', e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="empresa-razon-social">
                <Form.Label>Razón Social</Form.Label>
                <Form.Control value={form.razon_social || ''} onChange={e => update('razon_social', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="empresa-nit">
                <Form.Label>NIT / Identificación Fiscal</Form.Label>
                <Form.Control value={form.nit || ''} onChange={e => update('nit', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group controlId="empresa-sector">
                <Form.Label>Sector Económico</Form.Label>
                <Form.Control placeholder="Ej: Ferretería y construcción" value={form.sector || ''} onChange={e => update('sector', e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Header className="bg-transparent border-bottom py-3">
          <h5 className="mb-1 fw-bold d-flex align-items-center">
            <IconifyIcon icon="bx:phone-call" className="me-2 text-success fs-20" />
            Información de Contacto
          </h5>
          <small className="text-muted">Canales oficiales para clientes, pedidos y comunicaciones.</small>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group controlId="empresa-email">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control type="email" value={form.email || ''} onChange={e => update('email', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="empresa-telefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control value={form.telefono || ''} onChange={e => update('telefono', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="empresa-whatsapp">
                <Form.Label>WhatsApp Empresarial</Form.Label>
                <Form.Control placeholder="Ej: 573001234567" value={form.whatsapp || ''} onChange={e => update('whatsapp', e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Header className="bg-transparent border-bottom py-3">
          <h5 className="mb-1 fw-bold d-flex align-items-center">
            <IconifyIcon icon="bx:map" className="me-2 text-info fs-20" />
            Ubicación y Preferencias
          </h5>
          <small className="text-muted">Dirección principal y reglas generales del catálogo.</small>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group controlId="empresa-pais">
                <Form.Label>País</Form.Label>
                <Form.Control value={form.pais || ''} onChange={e => update('pais', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="empresa-departamento">
                <Form.Label>Departamento / Estado</Form.Label>
                <Form.Control value={form.departamento || ''} onChange={e => update('departamento', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="empresa-ciudad">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control value={form.ciudad || ''} onChange={e => update('ciudad', e.target.value)} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="empresa-direccion">
                <Form.Label>Dirección Principal</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.direccion || ''} onChange={e => update('direccion', e.target.value)} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="empresa-categoria-obligatoria"
                label="Exigir una categoría al registrar productos"
                checked={Boolean(form.categoria_producto_obligatoria)}
                onChange={e => update('categoria_producto_obligatoria', e.target.checked)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end">
        <Button type="submit" variant="primary" disabled={saving} className="d-flex align-items-center gap-2 px-4">
          {saving ? <Spinner size="sm" animation="border" /> : <IconifyIcon icon="bx:save" />}
          {saving ? 'Guardando...' : 'Guardar Información de la Empresa'}
        </Button>
      </div>
    </Form>
  );
};

export default EmpresaConfigTab;
