import { useState } from 'react';
import { Card, Table, Button, Form, Badge, InputGroup, Modal } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ImpuestosConfigTab = ({
  impuestos = [],
  onUpdateImpuesto,
  onToggleStatus,

  loading = false,
}) => {
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', tipo: 'PORCENTAJE', porcentaje: 0, valor: 0 });

  const filtered = impuestos.filter(i =>
    (i.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.codigo || '').toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (imp) => {
    setEditingItem(imp);
    setEditForm({
      nombre: imp.nombre,
      tipo: imp.tipo || 'PORCENTAJE',
      porcentaje: imp.porcentaje || 0,
      valor: imp.valor || 0,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateImpuesto(editingItem.id, editForm);
    setEditingItem(null);
  };

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-transparent border-bottom py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <h5 className="card-title mb-0 fw-bold text-dark d-flex align-items-center">
            <IconifyIcon icon="bx:receipt" className="me-2 text-warning fs-20" />
            Configuración de Impuestos y Tasas
          </h5>
          <small className="text-muted">Ajusta los nombres y porcentajes de los impuestos aplicables en PostgreSQL</small>
        </div>
        <InputGroup size="sm" style={{ width: 240 }}>
          <InputGroup.Text className="bg-light text-muted border-end-0">
            <IconifyIcon icon="bx:search" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Buscar por nombre o código..."
            className="border-start-0 ps-0"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </InputGroup>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr className="fs-12 text-muted">
                <th style={{ width: 70 }} className="ps-3">ID</th>
                <th style={{ width: 100 }}>Código</th>
                <th>Nombre del Impuesto</th>
                <th style={{ width: 130 }}>Tasa / Valor</th>
                <th style={{ width: 120 }} className="text-center">Estado</th>
                <th style={{ width: 100 }} className="text-end pe-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(imp => (
                <tr key={imp.id}>
                  <td className="ps-3 text-muted fs-13">#{imp.id}</td>
                  <td><Badge bg="secondary-subtle" className="text-secondary">{imp.codigo}</Badge></td>
                  <td className="fw-semibold text-dark fs-14">{imp.nombre}</td>
                  <td className="fw-bold fs-13 text-primary">
                    {imp.tipo === 'VALOR_FIJO' ? `$${Number(imp.valor || 0).toLocaleString('es-CO')}` : `${Number(imp.porcentaje).toLocaleString('es-CO')}%`}
                  </td>
                  <td className="text-center">
                    <Badge
                      bg={imp.estado === 'activo' ? 'success-subtle' : 'secondary-subtle'}
                      className={`text-${imp.estado === 'activo' ? 'success' : 'secondary'} px-2 py-1`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onToggleStatus && onToggleStatus(imp)}
                      title="Alternar estado"
                    >
                      {imp.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="text-end pe-3">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="py-1 px-2 fs-12 d-inline-flex align-items-center"
                      onClick={() => startEdit(imp)}
                    >
                      <IconifyIcon icon="bx:edit-alt" className="me-1 fs-14" />
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>

      <Modal show={Boolean(editingItem)} onHide={() => setEditingItem(null)} centered>
        <Modal.Header closeButton closeLabel="Cerrar" className="py-2 border-bottom">
          <Modal.Title className="fs-15 fw-semibold text-dark">Editar Impuesto: {editingItem?.nombre}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-3">
              <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Nombre del Impuesto *</Form.Label>
              <Form.Control
                type="text"
                value={editForm.nombre}
                onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Porcentaje (%)</Form.Label>
              <Form.Control
                type="number"
                step="any"
                value={editForm.porcentaje}
                onChange={e => setEditForm(p => ({ ...p, porcentaje: parseFloat(e.target.value) || 0 }))}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="light" size="sm" onClick={() => setEditingItem(null)}>Cancelar</Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>Guardar Cambios</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
};

export default ImpuestosConfigTab;
