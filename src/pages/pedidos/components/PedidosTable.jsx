import { Card, CardHeader, CardBody, CardTitle, Table, Button, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import PedidoActionsMenu from './PedidoActionsMenu';
import { getStatusBadge } from './StatusBadge';

const PedidosTable = ({
  orders,
  loading = false,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  onOpenDetail,
  onUpdateStatus,
  onNotificarDespacho,
  onNavigateChat,
  onExport,
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-transparent border-bottom">
        <div>
          <CardTitle as="h5" className="fw-bold mb-0">Listado de Órdenes Formalizadas</CardTitle>
          <span className="text-muted fs-12">Flujo de compra automatizado: Carrito WhatsApp ➔ Confirmación ➔ Despacho</span>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="btn-group btn-group-sm">
            {[
              { id: 'all', label: 'Todos', variant: 'primary' },
              { id: 'pendiente', label: 'Pendientes', variant: 'secondary' },
              { id: 'en_preparacion', label: 'Preparación', variant: 'info' },
              { id: 'despachado', label: 'Despachados', variant: 'primary' },
              { id: 'entregado', label: 'Entregados', variant: 'success' },
            ].map((st) => (
              <Button
                key={st.id}
                variant={statusFilter === st.id ? st.variant : 'outline-light'}
                className={statusFilter === st.id ? 'text-white' : 'text-dark'}
                onClick={() => setStatusFilter(st.id)}
              >
                {st.label}
              </Button>
            ))}
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
                <th>Cliente y Contacto</th>
                <th>Fecha</th>
                <th>Modalidad y Destino</th>
                <th>Total COP</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary mb-2" role="status" style={{ width: '1.75rem', height: '1.75rem' }}>
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <div className="fs-13 text-secondary">Cargando pedidos formalizados desde el servidor...</div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <IconifyIcon icon="iconamoon:shopping-bag-duotone" className="fs-36 mb-2 d-block mx-auto text-secondary opacity-50" />
                    <span>No se encontraron pedidos formalizados con los filtros aplicados.</span>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id}>
                    <td><span className="font-monospace fw-bold text-primary fs-13">{ord.numero_pedido}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{ord.cliente_nombre}</div>
                      <button
                        type="button"
                        onClick={() => onNavigateChat(ord.cliente_id)}
                        className="text-success fs-11 d-flex align-items-center gap-1 cursor-pointer border-0 bg-transparent p-0"
                        title="Abrir conversación en Consola WhatsApp"
                        style={{ cursor: 'pointer' }}
                      >
                        <IconifyIcon icon="bxl:whatsapp" />
                        {ord.whatsapp}
                      </button>
                    </td>
                    <td className="text-muted fs-12">{ord.fecha}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1 fs-12">
                        <IconifyIcon
                          icon={ord.tipo_entrega === 'domicilio' ? 'mdi:truck-delivery' : 'mdi:store'}
                          className={ord.tipo_entrega === 'domicilio' ? 'text-primary' : 'text-secondary'}
                        />
                        <span className="fw-medium">{ord.tipo_entrega === 'domicilio' ? 'Envío Domicilio' : 'Recoge en Tienda'}</span>
                      </div>
                      <div className="text-muted fs-11 text-truncate" style={{ maxWidth: 220 }}>{ord.direccion_entrega}</div>
                    </td>
                    <td className="fw-bold text-dark fs-13">${Number(ord.total || 0).toLocaleString('es-CO')} COP</td>
                    <td>{getStatusBadge(ord.estado)}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end align-items-center gap-1">
                        <Button variant="soft-primary" size="sm" className="btn-icon rounded-circle" onClick={() => onOpenDetail(ord)} title="Ver Detalle / Factura">
                          <IconifyIcon icon="bx:show" className="fs-16" />
                        </Button>
                        <Button variant="soft-success" size="sm" className="btn-icon rounded-circle" onClick={() => onNotificarDespacho(ord)} title="Notificar Despacho en Consola de WhatsApp">
                          <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
                        </Button>
                        <PedidoActionsMenu order={ord} onUpdateStatus={onUpdateStatus} onNotificarDespacho={onNotificarDespacho} onExport={onExport} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
};

export default PedidosTable;
