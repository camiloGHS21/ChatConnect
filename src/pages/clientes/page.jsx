import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody, CardTitle, Button, Form, Spinner, Alert } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import clienteService from '@/services/clienteService';
import ClientesMetricsCards from './components/ClientesMetricsCards';
import ClientesTable from './components/ClientesTable';
import ClienteDetailModal from './components/ClienteDetailModal';
import ModalNuevoCliente from './components/ModalNuevoCliente';

const ClientesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listaClientes, setListaClientes] = useState([]);
  const [kpis, setKpis] = useState({
    total_clientes: 0,
    pedidos_formalizados: 0,
    ventas_whatsapp: 0,
    georreferenciados_porcentaje: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [clientesData, kpisData] = await Promise.all([
        clienteService.getClientes(1),
        clienteService.getKpis(1),
      ]);
      setListaClientes(Array.isArray(clientesData) ? clientesData : []);
      if (kpisData) setKpis(kpisData);
    } catch (err) {
      console.error('Error al cargar clientes desde PostgreSQL:', err);
      setError('No se pudieron cargar los datos de clientes desde el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const filteredClientes = listaClientes.filter((c) => {
    const term = searchTerm.toLowerCase();
    const coords =
      c.latitud !== null && c.latitud !== undefined && c.longitud !== null && c.longitud !== undefined
        ? `${c.latitud},${c.longitud}`
        : '';
    return (
      (c.nombre || '').toLowerCase().includes(term) ||
      (c.whatsapp || '').includes(searchTerm) ||
      (c.documento || '').toLowerCase().includes(term) ||
      (c.ciudad || '').toLowerCase().includes(term) ||
      coords.includes(searchTerm)
    );
  });

  const handleOpenDetail = async (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
    try {
      setLoadingDetail(true);
      const detail = await clienteService.getCliente(client.id, 1);
      setSelectedClient(detail);
    } catch (err) {
      console.error('Error al cargar detalle del cliente:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleClientSaved = (newClient) => {
    setListaClientes((prev) => [newClient, ...prev]);
    cargarDatos();
  };

  return (
    <>
      <PageMetaData title="Clientes WhatsApp - ChatConnect" />
      <PageBreadcrumb title="Gestión de Clientes" subName="CRM WhatsApp" />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="py-2 fs-13 mb-3">
          {error}
        </Alert>
      )}

      <ClientesMetricsCards kpis={kpis} />

      <Card className="border-0 shadow-sm">
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-transparent border-bottom">
          <div>
            <CardTitle as="h5" className="fw-bold mb-0">
              Directorio de Clientes WhatsApp
            </CardTitle>
            <span className="text-muted fs-12">
              Sincronizados en tiempo real desde PostgreSQL (public.tercero y public.pedido)
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="search-bar" style={{ minWidth: 260 }}>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre, WhatsApp, ciudad o coordenadas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-sm"
              />
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={cargarDatos}
              disabled={loading}
              title="Recargar datos de la BD"
            >
              <IconifyIcon icon="bx:refresh" className={loading ? 'bx-spin' : ''} />
            </Button>
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
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <div className="text-muted fs-13 mt-2">Cargando clientes de la base de datos...</div>
            </div>
          ) : (
            <ClientesTable
              clientes={filteredClientes}
              onOpenDetail={handleOpenDetail}
            />
          )}
        </CardBody>
      </Card>

      <ClienteDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        client={selectedClient}
        loading={loadingDetail}
      />

      <ModalNuevoCliente
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSave={handleClientSaved}
      />
    </>
  );
};

export default ClientesPage;
