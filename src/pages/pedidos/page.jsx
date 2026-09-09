import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Table, Badge, Button, Modal, Form, Dropdown } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { CHATCONNECT_PEDIDOS } from '@/assets/data/chatconnect-data';

const getStatusBadge = (estado) => {
  switch (estado) {
    case 'entregado':
      return <Badge bg="success-subtle" className="text-success px-2 py-1">Entregado</Badge>;
    case 'despachado':
      return <Badge bg="primary-subtle" className="text-primary px-2 py-1">Despachado</Badge>;
    case 'en_preparacion':
      return <Badge bg="info-subtle" className="text-info px-2 py-1">En Preparación</Badge>;
    case 'confirmado':
      return <Badge bg="warning-subtle" className="text-warning px-2 py-1">Confirmado</Badge>;
    default:
      return <Badge bg="secondary-subtle" className="text-secondary px-2 py-1">Pendiente</Badge>;
  }
};

const PedidosPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orders, setOrders] = useState(CHATCONNECT_PEDIDOS);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.estado === statusFilter;
    const matchesSearch =
      o.numero_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.whatsapp.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const totalVentas = orders.reduce((acc, o) => acc + o.total, 0);
  const totalEntregados = orders.filter((o) => o.estado === 'entregado').length;
  const totalDespachados = orders.filter((o) => o.estado === 'despachado').length;
  const totalEnPrep = orders.filter((o) => o.estado === 'en_preparacion').length;

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, estado: newStatus } : ord))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, estado: newStatus }));
    }
  };

  const handleNotificarDespachoChat = (order) => {
    // Si la orden no está entregada, la marcamos como despachada según el flujo SRS
    if (order.estado !== 'entregado') {
      handleUpdateStatus(order.id, 'despachado');
    }
    // Redirigir a la consola interna de WhatsApp
    navigate(`/chat?clienteId=${order.cliente_id}&pedido=${order.numero_pedido}&action=despachado`);
  };

  return (
    <>
      <PageMetaData title="Pedidos WhatsApp - ChatConnect" />
      <PageBreadcrumb title="Gestión de Pedidos" subName="Órdenes WhatsApp Meta Cloud API" />

      {/* KPI Cards de Pedidos */}
      <Row className="g-3 mb-3">
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-primary-subtle text-primary flex-centered">
                <IconifyIcon icon="iconamoon:shopping-bag-duotone" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{orders.length}</h4>
                <span className="text-muted fs-12">Total Pedidos WhatsApp</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-warning-subtle text-warning flex-centered">
                <IconifyIcon icon="iconamoon:clock-duotone" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-warning">{totalEnPrep + totalDespachados}</h4>
                <span className="text-muted fs-12">En Curso / Despachados</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-success-subtle text-success flex-centered">
                <IconifyIcon icon="iconamoon:check-circle-1-duotone" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-success">{totalEntregados}</h4>
                <span className="text-muted fs-12">Entregados con Éxito</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-info-subtle text-info flex-centered">
                <IconifyIcon icon="tabler:currency-dollar" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-info">
                  ${(totalVentas / 1000000).toFixed(1)}M COP
                </h4>
                <span className="text-muted fs-12">Facturación Total</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Pedidos */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-transparent border-bottom">
          <div>
            <CardTitle as="h5" className="fw-bold mb-0">
              Listado de Órdenes Formalizadas
            </CardTitle>
            <span className="text-muted fs-12">
              Flujo de compra automatizado: Carrito WhatsApp ➔ Confirmación ➔ Despacho
            </span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="btn-group btn-group-sm">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline-light'}
                className={statusFilter === 'all' ? 'text-white' : 'text-dark'}
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'en_preparacion' ? 'info' : 'outline-light'}
                className={statusFilter === 'en_preparacion' ? 'text-white' : 'text-dark'}
                onClick={() => setStatusFilter('en_preparacion')}
              >
                Preparación
              </Button>
              <Button
                variant={statusFilter === 'despachado' ? 'primary' : 'outline-light'}
                className={statusFilter === 'despachado' ? 'text-white' : 'text-dark'}
                onClick={() => setStatusFilter('despachado')}
              >
                Despachados
              </Button>
              <Button
                variant={statusFilter === 'entregado' ? 'success' : 'outline-light'}
                className={statusFilter === 'entregado' ? 'text-white' : 'text-dark'}
                onClick={() => setStatusFilter('entregado')}
              >
                Entregados
              </Button>
            </div>

            <div className="search-bar" style={{ minWidth: 240 }}>
              <Form.Control
                type="text"
                placeholder="Buscar pedido, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light fs-12 text-muted">
                <tr>
                  <th>N° Pedido</th>
                  <th>Cliente & Contacto</th>
                  <th>Fecha</th>
                  <th>Modalidad & Destino</th>
                  <th>Total COP</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <span className="font-monospace fw-bold text-primary fs-13">
                        {ord.numero_pedido}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{ord.cliente_nombre}</div>
                      <span
                        role="button"
                        onClick={() => navigate(`/chat?clienteId=${ord.cliente_id}`)}
                        className="text-success fs-11 text-decoration-none d-flex align-items-center gap-1 cursor-pointer"
                        title="Abrir conversación en Consola WhatsApp"
                        style={{ cursor: 'pointer' }}
                      >
                        <IconifyIcon icon="bxl:whatsapp" />
                        {ord.whatsapp}
                      </span>
                    </td>
                    <td className="text-muted fs-12">{ord.fecha}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1 fs-12">
                        <IconifyIcon
                          icon={ord.tipo_entrega === 'domicilio' ? 'mdi:truck-delivery' : 'mdi:store'}
                          className={ord.tipo_entrega === 'domicilio' ? 'text-primary' : 'text-secondary'}
                        />
                        <span className="fw-medium">
                          {ord.tipo_entrega === 'domicilio' ? 'Envío Domicilio' : 'Recoge en Tienda'}
                        </span>
                      </div>
                      <div className="text-muted fs-11 text-truncate" style={{ maxWidth: 220 }}>
                        {ord.direccion_entrega}
                      </div>
                    </td>
                    <td className="fw-bold text-dark fs-13">
                      ${ord.total.toLocaleString('es-CO')} COP
                    </td>
                    <td>{getStatusBadge(ord.estado)}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end align-items-center gap-1">
                        <Button
                          variant="soft-primary"
                          size="sm"
                          className="btn-icon rounded-circle"
                          onClick={() => handleOpenDetail(ord)}
                          title="Ver Detalle / Factura"
                        >
                          <IconifyIcon icon="bx:show" className="fs-16" />
                        </Button>

                        <Button
                          variant="soft-success"
                          size="sm"
                          className="btn-icon rounded-circle"
                          onClick={() => handleNotificarDespachoChat(ord)}
                          title="Notificar Despacho en Consola de WhatsApp"
                        >
                          <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
                        </Button>

                        <Dropdown align="end">
                          <Dropdown.Toggle
                            variant="light"
                            size="sm"
                            className="btn-icon rounded-circle content-none arrow-none"
                            title="Más Opciones"
                          >
                            <IconifyIcon icon="bx:dots-vertical-rounded" className="fs-16" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="fs-12 shadow-sm border-0">
                            <Dropdown.Header>Actualizar Estado</Dropdown.Header>
                            <Dropdown.Item onClick={() => handleUpdateStatus(ord.id, 'en_preparacion')}>
                              <span className="badge bg-info-subtle text-info me-1">●</span>
                              Marcar En Preparación
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleUpdateStatus(ord.id, 'despachado')}>
                              <span className="badge bg-primary-subtle text-primary me-1">●</span>
                              Marcar Despachado
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleUpdateStatus(ord.id, 'entregado')}>
                              <span className="badge bg-success-subtle text-success me-1">●</span>
                              Marcar Entregado
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => handleNotificarDespachoChat(ord)}
                              className="text-success d-flex align-items-center gap-1"
                            >
                              <IconifyIcon icon="bxl:whatsapp" />
                              Notificar Despacho en Consola WhatsApp
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Modal Detalle de Pedido / Factura */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-16 d-flex align-items-center gap-2">
            <span>Detalle de Orden: {selectedOrder?.numero_pedido}</span>
            {selectedOrder && getStatusBadge(selectedOrder.estado)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              {/* Información del Cliente */}
              <div className="bg-light p-3 rounded mb-3">
                <Row className="g-2">
                  <Col md={6}>
                    <small className="text-muted d-block">Cliente Comprador</small>
                    <span className="fw-bold text-dark">{selectedOrder.cliente_nombre}</span>
                    <div className="text-success fs-12 d-flex align-items-center gap-1 mt-1">
                      <IconifyIcon icon="bxl:whatsapp" />
                      {selectedOrder.whatsapp}
                    </div>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Destino de Entrega</small>
                    <span className="fw-medium text-dark">{selectedOrder.direccion_entrega}</span>
                    <div className="text-muted fs-11 mt-1">
                      Modalidad: {selectedOrder.tipo_entrega === 'domicilio' ? 'Despacho a Obra/Domicilio' : 'Retiro en Tienda Física'}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Items del Pedido */}
              <h6 className="fw-bold mb-2">Artículos Cotizados</h6>
              <Table size="sm" responsive className="table-bordered align-middle mb-3">
                <thead className="table-light fs-12">
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Precio Unitario</th>
                    <th className="text-end">Subtotal COP</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="fw-medium">{it.producto}</td>
                      <td className="text-center fw-bold">{it.cantidad}</td>
                      <td className="text-end">${it.unitario.toLocaleString('es-CO')}</td>
                      <td className="text-end fw-bold">${it.subtotal.toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                  <tr className="table-light">
                    <td colSpan={3} className="text-end fw-bold">Total Facturado (IVA Inc.):</td>
                    <td className="text-end fw-bold text-primary fs-14">
                      ${selectedOrder.total.toLocaleString('es-CO')} COP
                    </td>
                  </tr>
                </tbody>
              </Table>

              {/* Acciones de Flujo */}
              <div className="d-flex justify-content-between align-items-center p-2 border rounded bg-light">
                <span className="fs-12 text-muted">
                  Actualizar estado del pedido:
                </span>
                <div className="btn-group btn-group-sm">
                  <Button
                    variant={selectedOrder.estado === 'en_preparacion' ? 'info' : 'outline-secondary'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'en_preparacion')}
                  >
                    Preparación
                  </Button>
                  <Button
                    variant={selectedOrder.estado === 'despachado' ? 'primary' : 'outline-secondary'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'despachado')}
                  >
                    Despachado
                  </Button>
                  <Button
                    variant={selectedOrder.estado === 'entregado' ? 'success' : 'outline-secondary'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'entregado')}
                  >
                    Entregado
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowDetailModal(false)}>
            Cerrar
          </Button>
          {selectedOrder && (
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                setShowDetailModal(false);
                handleNotificarDespachoChat(selectedOrder);
              }}
              className="d-flex align-items-center gap-1"
            >
              <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
              Notificar Despacho en Consola WhatsApp
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PedidosPage;
