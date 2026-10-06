import { Row, Col, Modal, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ClienteDetailModal = ({ show, onHide, client, orders = [] }) => {
  if (!client) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton closeLabel="Cerrar">
        <Modal.Title className="fw-bold fs-16">
          Ficha del Cliente: {client.nombre}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3 mb-3 p-2 bg-light rounded">
          <Col md={4}>
            <small className="text-muted">Teléfono WhatsApp</small>
            <div className="fw-bold text-success">{client.whatsapp}</div>
          </Col>
          <Col md={4}>
            <small className="text-muted">Identificación</small>
            <div className="fw-bold">{client.documento}</div>
          </Col>
          <Col md={4}>
            <small className="text-muted">Total Compras Históricas</small>
            <div className="fw-bold text-primary">
              ${(client.total_compras || 0).toLocaleString('es-CO')} COP
            </div>
          </Col>
          <Col xs={12}>
            <small className="text-muted">Dirección & Ciudad</small>
            <div className="fw-medium">
              {client.direccion} ({client.ciudad || 'No especificada'})
            </div>
          </Col>
        </Row>

        <h6 className="fw-bold mb-2">Historial de Pedidos WhatsApp</h6>
        {orders.length > 0 ? (
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
              {orders.map((p) => (
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cerrar
        </Button>
        <Link to="/chat" className="btn btn-sm btn-success d-flex align-items-center gap-1">
          <IconifyIcon icon="bxl:whatsapp" />
          Iniciar Conversación
        </Link>
      </Modal.Footer>
    </Modal>
  );
};

export default ClienteDetailModal;
