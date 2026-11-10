import { Alert, Badge, Card, Form, Table } from 'react-bootstrap';

const number = value => value.toLocaleString('es-CO', { maximumFractionDigits: 6 });

const formatRate = ({ porcentaje, base_calculo }) => {
  if (porcentaje == null || base_calculo === 'ESPECIAL') return 'Sin tasa plana · Consultar norma';
  if (base_calculo === 'IVA') return `${number(porcentaje)}% del IVA`;
  if (base_calculo === 'AIU') return `${number(porcentaje)}% sobre AIU`;
  if (base_calculo === 'PAGO') return `${number(porcentaje)}% del pago`;
  return 'Consultar norma';
};

const sourceUrl = value => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

const verifiedDate = value => {
  if (!value) return 'Sin fecha de verificación';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin fecha de verificación' : date.toLocaleDateString('es-CO', { timeZone: 'UTC' });
};

const RetencionesConfigTab = ({
  filtered = [], grupos = [], total = 0,
  search = '', setSearch, grupo = '', setGrupo,
  updatingId = null, notification, onToggleStatus,
}) => (
  <>
    <Alert variant="info" className="fs-13">
      <strong>Catálogo de referencia para bienes y servicios.</strong> No incluye todas las retenciones nacionales.
      {' '}Nómina, pagos al exterior, autorretención por CIIU y ReteICA son reglas especiales: sin tasa plana
      ni liquidación automática. La aplicación depende de la operación, las condiciones tributarias de las partes,
      la base y la norma vigente; asignar una retención a un producto no la liquida.
    </Alert>
    {notification && <Alert variant={notification.type} className="py-2">{notification.message}</Alert>}
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-transparent py-3">
        <h5 className="card-title mb-1">Configuración de Retenciones</h5>
        <p className="text-muted fs-13 mb-3">
          Consulta tasas, condiciones y fuentes oficiales. El estado controla la habilitación del registro;
          la disponibilidad en producto requiere que sea seleccionable y tenga porcentaje definido.
        </p>
        <div className="d-flex flex-wrap gap-3">
          <Form.Group controlId="retenciones-buscar" className="flex-grow-1">
            <Form.Label>Buscar retención</Form.Label>
            <Form.Control type="search" placeholder="Nombre, código, condición o norma..." value={search}
              onChange={event => setSearch(event.target.value)} />
          </Form.Group>
          <Form.Group controlId="retenciones-grupo">
            <Form.Label>Grupo</Form.Label>
            <Form.Select value={grupo} onChange={event => setGrupo(event.target.value)}>
              <option value="">Todos los grupos</option>
              {grupos.map(value => <option key={value} value={value}>{value}</option>)}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="text-muted fs-13 mt-2" role="status">{filtered.length} de {total} retenciones</div>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="align-middle mb-0 fs-13">
          <caption className="visually-hidden">Catálogo de retenciones de referencia para bienes y servicios</caption>
          <thead className="table-light">
            <tr>
              <th scope="col">Retención</th>
              <th scope="col">Grupo / Tipo</th>
              <th scope="col">Tasa y base de cálculo</th>
              <th scope="col">Base mínima UVT</th>
              <th scope="col">Condiciones</th>
              <th scope="col">Norma y fuente</th>
              <th scope="col">Disponibilidad en producto</th>
              <th scope="col">Productos asociados</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const selectable = item.seleccionable === true && item.porcentaje != null;
              const href = sourceUrl(item.fuente_url);
              const active = item.estado === 'activo';
              return (
                <tr key={item.id}>
                  <th scope="row"><div>{item.nombre}</div><small className="text-muted">{item.codigo} · #{item.id}</small></th>
                  <td>{item.grupo || 'Sin grupo'}<div className="text-muted">{item.tipo || 'Sin tipo'}</div></td>
                  <td className="text-nowrap">{formatRate(item)}<div className="text-muted">Base: {item.base_calculo || 'Consultar norma'}</div></td>
                  <td>{item.base_minima_uvt == null ? 'Consultar norma' : `${number(item.base_minima_uvt)} UVT`}</td>
                  <td>{item.condicion || 'Consultar norma'}</td>
                  <td>
                    <div>{item.norma || 'Consultar norma'}</div>
                    {href ? <a href={href} target="_blank" rel="noopener noreferrer">Fuente oficial (nueva pestaña)</a> : <span className="text-muted">Fuente no disponible</span>}
                    <div className="text-muted">Verificado: {verifiedDate(item.verificado_en)}</div>
                  </td>
                  <td><Badge bg={selectable ? 'success' : 'secondary'}>{selectable ? 'Seleccionable' : 'No seleccionable'}</Badge></td>
                  <td>{item.total_productos ?? 'Sin información'}</td>
                  <td>
                    <Form.Check type="switch" id={`retencion-estado-${item.id}`}
                      label={updatingId === item.id ? 'Guardando...' : active ? 'Activo' : 'Inactivo'}
                      aria-label={`Estado de ${item.nombre}`} checked={active} disabled={updatingId !== null || !onToggleStatus}
                      onChange={() => onToggleStatus(item)} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-5">
              {total === 0 ? 'No hay retenciones disponibles en el catálogo.' : 'No hay retenciones que coincidan con los filtros.'}
            </td></tr>}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  </>
);

export default RetencionesConfigTab;
