import { Row, Col, Modal, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ClienteMapa from './ClienteMapa';
import {
  construirDireccionTexto,
  formatearCoordenadas,
  tieneCoordenadas,
  urlBuscarDireccion,
} from '@/utils/geo';

const ClienteDetailModal = ({ show, onHide, client, orders = [], loading = false }) => {
  if (!client) return null;

  const orderList = client.pedidos && client.pedidos.length > 0 ? client.pedidos : orders;

  const chatUrl = (() => {
    const params = new URLSearchParams();
    if (client.id) params.set('cliente_id', String(client.id));
    if (client.whatsapp_raw || client.whatsapp) {
      params.set('whatsapp', client.whatsapp_raw || client.whatsapp);
    }
    if (client.nombre) params.set('nombre', client.nombre);
    return `/chat?${params.toString()}`;
  })();

  const direccionTexto = construirDireccionTexto(client);

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
            <div>
              <Link
                to={chatUrl}
                className="fw-bold text-success text-decoration-none d-inline-flex align-items-center gap-1"
                title={`Abrir chat con ${client.nombre} en ChatConnect`}
              >
                <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
                {client.whatsapp || 'Sin WhatsApp'}
              </Link>
            </div>
          </Col>
          <Col md={4}>
            <small className="text-muted">Identificación</small>
            <div className="fw-bold">{client.documento || 'Sin doc'}</div>
          </Col>
          <Col md={4}>
            <small className="text-muted">Total Compras Históricas</small>
            <div className="fw-bold text-primary">
              ${(client.total_compras || 0).toLocaleString('es-CO')} COP
            </div>
          </Col>
          <Col xs={12}>
            <small className="text-muted">Dirección y Ciudad</small>
            <div className="fw-medium">
              {direccionTexto ? (
                <a
                  href={urlBuscarDireccion(direccionTexto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none link-ubicacion"
                  title={`Abrir "${direccionTexto}" en Google Maps`}
                >
                  {client.direccion || 'Ver ubicación'} ({client.ciudad || 'No especificada'}{client.departamento ? `, ${client.departamento}` : ''})
                </a>
              ) : (
                <span>Sin dirección registrada</span>
              )}
            </div>
          </Col>
          <Col xs={12}>
            <small className="text-muted">Coordenadas</small>
            <div>
              {tieneCoordenadas(client) ? (
                <span className="d-inline-flex align-items-center gap-1 font-monospace fs-12 text-dark">
                  <IconifyIcon icon="tabler:current-location" className="text-primary fs-14" />
                  {formatearCoordenadas(client.latitud, client.longitud)}
                </span>
              ) : (
                <span className="text-muted fs-12 fst-italic">Sin coordenadas registradas</span>
              )}
            </div>
          </Col>
        </Row>

        <h6 className="fw-bold mb-2">Ubicación Geográfica</h6>
        <div className="mb-3">
          <ClienteMapa cliente={client} />
        </div>

        <h6 className="fw-bold mb-2">Historial de Pedidos WhatsApp</h6>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" />
            <span className="ms-2 fs-13 text-muted">Cargando pedidos de la base de datos...</span>
          </div>
        ) : orderList.length > 0 ? (
          <Table size="sm" responsive className="table-bordered align-middle">
            <thead className="table-light">
              <tr className="fs-12">
                <th>N° Pedido</th>
                <th>Fecha</th>
                <th>Tipo Entrega</th>
                <th>Total COP</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((p) => (
                <tr key={p.id}>
                  <td className="fw-bold text-primary">{p.numero_pedido}</td>
                  <td className="fs-12 text-muted">{p.fecha || '-'}</td>
                  <td>{p.tipo_entrega === 'domicilio' ? 'Domicilio' : 'Recogida'}</td>
                  <td className="fw-bold">${(p.total || 0).toLocaleString('es-CO')} COP</td>
                  <td>
                    <Badge bg="success-subtle" className="text-success text-capitalize">
                      {p.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted fs-12 mb-0">
            No hay pedidos formalizados registrados para este cliente en la base de datos.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cerrar
        </Button>
        <Link to={chatUrl} className="btn btn-sm btn-success d-flex align-items-center gap-1">
          <IconifyIcon icon="bxl:whatsapp" />
          Iniciar Conversación
        </Link>
      </Modal.Footer>
    </Modal>
  );
};

export default ClienteDetailModal;
