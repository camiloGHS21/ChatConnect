import React from 'react';
import { Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const PreciosVentaSummary = ({
  precioBase = 0,
  precioImpuesto = 0,
  costoImpuesto = 0,
  taxBreakdown = {},
  onPrecioImpuestoChange,
  onSmartRound
}) => {
  const pFinal = parseFloat(precioImpuesto) || 0;
  const cFinal = parseFloat(costoImpuesto) || 0;
  const utilidadBruta = Math.round((pFinal - cFinal) * 100) / 100;

  return (
    <div className="p-3 bg-light rounded-2 border">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="text-muted fs-12">Precio Base de Venta:</span>
        <span className="fw-semibold fs-13 text-dark">
          ${Number(precioBase || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      {taxBreakdown.totalFixed > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="text-muted fs-12">Impuestos Fijos:</span>
          <span className="fw-semibold fs-12 text-warning">+${Number(taxBreakdown.totalFixed).toLocaleString('es-CO')}</span>
        </div>
      )}
      {taxBreakdown.totalPercent > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="text-muted fs-12">Impuestos % ({taxBreakdown.totalPercent}%):</span>
          <span className="fw-semibold fs-12 text-primary">
            +${Number((precioBase * taxBreakdown.totalPercent) / 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="text-muted fs-12">Total Impuestos Venta:</span>
        <span className="fw-semibold fs-13 text-primary">
          +${Number(taxBreakdown.totalTaxAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="border-top pt-2 mt-2 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <span className="fw-bold fs-13 text-dark d-block">Precio Final de Venta:</span>
          <small className="text-muted fs-11 font-monospace">(precio_impuesto - editable para redondear)</small>
        </div>
        <div className="d-flex align-items-center gap-1">
          <div className="input-group input-group-sm" style={{ maxWidth: '230px' }}>
            <span className="input-group-text bg-white fw-bold text-success">$</span>
            <Form.Control
              type="number"
              step="1"
              min="0"
              className="text-end fw-bold fs-14 text-success font-monospace"
              value={precioImpuesto ?? ''}
              onChange={e => onPrecioImpuestoChange(e.target.value)}
              title="Precio final con impuestos redondeable"
            />
            <Button
              variant="success"
              type="button"
              size="sm"
              className="text-white px-2 py-0 fs-11 fw-semibold d-flex align-items-center gap-1"
              title="Redondear a denominación COP"
              onClick={onSmartRound}
            >
              <IconifyIcon icon="bx:magic-wand" className="fs-13" />
              Redondear
            </Button>
          </div>
        </div>
      </div>

      {/* Utilidad Bruta (Precio Final de Venta - Costo Final con Impuestos) */}
      <div className="border-top pt-2 mt-2">
        <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded border border-success-subtle shadow-xs">
          <div>
            <div className="d-flex align-items-center gap-1">
              <span className="fw-bold fs-13 text-dark">Utilidad Bruta:</span>
              <span className={`badge ${utilidadBruta >= 0 ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'} fs-10 px-1 py-0`}>
                {utilidadBruta >= 0 ? 'Rentable' : 'Pérdida'}
              </span>
            </div>
            <small className="text-muted fs-11 d-block">
              Precio Final de Venta - Costo Final con Impuestos
            </small>
          </div>
          <div className="text-end">
            <span className={`fw-bold fs-15 font-monospace ${utilidadBruta >= 0 ? 'text-success' : 'text-danger'}`}>
              ${utilidadBruta.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreciosVentaSummary;
