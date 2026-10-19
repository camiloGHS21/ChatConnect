import { Alert, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import Conversions from './components/Conversions';
import SessionByBrowser from './components/SessionByBrowser';
import SessionsByCountry from './components/SessionsByCountry';
import Stats from './components/Stats';
import TopPages from './components/TopPages';
import useDashboard from './useDashboard';

export default function Home() {
  const {
    error,
    tarjetas,
    automatizacion,
    series,
    ultimosPedidos,
    zonasEntrega,
    canalesAtencion,
    topProductos,
  } = useDashboard();

  return (
    <>
      <PageBreadcrumb title="Panel de Control WhatsApp CRM" subName="ChatConnect" />
      <PageMetaData title="Panel de control - ChatConnect" />

      {error && (
        <Alert variant="warning" className="border-0 shadow-sm">
          No se pudo conectar con el servidor para cargar las métricas en tiempo real.
          Verifica que el backend esté activo.
        </Alert>
      )}

      <Row>
        <Col xxl={3}>
          <Stats items={tarjetas} />
        </Col>
        <Col xxl={9}>
          <Conversions automatizacion={automatizacion} series={series} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <SessionsByCountry pedidos={ultimosPedidos} zonas={zonasEntrega} />
        </Col>
      </Row>
      <Row>
        <Col lg={4}>
          <SessionByBrowser canales={canalesAtencion} />
        </Col>
        <Col lg={8}>
          <TopPages productos={topProductos} />
        </Col>
      </Row>
    </>
  );
}
