import { useState } from 'react';
import { Card, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ModalEditarNombre from './ModalEditarNombre';

const ListasPreciosConfigTab = ({
  listasPrecios = [],
  onUpdateName,
  onToggleStatus,
  onCreate,
  onDelete,
  loading = false,
}) => {
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newNombre, setNewNombre] = useState('');

  const filtered = listasPrecios.filter(l =>
    (l.nombre || '').toLowerCase().includes(search.toLowerCase())
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
            <IconifyIcon icon="bx:list-ul" className="me-2 text-success fs-20" />
            Configuración de Listas de Precios
          </h5>
          <small className="text-muted">Ajusta o elimina listas de precios (sin productos asociados)</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <InputGroup size="sm" style={{ width: 220 }}>
            <InputGroup.Text className="bg-light text-muted border-end-0"><IconifyIcon icon="bx:search" /></InputGroup.Text>
            <Form.Control placeholder="Buscar lista..." className="border-start-0 ps-0" value={search} onChange={e => setSearch(e.target.value)} />
          </InputGroup>
          <Button variant="success" size="sm" onClick={() => setShowCreate(true)}>
            <IconifyIcon icon="bx:plus" className="me-1" />Nueva Lista
          </Button>
        </div>
      </Card.Header>

      {showCreate && (
        <Card.Body className="bg-light-subtle border-bottom py-2">
          <Form onSubmit={handleCreateSubmit} className="d-flex align-items-center gap-2">
            <Form.Control size="sm" placeholder="Nombre de lista (ej: Constructor)..." value={newNombre} onChange={e => setNewNombre(e.target.value)} autoFocus style={{ maxWidth: 350 }} />
            <Button size="sm" variant="success" type="submit" disabled={!newNombre.trim()}>Crear</Button>
            <Button size="sm" variant="light" onClick={() => { setShowCreate(false); setNewNombre(''); }}>Cancelar</Button>
          </Form>
        </Card.Body>
      )}

      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr className="fs-12 text-muted">
                <th style={{ width: 70 }} className="ps-3">ID</th>
                <th>Nombre de la Lista de Precios</th>
                <th style={{ width: 110 }} className="text-center">Productos</th>
                <th style={{ width: 100 }} className="text-center">Estado</th>
                <th style={{ width: 100 }} className="text-end pe-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-muted fs-13">No se encontraron listas de precios</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id}>
                    <td className="ps-3 text-muted fs-13">#{item.id}</td>
                    <td className="fw-semibold text-dark fs-14">{item.nombre}</td>
                    <td className="text-center">
                      <Badge bg={item.total_productos > 0 ? 'success-subtle' : 'secondary-subtle'} className={`text-${item.total_productos > 0 ? 'success' : 'muted'} px-2 py-1`}>
                        {item.total_productos || 0} prod.
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge
                        bg={item.estado === 'activo' ? 'success-subtle' : 'secondary-subtle'}
                        className={`text-${item.estado === 'activo' ? 'success' : 'secondary'} px-2 py-1`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onToggleStatus && onToggleStatus(item)}
                        title="Clic para alternar estado"
                      >
                        {item.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="text-end pe-3">
                      <div className="d-inline-flex gap-1">
                        <Button variant="outline-success" size="sm" className="py-1 px-2 fs-12" onClick={() => setEditingItem(item)} title="Editar lista">
                          <IconifyIcon icon="bx:edit-alt" className="fs-14" />
                        </Button>
                        <Button
                          variant={item.total_productos > 0 ? 'outline-secondary' : 'outline-danger'}
                          size="sm"
                          className="py-1 px-2 fs-12"
                          onClick={() => onDelete && onDelete(item)}
                          title={item.total_productos > 0 ? `Tiene ${item.total_productos} productos asociados` : 'Eliminar lista'}
                        >
                          <IconifyIcon icon="bx:trash" className="fs-14" />
                        </Button>
                      </div>
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
        title="Editar Lista de Precios"
        label="Nombre de la Lista"
        onHide={() => setEditingItem(null)}
        onSave={(id, val) => { onUpdateName(id, val); setEditingItem(null); }}
        loading={loading}
      />
    </Card>
  );
};

export default ListasPreciosConfigTab;
