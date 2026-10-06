import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { currency } from '@/context/constants';
import { stateData } from '../data';
import { formatNumber } from '../../spanishPresentation';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
const StatCard = ({
  stat
}) => {
  const {
    amount,
    change,
    changeColor,
    badgeIcon,
    icon,
    iconColor,
    title
  } = stat;
  return <Card>
      <CardBody className="overflow-hidden position-relative">
        <IconifyIcon icon={icon} className={`fs-36 text-${iconColor}`} />
        <h3 className="mb-0 fw-bold mt-3 mb-1">
          {currency}
          {formatNumber(amount)} mil
        </h3>
        <p className="text-muted">{title}</p>
        <span className={`badge fs-12 badge-soft-${changeColor}`}>{formatNumber(change)}%</span>
        <IconifyIcon icon={badgeIcon} className="widget-icon" />
      </CardBody>
    </Card>;
};
const Stats = () => {
  return <Row>
      {stateData.map((stat) => <Col lg={4} md={6} className="col-xl" key={stat.title}>
          <StatCard stat={stat} />
        </Col>)}
    </Row>;
};
export default Stats;