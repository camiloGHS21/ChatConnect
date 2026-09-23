import React from 'react';
import { Card, Col, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import PreciosVentaInputs from './PreciosVentaInputs';
import PreciosVentaTaxesList from './PreciosVentaTaxesList';
import PreciosVentaSummary from './PreciosVentaSummary';
import { calculateTaxBreakdown } from './pricingCalculations';

/**
 * Tarjeta de Precios de Venta al Público
 * Idéntico al template Reback oficial con cálculo dinámico e inverso de impuestos.
 */
const PreciosVentaCard = ({
  formData,
  updateField,
  taxesCatalog = [],
  onPrecioBaseChange,
  onPrecioImpuestoChange,
  onSmartRound,
  onOpenCustomTax,
  triggerDeleteConfirm,
}) => {
  const precioBase = parseFloat(formData?.precio_base) || 0;
  const impuestosVenta = formData?.impuestos_venta || [];
  const taxBreakdown = calculateTaxBreakdown(precioBase, impuestosVenta);

  const handleAddTax = (taxId) => {
    const meta = taxesCatalog.find(t => String(t.id || t.id_impuesto) === String(taxId));
    if (!meta) return;
    if (impuestosVenta.some(t => String(t.impuesto_id) === String(meta.id || meta.id_impuesto))) return;

    const newTax = {
      id: Date.now(),
      impuesto_id: meta.id || meta.id_impuesto,
      codigo: meta.codigo,
      nombre: meta.nombre,
      tipo_calculo: meta.tipo === 'VALOR_FIJO' || meta.tipo_calculo === 'VALOR_FIJO' ? 'VALOR_FIJO' : 'PORCENTAJE',
      porcentaje: parseFloat(meta.porcentaje) || 0,
      valor_fijo: parseFloat(meta.valor || meta.valor_fijo) || 0,
    };
    updateField('impuestos_venta', [...impuestosVenta, newTax]);
  };

  const handleRemoveTax = (taxId) => {
    updateField('impuestos_venta', impuestosVenta.filter(t => t.id !== taxId));
  };

  const handleUpdateValorFijo = (taxId, val) => {
    const updated = impuestosVenta.map(t =>
      t.id === taxId ? { ...t, valor_fijo: val === '' ? '' : parseFloat(val) || 0 } : t
    );
    updateField('impuestos_venta', updated);
  };

  return (
    <Col lg={6} md={12}>
      <Card className="border shadow-none mb-3 bg-light-subtle rounded-3">
        <Card.Header className="bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between">
          <h6 className="mb-0 fw-bold text-dark d-flex align-items-center">
            <IconifyIcon icon="bx:store-alt" className="me-2 text-success fs-18" />
            Precios de Venta al Público
          </h6>
          <Badge bg="success-subtle" className="text-success border border-success border-opacity-25">
            Impuestos de Venta
          </Badge>
        </Card.Header>
        <Card.Body>
          <PreciosVentaInputs
            precioBase={formData?.precio_base}
            precioImpuesto={formData?.precio_impuesto}
            onPrecioBaseChange={onPrecioBaseChange}
            onPrecioImpuestoChange={onPrecioImpuestoChange}
            onSmartRound={onSmartRound}
          />
          <PreciosVentaTaxesList
            taxesCatalog={taxesCatalog}
            impuestosVenta={impuestosVenta}
            precioBase={precioBase}
            onAddTax={handleAddTax}
            onRemoveTax={handleRemoveTax}
            onUpdateValorFijo={handleUpdateValorFijo}
            onOpenCustomTax={onOpenCustomTax}
            triggerDeleteConfirm={triggerDeleteConfirm}
          />
          <PreciosVentaSummary
            precioBase={precioBase}
            precioImpuesto={formData?.precio_impuesto}
            taxBreakdown={taxBreakdown}
            onPrecioImpuestoChange={onPrecioImpuestoChange}
            onSmartRound={onSmartRound}
          />
        </Card.Body>
      </Card>
    </Col>
  );
};

export default PreciosVentaCard;
