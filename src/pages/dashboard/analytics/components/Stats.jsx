import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, CardBody, Col, Row } from 'react-bootstrap';

const StatCard = ({ amount, icon, variant, name }) => {
  return (
    <Card>
      <CardBody>
        <Row>
          <Col xs={6}>
            <div className={`avatar-md bg-opacity-10 rounded flex-centered bg-${variant}`}>
              <IconifyIcon icon={icon} height={32} width={32} className={`text-${variant} `} />
            </div>
          </Col>
          <Col xs={6} className="text-end">
            <p className="text-muted mb-0 text-truncate">{name}</p>
            <h3 className="text-dark mt-1 mb-0">{amount}</h3>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

/**
 * Tarjetas KPI del panel. Recibe los valores ya calculados desde `useDashboard`
 * (datos reales de PostgreSQL, sin mocks estáticos).
 */
const Stats = ({ items = [] }) => {
  return (
    <Row>
      {items.map((stat) => (
        <Col md={6} xxl={12} key={stat.name}>
          <StatCard {...stat} />
        </Col>
      ))}
    </Row>
  );
};

export default Stats;
