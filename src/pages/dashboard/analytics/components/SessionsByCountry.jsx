import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, CardBody, CardHeader, CardTitle, Col, Row, ProgressBar, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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

const Vacio = ({ texto }) => (
  <div className="text-center text-muted fs-12 py-4">{texto}</div>
);

/**
 * Pedidos recientes y cobertura de entregas por zona, con datos reales de
 * PostgreSQL (`public.pedido` y `public.tercero`).
 */
const SessionsByCountry = ({ pedidos = [], zonas = [] }) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="d-flex justify-content-between align-items-center border-bottom border-dashed bg-transparent">
        <div>
          <CardTitle as="h5" className="fw-bold mb-1">
            Pedidos Recientes WhatsApp y Cobertura de Entregas
          </CardTitle>
          <p className="text-muted fs-12 mb-0">
            Órdenes confirmadas vía Meta Cloud API
          </p>
        </div>
        <Link to="/pedidos" className="btn btn-sm btn-outline-primary">
          Ver Todos los Pedidos
        </Link>
      </CardHeader>
      <CardBody className="p-0">
        <Row className="g-0">
          <Col lg={7} className="border-end p-3">
            <h6 className="fw-semibold text-dark mb-3">Últimas Órdenes Registradas</h6>
            <div className="table-responsive">
              <table className="table table-hover table-centered mb-0 align-middle">
                <thead className="table-light">
                  <tr className="fs-12 text-muted">
                    <th>N° Pedido</th>
                    <th>Cliente</th>
                    <th>Entrega</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <Vacio texto="Aún no hay pedidos formalizados." />
                      </td>
                    </tr>
                  ) : (
                    pedidos.map((pedido) => (
                      <tr key={pedido.id}>
                        <td>
                          <span className="fw-semibold text-primary">{pedido.numero_pedido}</span>
                          <div className="text-muted fs-11">{pedido.fecha}</div>
                        </td>
                        <td>
                          <div className="fw-medium text-dark">{pedido.cliente_nombre}</div>
                          <div className="text-muted fs-11 d-flex align-items-center gap-1">
                            <IconifyIcon icon="bxl:whatsapp" className="text-success fs-12" />
                            {pedido.whatsapp || 'Sin WhatsApp'}
                          </div>
                        </td>
                        <td>
                          <span className="text-capitalize fs-12 text-dark">
                            {pedido.tipo_entrega === 'domicilio' ? '🚚 Domicilio' : '🏬 En Depósito'}
                          </span>
                          <div className="text-muted fs-11 text-truncate" style={{ maxWidth: 140 }}>
                            {pedido.direccion_entrega}
                          </div>
                        </td>
                        <td className="fw-bold text-dark fs-13">
                          ${Number(pedido.total || 0).toLocaleString('es-CO')} COP
                        </td>
                        <td>{getStatusBadge(pedido.estado)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Col>
          <Col lg={5} className="p-3">
            <h6 className="fw-semibold text-dark mb-3">Zonas con Mayor Demanda WhatsApp</h6>
            <div className="d-flex flex-column gap-3">
              {zonas.length === 0 ? (
                <Vacio texto="Sin despachos registrados por zona." />
              ) : (
                zonas.map((zona) => (
                  <div key={zona.name}>
                    <div className="d-flex justify-content-between align-items-center mb-1 fs-12">
                      <span className="fw-medium text-dark d-flex align-items-center gap-1">
                        <IconifyIcon icon={zona.icon} className={`text-${zona.variant} fs-14`} />
                        {zona.name}
                      </span>
                      <span className="fw-bold text-dark">{zona.amount} despachos</span>
                    </div>
                    <ProgressBar
                      variant={zona.variant}
                      now={zona.value}
                      style={{ height: 6 }}
                      className="rounded-pill"
                    />
                  </div>
                ))
              )}
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default SessionsByCountry;
