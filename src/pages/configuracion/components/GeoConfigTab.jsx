import React, { useState } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, Modal } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const GeoConfigTab = ({
  departamentos = [],
  ciudades = [],
  onCrearCiudad,
  onCrearDepartamento,
  loading = false,
}) => {
  const [selectedDeptoId, setSelectedDeptoId] = useState(departamentos[0]?.id || 1);
  const [showModalCiudad, setShowModalCiudad] = useState(false);
  const [showModalDepto, setShowModalDepto] = useState(false);
  const [ciudadForm, setCiudadForm] = useState({ nombre: '', codigo: '' });
  const [deptoForm, setDeptoForm] = useState({ nombre: '', codigo: '' });

  const activeDepto = departamentos.find(d => Number(d.id) === Number(selectedDeptoId)) || departamentos[0];
  const filteredCiudades = ciudades.filter(c => Number(c.id_departamento) === Number(activeDepto?.id));

  const handleSaveCiudad = (e) => {
    e.preventDefault();
    if (!ciudadForm.nombre.trim() || !activeDepto) return;
    onCrearCiudad({ id_departamento: activeDepto.id, ...ciudadForm });
    setCiudadForm({ nombre: '', codigo: '' });
    setShowModalCiudad(false);
  };

  const handleSaveDepto = (e) => {
    e.preventDefault();
    if (!deptoForm.nombre.trim()) return;
    onCrearDepartamento(deptoForm);
    setDeptoForm({ nombre: '', codigo: '' });
    setShowModalDepto(false);
  };

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-transparent border-bottom py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <h5 className="card-title mb-0 fw-bold text-dark d-flex align-items-center">
            <IconifyIcon icon="bx:map-pin" className="me-2 text-danger fs-20" />
            Catálogo Geográfico: Departamentos y Ciudades (Relación 1:N)
          </h5>
          <small className="text-muted">Estructura oficial para ubicación y registro de terceros en PostgreSQL</small>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={() => setShowModalDepto(true)}>
            + Departamento
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModalCiudad(true)}>
            + Ciudad en {activeDepto?.nombre || 'Dpto.'}
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-3">
        <Row className="g-3">
          <Col md={4} className="border-end">
            <h6 className="fw-bold fs-13 text-secondary mb-2">Departamentos (1)</h6>
            <div className="list-group rounded-2" style={{ maxHeight: 380, overflowY: 'auto' }}>
              {departamentos.map(d => (
                <button
                  key={d.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3 ${Number(d.id) === Number(activeDepto?.id) ? 'active fw-bold' : ''}`}
                  onClick={() => setSelectedDeptoId(d.id)}
                >
                  <span>{d.nombre}</span>
                  <Badge bg={Number(d.id) === Number(activeDepto?.id) ? 'light' : 'secondary'} className={Number(d.id) === Number(activeDepto?.id) ? 'text-primary' : ''}>
                    {d.codigo}
                  </Badge>
                </button>
              ))}
            </div>
          </Col>
          <Col md={8}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold fs-13 text-secondary mb-0">
                Ciudades de {activeDepto?.nombre} (Muchos: {filteredCiudades.length})
              </h6>
            </div>
            <div className="table-responsive border rounded-2" style={{ maxHeight: 380, overflowY: 'auto' }}>
              <Table hover className="align-middle mb-0">
                <thead className="table-light sticky-top">
                  <tr className="fs-12 text-muted">
                    <th style={{ width: 70 }}>ID</th>
                    <th style={{ width: 90 }}>Código</th>
                    <th>Nombre Ciudad</th>
                    <th style={{ width: 140 }}>ID Departamento</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCiudades.map(c => (
                    <tr key={c.id}>
                      <td className="text-muted fs-12">#{c.id}</td>
                      <td><Badge bg="light" className="text-dark border">{c.codigo}</Badge></td>
                      <td className="fw-semibold text-dark fs-13">{c.nombre}</td>
                      <td className="text-muted fs-12">id_depto: {c.id_departamento}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Card.Body>

      <Modal show={showModalCiudad} onHide={() => setShowModalCiudad(false)} centered>
        <Form onSubmit={handleSaveCiudad}>
          <Modal.Header closeButton><Modal.Title className="fs-15">Nueva Ciudad en {activeDepto?.nombre}</Modal.Title></Modal.Header>
          <Modal.Body className="py-2">
            <Form.Group className="mb-2">
              <Form.Label className="fs-12 fw-semibold">Nombre Ciudad *</Form.Label>
              <Form.Control required value={ciudadForm.nombre} onChange={e => setCiudadForm(p => ({ ...p, nombre: e.target.value }))} />
            </Form.Group>
            <Form.Group><Form.Label className="fs-12 fw-semibold">Código DANE (opcional)</Form.Label>
              <Form.Control value={ciudadForm.codigo} onChange={e => setCiudadForm(p => ({ ...p, codigo: e.target.value }))} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="light" size="sm" onClick={() => setShowModalCiudad(false)}>Cancelar</Button><Button variant="primary" size="sm" type="submit" disabled={loading}>Guardar</Button></Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModalDepto} onHide={() => setShowModalDepto(false)} centered>
        <Form onSubmit={handleSaveDepto}>
          <Modal.Header closeButton><Modal.Title className="fs-15">Nuevo Departamento</Modal.Title></Modal.Header>
          <Modal.Body className="py-2">
            <Form.Group className="mb-2">
              <Form.Label className="fs-12 fw-semibold">Nombre Departamento *</Form.Label>
              <Form.Control required value={deptoForm.nombre} onChange={e => setDeptoForm(p => ({ ...p, nombre: e.target.value }))} />
            </Form.Group>
            <Form.Group><Form.Label className="fs-12 fw-semibold">Código DANE</Form.Label>
              <Form.Control value={deptoForm.codigo} onChange={e => setDeptoForm(p => ({ ...p, codigo: e.target.value }))} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="light" size="sm" onClick={() => setShowModalDepto(false)}>Cancelar</Button><Button variant="primary" size="sm" type="submit" disabled={loading}>Guardar</Button></Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default GeoConfigTab;
