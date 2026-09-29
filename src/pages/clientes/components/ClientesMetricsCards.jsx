import React from 'react';
import { Row, Col, Card, CardBody } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ClientesMetricsCards = ({ totalClientes = 0 }) => {
  return (
    <Row className="g-3 mb-3">
      <Col sm={6} lg={3}>
        <Card className="border-0 shadow-sm">
          <CardBody className="d-flex align-items-center gap-3">
            <div className="avatar-md rounded bg-success-subtle text-success flex-centered">
              <IconifyIcon icon="bxl:whatsapp" className="fs-24" />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{totalClientes}</h4>
              <span className="text-muted fs-12">Clientes WhatsApp</span>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} lg={3}>
        <Card className="border-0 shadow-sm">
          <CardBody className="d-flex align-items-center gap-3">
            <div className="avatar-md rounded bg-primary-subtle text-primary flex-centered">
              <IconifyIcon icon="iconamoon:shopping-bag-duotone" className="fs-24" />
            </div>
            <div>
              <h4 className="fw-bold mb-0">57</h4>
              <span className="text-muted fs-12">Pedidos Formalizados</span>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} lg={3}>
        <Card className="border-0 shadow-sm">
          <CardBody className="d-flex align-items-center gap-3">
            <div className="avatar-md rounded bg-warning-subtle text-warning flex-centered">
              <IconifyIcon icon="tabler:currency-dollar" className="fs-24" />
            </div>
            <div>
              <h4 className="fw-bold mb-0">$26.9M</h4>
              <span className="text-muted fs-12">Ventas por WhatsApp</span>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} lg={3}>
        <Card className="border-0 shadow-sm">
          <CardBody className="d-flex align-items-center gap-3">
            <div className="avatar-md rounded bg-info-subtle text-info flex-centered">
              <IconifyIcon icon="tabler:map-pin" className="fs-24" />
            </div>
            <div>
              <h4 className="fw-bold mb-0">100%</h4>
              <span className="text-muted fs-12">Georreferenciados</span>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ClientesMetricsCards;
