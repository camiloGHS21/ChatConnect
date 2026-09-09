import { useState } from 'react';
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Table, Badge, Button, ProgressBar, Form } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { CHATCONNECT_PRODUCTOS } from '@/assets/data/chatconnect-data';

const InventarioPage = () => {
  const [filterLevel, setFilterLevel] = useState('all'); // all | critical | normal
  const [searchTerm, setSearchTerm] = useState('');

  const totalExistencia = CHATCONNECT_PRODUCTOS.reduce((acc, p) => acc + p.existencia, 0);
  const totalReservado = CHATCONNECT_PRODUCTOS.reduce((acc, p) => acc + p.reservado, 0);
  const totalDisponible = CHATCONNECT_PRODUCTOS.reduce((acc, p) => acc + p.disponible, 0);
  const totalCriticos = CHATCONNECT_PRODUCTOS.filter((p) => p.disponible <= 5).length;

  const filtered = CHATCONNECT_PRODUCTOS.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterLevel === 'critical') return matchesSearch && p.disponible <= 5;
    if (filterLevel === 'normal') return matchesSearch && p.disponible > 5;
    return matchesSearch;
  });

  return (
    <>
      <PageMetaData title="Control de Inventario - ChatConnect" />
      <PageBreadcrumb title="Control de Inventario" subName="Disponibilidad en Tiempo Real" />

      {/* KPI Cards de Inventario */}
      <Row className="g-3 mb-3">
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-primary-subtle text-primary flex-centered">
                <IconifyIcon icon="mdi:warehouse" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{totalExistencia}</h4>
                <span className="text-muted fs-12">Existencia en Bodega</span>
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
                <h4 className="fw-bold mb-0 text-warning">{totalReservado}</h4>
                <span className="text-muted fs-12">Reservado por WhatsApp</span>
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
                <h4 className="fw-bold mb-0 text-success">{totalDisponible}</h4>
                <span className="text-muted fs-12">Disponible para Venta</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-danger-subtle text-danger flex-centered">
                <IconifyIcon icon="iconamoon:attention-circle-duotone" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-danger">{totalCriticos}</h4>
                <span className="text-muted fs-12">Artículos en Alerta</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Regla del SRS informativa */}
      <div className="alert alert-light border border-primary-subtle d-flex align-items-center gap-2 py-2 px-3 mb-3">
        <IconifyIcon icon="iconamoon:information-circle-duotone" className="fs-18 text-primary" />
        <span className="fs-12 text-muted">
          <strong>Fórmula del SRS ChatConnect:</strong> El bot de WhatsApp calcula el stock disponible en tiempo real con bloqueo transaccional ACID: <code>disponible = existencia - reservado</code>.
        </span>
      </div>

      {/* Tabla de Inventario */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-transparent border-bottom">
          <div>
            <CardTitle as="h5" className="fw-bold mb-0">
              Existencias y Disponibilidad
            </CardTitle>
            <span className="text-muted fs-12">
              Supervisión de inventario físico y reservas automáticas de carritos
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group btn-group-sm">
              <Button
                variant={filterLevel === 'all' ? 'primary' : 'outline-light'}
                className={filterLevel === 'all' ? 'text-white' : 'text-dark'}
                onClick={() => setFilterLevel('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterLevel === 'critical' ? 'danger' : 'outline-light'}
                className={filterLevel === 'critical' ? 'text-white' : 'text-dark'}
                onClick={() => setFilterLevel('critical')}
              >
                Stock Crítico
              </Button>
            </div>
            <div className="search-bar" style={{ minWidth: 220 }}>
              <Form.Control
                type="text"
                placeholder="Buscar SKU o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-sm"
              />
            </div>
            <Button variant="outline-success" size="sm" className="d-flex align-items-center gap-1">
              <IconifyIcon icon="bx:export" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr className="fs-12 text-muted">
                  <th>Producto & SKU</th>
                  <th>Categoría</th>
                  <th>Existencia Física</th>
                  <th>Reservado (WhatsApp)</th>
                  <th>Disponible</th>
                  <th style={{ width: 180 }}>Nivel de Stock</th>
                  <th>Estado</th>
                  <th className="text-end">Ajuste</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prod) => {
                  const percent = Math.min(100, Math.round((prod.disponible / prod.existencia) * 100));
                  const isCritical = prod.disponible <= 5;
                  const isLow = prod.disponible > 5 && prod.disponible <= 15;

                  return (
                    <tr key={prod.id}>
                      <td>
                        <div className="fw-semibold text-dark">{prod.nombre}</div>
                        <span className="badge bg-light text-muted font-monospace">{prod.sku}</span>
                      </td>
                      <td className="text-muted fs-12">{prod.categoria}</td>
                      <td className="fw-bold text-dark">{prod.existencia} uds</td>
                      <td className="text-warning fw-semibold">
                        {prod.reservado > 0 ? `${prod.reservado} uds` : '-'}
                      </td>
                      <td>
                        <span className={`fw-bold fs-14 ${isCritical ? 'text-danger' : 'text-success'}`}>
                          {prod.disponible} uds
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar
                            variant={isCritical ? 'danger' : isLow ? 'warning' : 'success'}
                            now={percent}
                            style={{ height: 6, flexGrow: 1 }}
                            className="rounded-pill"
                          />
                          <span className="fs-11 text-muted">{percent}%</span>
                        </div>
                      </td>
                      <td>
                        <Badge
                          bg={isCritical ? 'danger-subtle' : isLow ? 'warning-subtle' : 'success-subtle'}
                          className={isCritical ? 'text-danger' : isLow ? 'text-warning' : 'text-success'}
                        >
                          {isCritical ? 'Crítico' : isLow ? 'Bajo Stock' : 'Óptimo'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" title="Ajustar Stock">
                          <IconifyIcon icon="bx:refresh" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default InventarioPage;
