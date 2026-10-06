import { Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ClientesTable = ({ clientes = [], onOpenDetail }) => {
  return (
    <div className="table-responsive">
      <Table hover className="table-centered align-middle mb-0">
        <thead className="table-light">
          <tr className="fs-12 text-muted">
            <th>Cliente</th>
            <th>WhatsApp</th>
            <th>Documento</th>
            <th>Ubicación y Coordenadas</th>
            <th>Total Pedidos</th>
            <th>Volumen de Compras</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-muted fs-13">
                No se encontraron clientes registrados.
              </td>
            </tr>
          ) : (
            clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={cliente.avatar || '/images/users/avatar-1.jpg'}
                      alt={cliente.nombre}
                      className="rounded-circle"
                      width={38}
                      height={38}
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(cliente.nombre); }}
                    />
                    <div>
                      <div className="fw-semibold text-dark">{cliente.nombre}</div>
                      <span className="text-muted fs-11">{cliente.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <a
                    href={`https://wa.me/${cliente.whatsapp_raw || cliente.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="d-flex align-items-center gap-1 text-success fw-medium text-decoration-none"
                  >
                    <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
                    {cliente.whatsapp}
                  </a>
                  <span className="badge bg-success-subtle text-success fs-10">Verificado</span>
                </td>
                <td className="text-muted fs-12">{cliente.documento || cliente.numero_documento}</td>
                <td>
                  <div className="d-flex align-items-center gap-1 text-dark fs-12">
                    <IconifyIcon icon="tabler:map-pin" className="text-danger fs-14" />
                    {cliente.ciudad} {cliente.departamento ? `(${cliente.departamento})` : ''}
                  </div>
                  <div className="text-muted fs-11 text-truncate" style={{ maxWidth: 200 }}>
                    {cliente.direccion}
                  </div>
                </td>
                <td>
                  <Badge bg="primary-subtle" className="text-primary px-2 py-1">
                    {cliente.pedidos_count || 0} órdenes
                  </Badge>
                </td>
                <td className="fw-bold text-dark fs-13">
                  ${(cliente.total_compras || 0).toLocaleString('es-CO')} COP
                </td>
                <td className="text-end">
                  <div className="d-flex justify-content-end align-items-center gap-1">
                    <Button
                      variant="soft-primary"
                      size="sm"
                      className="btn-icon rounded-circle"
                      onClick={() => onOpenDetail(cliente)}
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
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ClientesTable;
