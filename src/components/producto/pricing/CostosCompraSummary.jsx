
import { Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const CostosCompraSummary = ({
  costoBase = 0,
  costoImpuesto = 0,
  taxBreakdown = {},
  onCostoImpuestoChange,
  onSmartRound
}) => {
  return (
    <div className="p-3 bg-body-tertiary rounded-2 border">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="text-muted fs-12">Costo Base:</span>
        <span className="fw-semibold fs-13 text-body-emphasis">
          ${Number(costoBase || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            +${Number((costoBase * taxBreakdown.totalPercent) / 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="text-muted fs-12">Total Impuestos Compra:</span>
        <span className="fw-semibold fs-13 text-primary">
          +${Number(taxBreakdown.totalTaxAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="border-top pt-3 mt-2">
        <div>
          <Form.Label htmlFor="costo_final_input" className="fw-bold fs-13 text-body-emphasis d-block mb-1">Costo Final con Impuestos:</Form.Label>

        </div>
        <div>
          <div className="input-group w-100">
            <span className="input-group-text bg-body fw-bold text-info">$</span>
            <Form.Control
              id="costo_final_input"
              type="number"
              step="1"
              min="0"
              className="text-end fw-bold fs-14 text-info font-monospace"
              value={costoImpuesto ?? ''}
              onChange={e => onCostoImpuestoChange(e.target.value)}
              title="Costo final con impuestos redondeable"
              aria-label="Costo final con impuestos"
            />
            <Button
              variant="info"
              type="button"
              className="text-white fw-semibold d-flex align-items-center gap-1"
              title="Redondear a denominación COP"
              onClick={onSmartRound}
            >
              <IconifyIcon icon="bx:magic-wand" className="fs-13" />
              Redondear
            </Button>
          </div>
          <Form.Text className="fs-11">Puedes editar el costo final para redondearlo.</Form.Text>
        </div>
      </div>
    </div>
  );
};

export default CostosCompraSummary;
