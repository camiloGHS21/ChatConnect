import { useState } from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const CostosCompraTaxesList = ({
  taxesCatalog = [],
  impuestosCompra = [],
  costoBase = 0,
  onAddTax,
  onRemoveTax,
  onUpdateValorFijo,
  onOpenCustomTax,
  triggerDeleteConfirm
}) => {
  const [selectedTaxId, setSelectedTaxId] = useState('');

  const handleAssign = () => {
    if (!selectedTaxId || selectedTaxId === 'CREATE_NEW') return;
    onAddTax(selectedTaxId);
    setSelectedTaxId('');
  };

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <label htmlFor="producto-impuesto-compra" className="form-label fw-semibold mb-0 fs-13">Impuestos Aplicables a la Compra</label>
        {onOpenCustomTax && (
          <Button variant="link" size="sm" className="p-0 fs-12 text-primary fw-semibold" onClick={onOpenCustomTax}>
            + Crear Impuesto Fijo/%
          </Button>
        )}
      </div>

      <div className="input-group mb-2">
        <Form.Select
          id="producto-impuesto-compra"
          size="sm"
          value={selectedTaxId}
          onChange={e => {
            if (e.target.value === 'CREATE_NEW' && onOpenCustomTax) onOpenCustomTax();
            else setSelectedTaxId(e.target.value);
          }}
        >
          <option value="">-- Seleccionar Impuesto --</option>
          {taxesCatalog.map(tax => {
            const isAssigned = impuestosCompra.some(t => String(t.impuesto_id) === String(tax.id || tax.id_impuesto));
            return (
              <option key={tax.id || tax.id_impuesto} value={tax.id || tax.id_impuesto} disabled={isAssigned}>
                {tax.nombre} ({tax.porcentaje ? `${tax.porcentaje}%` : `$${tax.valor || tax.valor_fijo} Fijo`}) {isAssigned ? '— (Ya asignado)' : ''}
              </option>
            );
          })}
          <option value="CREATE_NEW" className="fw-bold text-primary">+ Crear nuevo impuesto...</option>
        </Form.Select>
        <Button variant="outline-primary" size="sm" onClick={handleAssign} disabled={!selectedTaxId || selectedTaxId === 'CREATE_NEW'}>
          <IconifyIcon icon="bx:plus" className="me-1" /> Asignar
        </Button>
      </div>

      <div className="border rounded bg-body-tertiary p-2">
        {impuestosCompra.length === 0 ? (
          <div className="text-center py-2 text-muted fs-12">Sin impuestos de compra (Costo base = Costo final).</div>
        ) : (
          impuestosCompra.map(tax => {
            const isFixed = tax.tipo_calculo === 'VALOR_FIJO';
            const valorCalc = isFixed ? (parseFloat(tax.valor_fijo) || 0) : (costoBase * (parseFloat(tax.porcentaje) || 0)) / 100;
            return (
              <div key={tax.id} className="d-flex align-items-center justify-content-between bg-body p-2 mb-1 rounded border shadow-xs">
                <div className="d-flex align-items-center gap-2">
                  <Badge bg={isFixed ? 'warning-subtle' : 'primary-subtle'} className={isFixed ? 'text-warning fs-11' : 'text-primary fs-11'}>
                    {isFixed ? 'Fijo $' : `${tax.porcentaje}%`}
                  </Badge>
                  <span className="fs-13 fw-medium text-body">{tax.nombre}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {isFixed ? (
                    <div className="input-group input-group-sm" style={{ width: '130px' }}>
                      <span className="input-group-text py-0 px-2 fs-12">$</span>
                      <Form.Control
                        size="sm"
                        type="number"
                        min="0"
                        className="py-0 px-2 fs-12 text-end font-monospace fw-semibold text-body-emphasis"
                        aria-label={`Valor fijo del impuesto de compra ${tax.nombre}`}
                                                value={tax.valor_fijo ?? ''}
                        onChange={e => onUpdateValorFijo(tax.id, e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="fs-13 font-monospace text-muted">+${Number(valorCalc).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0 ms-1"
                    aria-label={`Eliminar impuesto de compra ${tax.nombre}`}
                    title="Eliminar impuesto de compra"
                    onClick={() => triggerDeleteConfirm ? triggerDeleteConfirm({
                      title: '¿Eliminar impuesto de compra?',
                      itemName: `${tax.nombre}`,
                      itemType: 'impuesto',
                      onConfirm: () => onRemoveTax(tax.id)
                    }) : onRemoveTax(tax.id)}
                  >
                    <IconifyIcon icon="bx:x" className="fs-16" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CostosCompraTaxesList;
