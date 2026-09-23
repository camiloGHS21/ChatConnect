import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Indicadores de Utilidad según Regla 45.3
 * Idéntico al template Reback oficial con avatares circulares y formato es-CO.
 */
const RentabilidadSummaryCard = ({ utilidadValor = 0, utilidadPorcentaje = 0 }) => {
  const valor = Number(utilidadValor || 0);
  const porcentaje = Number(utilidadPorcentaje || 0);

  return (
    <Card className="border border-primary border-opacity-25 bg-primary bg-opacity-10 mb-4 shadow-none rounded-3">
      <Card.Body className="py-3">
        <Row className="align-items-center text-center text-md-start">
          <Col md={6} className="border-end border-primary border-opacity-25 py-1">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <div className="avatar-md bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                <IconifyIcon icon="bx:trending-up" className="fs-24" />
              </div>
              <div>
                <span className="text-muted fs-12 text-uppercase fw-semibold d-block">
                  Utilidad en Valor (utilidad_valor = precio_base - costo_base)
                </span>
                <h3 className="mb-0 fw-bold text-primary font-monospace">
                  ${valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </Col>
          <Col md={6} className="py-1 mt-2 mt-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <div className="avatar-md bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                <IconifyIcon icon="bx:pie-chart-alt" className="fs-24" />
              </div>
              <div>
                <span className="text-muted fs-12 text-uppercase fw-semibold d-block">
                  Margen de Utilidad Porcentual (utilidad_porcentaje)
                </span>
                <h3 className="mb-0 fw-bold text-success font-monospace">
                  {porcentaje.toFixed(2)}%
                </h3>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RentabilidadSummaryCard;
