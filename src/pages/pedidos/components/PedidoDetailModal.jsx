import { Modal, Button, Table, Row, Col } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getStatusBadge } from './StatusBadge';

const PedidoDetailModal = ({ show, onHide, order, onUpdateStatus, onNotificarDespacho }) => {
  if (!order) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton closeLabel="Cerrar">
        <Modal.Title className="fw-bold fs-16 d-flex align-items-center gap-2">
          <span>Detalle de Orden: {order.numero_pedido}</span>
          {getStatusBadge(order.estado)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="bg-light p-3 rounded mb-3">
          <Row className="g-2">
            <Col md={6}>
              <small className="text-muted d-block">Cliente Comprador</small>
              <span className="fw-bold text-dark">{order.cliente_nombre}</span>
              <div className="text-success fs-12 d-flex align-items-center gap-1 mt-1">
                <IconifyIcon icon="bxl:whatsapp" />
                {order.whatsapp}
              </div>
            </Col>
            <Col md={6}>
              <small className="text-muted d-block">Destino de Entrega</small>
              <span className="fw-medium text-dark">{order.direccion_entrega}</span>
              <div className="text-muted fs-11 mt-1">
                Modalidad: {order.tipo_entrega === 'domicilio' ? 'Despacho a Domicilio' : 'Retiro en Tienda Física'}
              </div>
            </Col>
          </Row>
        </div>

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
            {(!order.items || order.items.length === 0) ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  No hay productos registrados en esta orden
                </td>
              </tr>
            ) : (
              order.items.map((it) => (
                <tr key={it.id}>
                  <td className="fw-medium">{it.producto}</td>
                  <td className="text-center fw-bold">{it.cantidad}</td>
                  <td className="text-end">${Number(it.unitario || it.precio_unitario || 0).toLocaleString('es-CO')}</td>
                  <td className="text-end fw-bold">${Number(it.subtotal || it.total || 0).toLocaleString('es-CO')}</td>
                </tr>
              ))
            )}
            <tr className="table-light">
              <td colSpan={3} className="text-end fw-bold">Total Facturado (IVA Inc.):</td>
              <td className="text-end fw-bold text-primary fs-14">
                ${Number(order.total || 0).toLocaleString('es-CO')} COP
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="d-flex justify-content-between align-items-center p-2 border rounded bg-light">
          <span className="fs-12 text-muted">Actualizar estado del pedido:</span>
          <div className="btn-group btn-group-sm">
            <Button
              variant={order.estado === 'pendiente' ? 'secondary' : 'outline-secondary'}
              onClick={() => onUpdateStatus(order.id, 'pendiente')}
            >
              Pendiente
            </Button>
            <Button
              variant={order.estado === 'en_preparacion' ? 'info' : 'outline-secondary'}
              onClick={() => onUpdateStatus(order.id, 'en_preparacion')}
            >
              Preparación
            </Button>
            <Button
              variant={order.estado === 'despachado' ? 'primary' : 'outline-secondary'}
              onClick={() => onUpdateStatus(order.id, 'despachado')}
            >
              Despachado
            </Button>
            <Button
              variant={order.estado === 'entregado' ? 'success' : 'outline-secondary'}
              onClick={() => onUpdateStatus(order.id, 'entregado')}
            >
              Entregado
            </Button>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>Cerrar</Button>
        <Button
          variant="success"
          size="sm"
          onClick={() => {
            onHide();
            onNotificarDespacho(order);
          }}
          className="d-flex align-items-center gap-1"
        >
          <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
          Notificar Despacho en Consola WhatsApp
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PedidoDetailModal;
