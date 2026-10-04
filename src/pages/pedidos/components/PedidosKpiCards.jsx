import { Row, Col, Card, CardBody } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const PedidosKpiCards = ({ totalOrders, totalEnCurso, totalEntregados, totalVentas }) => {
  return (
    <Row className="g-3 mb-3">
      <Col sm={6} lg={3}>
        <Card className="border-0 shadow-sm">
          <CardBody className="d-flex align-items-center gap-3">
            <div className="avatar-md rounded bg-primary-subtle text-primary flex-centered">
              <IconifyIcon icon="iconamoon:shopping-bag-duotone" className="fs-24" />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{totalOrders}</h4>
              <span className="text-muted fs-12">Total Pedidos WhatsApp</span>
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
              <h4 className="fw-bold mb-0 text-warning">{totalEnCurso}</h4>
              <span className="text-muted fs-12">En Curso / Despachados</span>
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
              <h4 className="fw-bold mb-0 text-success">{totalEntregados}</h4>
              <span className="text-muted fs-12">Entregados con Éxito</span>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} lg={3}>
        <Card className="border-0 shadow-sm">
          <CardBody className="d-flex align-items-center gap-3">
            <div className="avatar-md rounded bg-info-subtle text-info flex-centered">
              <IconifyIcon icon="tabler:currency-dollar" className="fs-24" />
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-info">
                ${(totalVentas / 1000000).toFixed(1)}M COP
              </h4>
              <span className="text-muted fs-12">Facturación Total</span>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default PedidosKpiCards;
