
import { Card, Col, Row } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Resumen de utilidad base, utilidad con impuestos y margen sobre costo base.
 */
const RentabilidadSummaryCard = ({
  utilidadValor = 0,

  costoFinal,
  precioFinal,
  costoBase,
  precioBase,
  gananciaFinal,
  utilidadBruta,
}) => {
  const cBase = parseFloat(costoBase) || 0;
  const pBase = parseFloat(precioBase) || 0;
  const cFinal = parseFloat(costoFinal) || 0;
  const pFinal = parseFloat(precioFinal) || 0;

  // 1. Utilidad en Valor Base (de antes: precio_base - costo_base)
  const valorBase = (pBase > 0 || cBase > 0)
    ? (pBase - cBase)
    : Number(utilidadValor || 0);

  // 2. Utilidad Bruta (Precio Final de Venta - Costo Final con Impuestos)
  const valorReal = (pFinal > 0 || cFinal > 0)
    ? (pFinal - cFinal)
    : (Number(utilidadBruta ?? gananciaFinal ?? 0) || valorBase);

  const porcentaje = cBase > 0 ? (valorBase / cBase) * 100 : 0;

  return (
    <Row className="g-3 mb-4">
      {/* Tarjeta 1: Utilidad Base */}
      <Col lg={4} md={6}>
        <Card className="border border-primary border-opacity-25 bg-primary bg-opacity-10 shadow-none rounded-3 h-100 mb-0">
          <Card.Body className="py-3 d-flex align-items-center gap-3">
            <div className="avatar-md bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0">
              <IconifyIcon icon="bx:trending-up" className="fs-26" />
            </div>
            <div className="overflow-hidden">
              <span className="text-muted fs-11 text-uppercase fw-semibold d-block text-truncate">
                Utilidad Base (Sin Impuestos)
              </span>
              <h4 className="mb-0 fw-bold text-primary font-monospace">
                ${valorBase.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <span className="text-muted fs-11 mt-1 d-block text-truncate">
                Precio Base - Costo Base
              </span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Tarjeta 2: Utilidad Bruta (Precio Final de Venta - Costo Final con Impuestos) */}
      <Col lg={4} md={6}>
        <Card className={`border ${valorReal >= 0 ? 'border-success bg-success' : 'border-danger bg-danger'} border-opacity-25 bg-opacity-10 shadow-none rounded-3 h-100 mb-0`}>
          <Card.Body className="py-3 d-flex align-items-center gap-3">
            <div className={`avatar-md ${valorReal >= 0 ? 'bg-success' : 'bg-danger'} text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0`}>
              <IconifyIcon icon="bx:dollar-circle" className="fs-28" />
            </div>
            <div className="overflow-hidden">
              <span className="text-muted fs-11 text-uppercase fw-semibold d-flex align-items-center gap-1 text-truncate">
                <IconifyIcon icon="bx:money-withdraw" className="text-success fs-14" />
                Utilidad Bruta
              </span>
              <h4 className={`mb-0 fw-bold ${valorReal >= 0 ? 'text-success' : 'text-danger'} font-monospace d-flex align-items-center gap-1`}>
                <IconifyIcon icon="bx:wallet" className="fs-20 opacity-75" />
                ${valorReal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <span className="text-muted fs-11 mt-1 d-block text-truncate">
                Precio Final de Venta - Costo Final con Impuestos
              </span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Tarjeta 3 (De antes): Margen Porcentual */}
      <Col lg={4} md={12}>
        <Card className="border border-info border-opacity-25 bg-info bg-opacity-10 shadow-none rounded-3 h-100 mb-0">
          <Card.Body className="py-3 d-flex align-items-center gap-3">
            <div className="avatar-md bg-info text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0">
              <IconifyIcon icon="bx:pie-chart-alt" className="fs-26" />
            </div>
            <div className="overflow-hidden">
              <span className="text-muted fs-11 text-uppercase fw-semibold d-block text-truncate">
                Margen de Utilidad Base (%)
              </span>
              <h4 className="mb-0 fw-bold text-info font-monospace">
                {porcentaje.toFixed(2)}%
              </h4>
              <span className="text-muted fs-11 mt-1 d-block text-truncate">
                Rentabilidad sobre costo base
              </span>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RentabilidadSummaryCard;


