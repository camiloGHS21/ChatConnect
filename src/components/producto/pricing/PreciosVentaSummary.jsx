import PrecioFinalVentaInputs from './PrecioFinalVentaInputs';

const PreciosVentaSummary = ({
  precioBase = 0,
  taxBreakdown = {},
  precioFinal,
  costoFinal,
  onPrecioFinalChange,
  onSmartRound,
}) => (
  <div className="p-3 bg-body-tertiary rounded-2 border">
    <div className="d-flex justify-content-between align-items-center mb-1">
      <span className="text-muted fs-12">Precio Base de Venta:</span>
      <span className="fw-semibold fs-13 text-body-emphasis">
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
    <div className="border-top pt-3 mt-2">
      <PrecioFinalVentaInputs
        precioFinal={precioFinal}
        costoFinal={costoFinal}
        onPrecioFinalChange={onPrecioFinalChange}
        onSmartRound={onSmartRound}
      />
    </div>
  </div>
);

export default PreciosVentaSummary;
