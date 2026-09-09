import { useState } from 'react';
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { CHATCONNECT_CLIENTES, CHATCONNECT_PEDIDOS } from '@/assets/data/chatconnect-data';

const ClientesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredClientes = CHATCONNECT_CLIENTES.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.whatsapp.includes(searchTerm) ||
    c.documento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetail = (client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const clientOrders = selectedClient
    ? CHATCONNECT_PEDIDOS.filter((p) => p.cliente_id === selectedClient.id)
    : [];

  return (
    <>
      <PageMetaData title="Clientes WhatsApp - ChatConnect" />
      <PageBreadcrumb title="Gestión de Clientes" subName="CRM WhatsApp" />

      {/* Métricas rápidas */}
      <Row className="g-3 mb-3">
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-success-subtle text-success flex-centered">
                <IconifyIcon icon="bxl:whatsapp" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{CHATCONNECT_CLIENTES.length}</h4>
                <span className="text-muted fs-12">Clientes WhatsApp</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-primary-subtle text-primary flex-centered">
                <IconifyIcon icon="iconamoon:shopping-bag-duotone" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">57</h4>
                <span className="text-muted fs-12">Pedidos Formalizados</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-warning-subtle text-warning flex-centered">
                <IconifyIcon icon="tabler:currency-dollar" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">$26.9M</h4>
                <span className="text-muted fs-12">Ventas por WhatsApp</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-info-subtle text-info flex-centered">
                <IconifyIcon icon="tabler:map-pin" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">100%</h4>
                <span className="text-muted fs-12">Georreferenciados</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Clientes */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-transparent border-bottom">
          <div>
            <CardTitle as="h5" className="fw-bold mb-0">
              Directorio de Clientes WhatsApp
            </CardTitle>
            <span className="text-muted fs-12">
              Sincronizados automáticamente mediante Meta Cloud API
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
            <Button variant="success" size="sm" className="d-flex align-items-center gap-1">
              <IconifyIcon icon="bx:user-plus" />
              Nuevo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr className="fs-12 text-muted">
                  <th>Cliente</th>
                  <th>WhatsApp</th>
                  <th>Documento</th>
                  <th>Ubicación & Coordenadas</th>
                  <th>Total Pedidos</th>
                  <th>Volumen de Compras</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={cliente.avatar}
                          alt={cliente.nombre}
                          className="rounded-circle"
                          width={38}
                          height={38}
                        />
                        <div>
                          <div className="fw-semibold text-dark">{cliente.nombre}</div>
                          <span className="text-muted fs-11">{cliente.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${cliente.whatsapp_raw}`}
                        target="_blank"
                        rel="noreferrer"
                        className="d-flex align-items-center gap-1 text-success fw-medium text-decoration-none"
                      >
                        <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
                        {cliente.whatsapp}
                      </a>
                      <span className="badge bg-success-subtle text-success fs-10">Verificado</span>
                    </td>
                    <td className="text-muted fs-12">{cliente.documento}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-dark fs-12">
                        <IconifyIcon icon="tabler:map-pin" className="text-danger fs-14" />
                        {cliente.ciudad}
                      </div>
                      <div className="text-muted fs-11 text-truncate" style={{ maxWidth: 200 }}>
                        {cliente.direccion}
                      </div>
                    </td>
                    <td>
                      <Badge bg="primary-subtle" className="text-primary px-2 py-1">
                        {cliente.pedidos_count} órdenes
                      </Badge>
                    </td>
                    <td className="fw-bold text-dark fs-13">
                      ${cliente.total_compras.toLocaleString('es-CO')} COP
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end align-items-center gap-1">
                        <Button
                          variant="soft-primary"
                          size="sm"
                          className="btn-icon rounded-circle"
                          onClick={() => handleOpenDetail(cliente)}
                          title="Ver Ficha y Pedidos"
                        >
                          <IconifyIcon icon="bx:show" className="fs-16" />
                        </Button>
                        <Link
                          to="/chat"
                          className="btn btn-sm btn-soft-success btn-icon rounded-circle"
                          title="Abrir Chat en Vivo"
                        >
                          <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Modal Detalle del Cliente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-16">
            Ficha del Cliente: {selectedClient?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <>
              <Row className="g-3 mb-3 p-2 bg-light rounded">
                <Col md={4}>
                  <small className="text-muted">Teléfono WhatsApp</small>
                  <div className="fw-bold text-success">{selectedClient.whatsapp}</div>
                </Col>
                <Col md={4}>
                  <small className="text-muted">Identificación</small>
                  <div className="fw-bold">{selectedClient.documento}</div>
                </Col>
                <Col md={4}>
                  <small className="text-muted">Total Compras Históricas</small>
                  <div className="fw-bold text-primary">
                    ${selectedClient.total_compras.toLocaleString('es-CO')} COP
                  </div>
                </Col>
                <Col xs={12}>
                  <small className="text-muted">Dirección & Coordenadas GPS</small>
                  <div className="fw-medium">
                    {selectedClient.direccion} ({selectedClient.coordenadas})
                  </div>
                </Col>
              </Row>

              <h6 className="fw-bold mb-2">Historial de Pedidos WhatsApp</h6>
              {clientOrders.length > 0 ? (
                <Table size="sm" responsive className="table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>N° Pedido</th>
                      <th>Fecha</th>
                      <th>Tipo Entrega</th>
                      <th>Total COP</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientOrders.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-bold text-primary">{p.numero_pedido}</td>
                        <td>{p.fecha}</td>
                        <td>{p.tipo_entrega === 'domicilio' ? 'Domicilio' : 'Recogida'}</td>
                        <td className="fw-bold">${p.total.toLocaleString('es-CO')} COP</td>
                        <td>
                          <Badge bg="success-subtle" className="text-success">
                            {p.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted fs-12 mb-0">
                  No hay pedidos recientes registrados para este cliente.
                </p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Link to="/chat" className="btn btn-sm btn-success d-flex align-items-center gap-1">
            <IconifyIcon icon="bxl:whatsapp" />
            Iniciar Conversación
          </Link>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ClientesPage;
