import React, { useState } from 'react';
import { Card, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ModalEditarNombre from './ModalEditarNombre';

const MarcasConfigTab = ({
  marcas = [],
  onUpdateName,
  onToggleStatus,
  onCreate,
  loading = false,
}) => {
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newNombre, setNewNombre] = useState('');

  const filtered = marcas.filter(m =>
    (m.nombre || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    onCreate(newNombre.trim());
    setNewNombre('');
    setShowCreate(false);
  };

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-transparent border-bottom py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <h5 className="card-title mb-0 fw-bold text-dark d-flex align-items-center">
            <IconifyIcon icon="bx:purchase-tag-alt" className="me-2 text-info fs-20" />
            Configuración de Marcas
          </h5>
          <small className="text-muted">Ajusta los nombres oficiales de las marcas comerciales en PostgreSQL</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <InputGroup size="sm" style={{ width: 220 }}>
            <InputGroup.Text className="bg-light text-muted border-end-0">
              <IconifyIcon icon="bx:search" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar marca..."
              className="border-start-0 ps-0"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button variant="info" size="sm" className="text-white" onClick={() => setShowCreate(true)}>
            <IconifyIcon icon="bx:plus" className="me-1" />
            Nueva Marca
          </Button>
        </div>
      </Card.Header>

      {showCreate && (
        <Card.Body className="bg-light-subtle border-bottom py-2">
          <Form onSubmit={handleCreateSubmit} className="d-flex align-items-center gap-2">
            <Form.Control
              size="sm"
              placeholder="Nombre de la nueva marca..."
              value={newNombre}
              onChange={e => setNewNombre(e.target.value)}
              autoFocus
              style={{ maxWidth: 350 }}
            />
            <Button size="sm" variant="success" type="submit" disabled={!newNombre.trim()}>
              Crear
            </Button>
            <Button size="sm" variant="light" onClick={() => { setShowCreate(false); setNewNombre(''); }}>
              Cancelar
            </Button>
          </Form>
        </Card.Body>
      )}

      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr className="fs-12 text-muted">
                <th style={{ width: 80 }} className="ps-3">ID</th>
                <th>Nombre de la Marca</th>
                <th style={{ width: 130 }} className="text-center">Estado</th>
                <th style={{ width: 110 }} className="text-end pe-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted fs-13">
                    No se encontraron marcas
                  </td>
                </tr>
              ) : (
                filtered.map(marca => (
                  <tr key={marca.id}>
                    <td className="ps-3 text-muted fs-13">#{marca.id}</td>
                    <td className="fw-semibold text-dark fs-14">{marca.nombre}</td>
                    <td className="text-center">
                      <Badge
                        bg={marca.estado === 'activo' ? 'success-subtle' : 'secondary-subtle'}
                        className={`text-${marca.estado === 'activo' ? 'success' : 'secondary'} px-2 py-1`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onToggleStatus && onToggleStatus(marca)}
                        title="Clic para alternar estado"
                      >
                        {marca.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="text-end pe-3">
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="py-1 px-2 fs-12 d-inline-flex align-items-center"
                        onClick={() => setEditingItem(marca)}
                        title="Editar nombre de marca"
                      >
                        <IconifyIcon icon="bx:edit-alt" className="me-1 fs-14" />
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>

      <ModalEditarNombre
        show={Boolean(editingItem)}
        item={editingItem}
        title="Editar Marca"
        label="Nombre de la Marca"
        onHide={() => setEditingItem(null)}
        onSave={(id, val) => {
          onUpdateName(id, val);
          setEditingItem(null);
        }}
        loading={loading}
      />
    </Card>
  );
};

export default MarcasConfigTab;
