import React from 'react';
import { Card, Col, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import CostosCompraInputs from './CostosCompraInputs';
import CostosCompraTaxesList from './CostosCompraTaxesList';
import CostosCompraSummary from './CostosCompraSummary';
import { calculateTaxBreakdown, calculateFinalWithTax } from './pricingCalculations';

/**
 * Tarjeta de Costos de Adquisición / Compra
 * Idéntico al template Reback oficial con cálculo dinámico e inverso de impuestos.
 */
const CostosCompraCard = ({
  formData,
  updateField,
  taxesCatalog = [],
  onCostoBaseChange,
  onCostoImpuestoChange,
  onSmartRound,
  onOpenCustomTax,
  triggerDeleteConfirm,
}) => {
  const costoBase = parseFloat(formData?.costo_base) || 0;
  const impuestosCompra = formData?.impuestos_compra || [];
  const taxBreakdown = calculateTaxBreakdown(costoBase, impuestosCompra);

  const handleAddTax = (taxId) => {
    const meta = taxesCatalog.find(t => String(t.id || t.id_impuesto) === String(taxId));
    if (!meta) return;
    if (impuestosCompra.some(t => String(t.impuesto_id) === String(meta.id || meta.id_impuesto))) return;

    const newTax = {
      id: Date.now(),
      impuesto_id: meta.id || meta.id_impuesto,
      codigo: meta.codigo,
      nombre: meta.nombre,
      tipo_calculo: meta.tipo === 'VALOR_FIJO' || meta.tipo_calculo === 'VALOR_FIJO' ? 'VALOR_FIJO' : 'PORCENTAJE',
      porcentaje: parseFloat(meta.porcentaje) || 0,
      valor_fijo: parseFloat(meta.valor || meta.valor_fijo) || 0,
    };
    const nextTaxes = [...impuestosCompra, newTax];
    updateField('impuestos_compra', nextTaxes);
    const finalCosto = calculateFinalWithTax(costoBase, nextTaxes);
    updateField('costo_impuesto', Math.round(finalCosto * 100) / 100);
  };

  const handleRemoveTax = (taxId) => {
    const nextTaxes = impuestosCompra.filter(t => t.id !== taxId);
    updateField('impuestos_compra', nextTaxes);
    const finalCosto = calculateFinalWithTax(costoBase, nextTaxes);
    updateField('costo_impuesto', Math.round(finalCosto * 100) / 100);
  };

  const handleUpdateValorFijo = (taxId, val) => {
    const updated = impuestosCompra.map(t =>
      t.id === taxId ? { ...t, valor_fijo: val === '' ? '' : parseFloat(val) || 0 } : t
    );
    updateField('impuestos_compra', updated);
    const finalCosto = calculateFinalWithTax(costoBase, updated);
    updateField('costo_impuesto', Math.round(finalCosto * 100) / 100);
  };

  return (
    <Col lg={6} md={12}>
      <Card className="border shadow-none mb-3 bg-light-subtle rounded-3">
        <Card.Header className="bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between">
          <h6 className="mb-0 fw-bold text-dark d-flex align-items-center">
            <IconifyIcon icon="bx:cart-download" className="me-2 text-info fs-18" />
            Costos de Adquisición / Compra
          </h6>
          <Badge bg="info-subtle" className="text-info border border-info border-opacity-25">
            Impuestos de Compra
          </Badge>
        </Card.Header>
        <Card.Body>
          <CostosCompraInputs
            costoBase={formData?.costo_base}
            onCostoBaseChange={onCostoBaseChange}
          />
          <CostosCompraTaxesList
            taxesCatalog={taxesCatalog}
            impuestosCompra={impuestosCompra}
            costoBase={costoBase}
            onAddTax={handleAddTax}
            onRemoveTax={handleRemoveTax}
            onUpdateValorFijo={handleUpdateValorFijo}
            onOpenCustomTax={onOpenCustomTax}
            triggerDeleteConfirm={triggerDeleteConfirm}
          />
          <CostosCompraSummary
            costoBase={costoBase}
            costoImpuesto={formData?.costo_impuesto}
            taxBreakdown={taxBreakdown}
            onCostoImpuestoChange={onCostoImpuestoChange}
            onSmartRound={onSmartRound}
          />
        </Card.Body>
      </Card>
    </Col>
  );
};

export default CostosCompraCard;
