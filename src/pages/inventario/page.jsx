import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Table, Badge, Button, ProgressBar, Form, Spinner, Alert } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import inventarioService from '@/services/inventarioService';
import ModalAjustarStock from './components/ModalAjustarStock';

const InventarioPage = () => {
  const [filterLevel, setFilterLevel] = useState('all'); // all | critical | normal
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState([]);
  const [kpis, setKpis] = useState({
    totalProductos: 0,
    totalReservado: 0,
    totalDisponible: 0,
    totalCriticos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProductToAdjust, setSelectedProductToAdjust] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [items, kpiData] = await Promise.all([
        inventarioService.getInventario(1),
        inventarioService.getKpis(1),
      ]);
      setProductos(Array.isArray(items) ? items : []);
      if (kpiData) setKpis(kpiData);
    } catch (err) {
      console.error('Error al cargar inventario desde PostgreSQL:', err);
      setError('No se pudieron obtener las existencias del inventario desde el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const filtered = productos.filter((p) => {
    const matchesSearch =
      (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoria || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterLevel === 'critical') return matchesSearch && p.disponible <= 5;
    if (filterLevel === 'normal') return matchesSearch && p.disponible > 5;
    return matchesSearch;
  });

  const handleOpenAdjust = (prod) => {
    setSelectedProductToAdjust(prod);
    setShowAdjustModal(true);
  };

  const handleStockUpdated = () => {
    cargarDatos();
  };

  const exportarCSV = () => {
    if (productos.length === 0) return;
    const headers = ['ID', 'Nombre', 'SKU', 'Categoría', 'Existencia Física', 'Reservado WhatsApp', 'Disponible', 'Precio'];
    const rows = filtered.map((p) => [
      p.id,
      `"${(p.nombre || '').replace(/"/g, '""')}"`,
      p.sku,
      `"${(p.categoria || '').replace(/"/g, '""')}"`,
      p.existencia,
      p.reservado,
      p.disponible,
      p.precio,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_chatconnect_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageMetaData title="Control de Inventario - ChatConnect" />
      <PageBreadcrumb title="Control de Inventario" subName="Disponibilidad en Tiempo Real" />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="py-2 fs-13 mb-3">
          {error}
        </Alert>
      )}

      {/* KPI Cards de Inventario */}
      <Row className="g-3 mb-3">
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-primary-subtle text-primary flex-centered">
                <IconifyIcon icon="iconamoon:box-duotone" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{kpis.totalProductos}</h4>
                <span className="text-muted fs-12">Número de Productos</span>
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
                <h4 className="fw-bold mb-0 text-warning">{kpis.totalReservado}</h4>
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
                <h4 className="fw-bold mb-0 text-success">{kpis.totalDisponible}</h4>
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
                <h4 className="fw-bold mb-0 text-danger">{kpis.totalCriticos}</h4>
                <span className="text-muted fs-12">Artículos en Alerta</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Inventario */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-transparent border-bottom">
          <div>
            <CardTitle as="h5" className="fw-bold mb-0">
              Existencias y Disponibilidad
            </CardTitle>
            <span className="text-muted fs-12">
              Supervisión de inventario físico y reservas automáticas de carritos WhatsApp (public.inventario)
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group btn-group-sm">
              <Button
                variant={filterLevel === 'all' ? 'primary' : 'outline-light'}
                className={filterLevel === 'all' ? 'text-white' : 'text-dark'}
                onClick={() => setFilterLevel('all')}
              >
                Todos ({productos.length})
              </Button>
              <Button
                variant={filterLevel === 'critical' ? 'danger' : 'outline-light'}
                className={filterLevel === 'critical' ? 'text-white' : 'text-dark'}
                onClick={() => setFilterLevel('critical')}
              >
                Existencias críticas ({kpis.totalCriticos})
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
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={cargarDatos}
              disabled={loading}
              title="Recargar datos de la BD"
            >
              <IconifyIcon icon="bx:refresh" className={loading ? 'bx-spin' : ''} />
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={exportarCSV}
            >
              <IconifyIcon icon="bx:export" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <div className="text-muted fs-13 mt-2">Cargando inventario desde la base de datos...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light">
                  <tr className="fs-12 text-muted">
                    <th>Producto y SKU</th>
                    <th>Categoría</th>
                    <th>Existencia</th>
                    <th>Reservado</th>
                    <th>Disponible</th>
                    <th style={{ width: 180 }}>Nivel de existencias</th>
                    <th>Estado</th>
                    <th className="text-end">Ajuste</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted fs-13">
                        No se encontraron productos con los criterios de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((prod) => {
                      const baseExistencia = Math.max(prod.existencia, 1);
                      const percent = Math.min(100, Math.round((prod.disponible / baseExistencia) * 100));
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
                              {isCritical ? 'Crítico' : isLow ? 'Existencias bajas' : 'Óptimo'}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              title="Ajustar existencias físicas"
                              onClick={() => handleOpenAdjust(prod)}
                            >
                              <IconifyIcon icon="bx:refresh" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      <ModalAjustarStock
        show={showAdjustModal}
        onHide={() => setShowAdjustModal(false)}
        producto={selectedProductToAdjust}
        onStockUpdated={handleStockUpdated}
      />
    </>
  );
};

export default InventarioPage;
