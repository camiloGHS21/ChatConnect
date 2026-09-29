import { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle, Button, Form } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ModalNuevoProveedor from '@/components/producto/inventory/ModalNuevoProveedor';
import { CHATCONNECT_CLIENTES, CHATCONNECT_PEDIDOS } from '@/assets/data/chatconnect-data';
import ClientesMetricsCards from './components/ClientesMetricsCards';
import ClientesTable from './components/ClientesTable';
import ClienteDetailModal from './components/ClienteDetailModal';

const ClientesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listaClientes, setListaClientes] = useState(CHATCONNECT_CLIENTES);

  const filteredClientes = listaClientes.filter((c) =>
    (c.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.whatsapp || '').includes(searchTerm) ||
    (c.documento || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetail = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  const handleClientSaved = (newClient) => {
    const formatted = {
      id: newClient.id || Date.now(),
      nombre: newClient.tipo_persona === 'natural'
        ? `${newClient.nombre || ''} ${newClient.apellido || ''}`.trim()
        : (newClient.razon_social || newClient.nombre),
      email: newClient.email || 'sin-correo@cliente.com',
      whatsapp: newClient.celular || newClient.telefono || 'Sin WhatsApp',
      whatsapp_raw: (newClient.celular || '').replace(/\D/g, ''),
      documento: newClient.numero_documento || 'Sin doc',
      ciudad: newClient.ciudad || 'No especificada',
      departamento: newClient.departamento || '',
      direccion: newClient.direccion || 'Sin dirección',
      avatar: '/images/users/avatar-1.jpg',
      pedidos_count: 0,
      total_compras: 0,
    };
    setListaClientes(prev => [formatted, ...prev]);
  };

  const clientOrders = selectedClient
    ? CHATCONNECT_PEDIDOS.filter((p) => p.cliente_id === selectedClient.id)
    : [];

  return (
    <>
      <PageMetaData title="Clientes WhatsApp - ChatConnect" />
      <PageBreadcrumb title="Gestión de Clientes" subName="CRM WhatsApp" />

      <ClientesMetricsCards totalClientes={listaClientes.length} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-transparent border-bottom">
          <div>
            <CardTitle as="h5" className="fw-bold mb-0">
              Directorio de Clientes WhatsApp
            </CardTitle>
            <span className="text-muted fs-12">
              Sincronizados automáticamente mediante Meta Cloud API y PostgreSQL
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="search-bar" style={{ minWidth: 260 }}>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre, WhatsApp o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-sm"
              />
            </div>
            <Button
              variant="success"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => setShowCreateModal(true)}
            >
              <IconifyIcon icon="bx:user-plus" />
              Nuevo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <ClientesTable
            clientes={filteredClientes}
            onOpenDetail={handleOpenDetail}
          />
        </CardBody>
      </Card>

      <ClienteDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        client={selectedClient}
        orders={clientOrders}
      />

      <ModalNuevoProveedor
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSave={handleClientSaved}
        existingSuppliers={listaClientes}
      />
    </>
  );
};

export default ClientesPage;
