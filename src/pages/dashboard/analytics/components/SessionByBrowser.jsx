import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { canalesAtencion } from '../data';
import { Card, CardBody, CardHeader, CardTitle, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const SessionByBrowser = () => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <CardHeader className="d-flex justify-content-between align-items-center border-bottom border-dashed bg-transparent">
        <div>
          <CardTitle as="h5" className="fw-bold mb-0">
            Canales de Atención
          </CardTitle>
          <span className="text-muted fs-12">Dispositivos y origen de tráfico</span>
        </div>
        <span className="badge bg-success-subtle text-success">WhatsApp</span>
      </CardHeader>
      <CardBody className="p-3 d-flex flex-column justify-content-between">
        <div className="d-flex flex-column gap-3">
          {canalesAtencion.map((canal, idx) => (
            <div key={idx}>
              <div className="d-flex justify-content-between align-items-center mb-1 fs-12">
                <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                  <IconifyIcon icon="bxl:whatsapp" className="text-success fs-14" />
                  {canal.name}
                </span>
                <span className="text-muted">{canal.amount} ({canal.percentage}%)</span>
              </div>
              <ProgressBar
                variant={idx === 0 ? 'success' : idx === 1 ? 'primary' : 'info'}
                now={canal.percentage}
                style={{ height: 6 }}
                className="rounded-pill"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-light rounded text-center border">
          <IconifyIcon icon="iconamoon:comment-dots-duotone" className="fs-24 text-success mb-1" />
          <h6 className="fw-bold text-dark mb-1">Supervisión en Vivo</h6>
          <p className="text-muted fs-12 mb-2">Alterna entre atención por IA y asesor humano</p>
          <Link to="/chat" className="btn btn-sm btn-success w-100 rounded-pill">
            Abrir Consola de Chat
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default SessionByBrowser;