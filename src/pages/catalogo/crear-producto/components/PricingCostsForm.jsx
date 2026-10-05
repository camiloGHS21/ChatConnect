import React, { useState } from 'react';
import { Row } from 'react-bootstrap';
import CostosCompraCard from '@/components/producto/pricing/CostosCompraCard';
import PreciosVentaCard from '@/components/producto/pricing/PreciosVentaCard';
import RentabilidadSummaryCard from '@/components/producto/pricing/RentabilidadSummaryCard';
import ListasPreciosCard from '@/components/producto/pricing/ListasPreciosCard';
import RetencionesCard from '@/components/producto/pricing/RetencionesCard';
import ModalNuevoImpuesto from '@/components/producto/pricing/ModalNuevoImpuesto';
import ModalNuevaListaPrecio from '@/components/producto/pricing/ModalNuevaListaPrecio';
import {
  calculateReverseBase,
  calculateSmartCommercialRound,
  syncFinancials,
} from '@/components/producto/pricing/pricingCalculations';

const PricingCostsForm = ({ formData, updateField, catalogs = {}, triggerDeleteConfirm }) => {
  const [modalTax, setModalTax] = useState({ show: false, target: 'compra' });
  const [showPriceListModal, setShowPriceListModal] = useState(false);
  const [allCustomTaxes, setAllCustomTaxes] = useState([]);
  const [allCustomLists, setAllCustomLists] = useState([]);

  const taxesList = [...(catalogs.impuestos || []), ...allCustomTaxes];
  const priceLists = [...(catalogs.listasPrecios || []), ...allCustomLists];
  const withholdingsList = catalogs.retenciones || [];

  const handleCostoBaseChange = (val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    const fin = syncFinancials(num, parseFloat(formData.precio_base) || 0, formData.impuestos_compra, formData.impuestos_venta);
    Object.entries(fin).forEach(([k, v]) => updateField(k, v));
  };

  const handlePrecioBaseChange = (val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    const fin = syncFinancials(parseFloat(formData.costo_base) || 0, num, formData.impuestos_compra, formData.impuestos_venta);
    Object.entries(fin).forEach(([k, v]) => updateField(k, v));
  };

  const handleCostoImpuestoChange = (val) => {
    const finalVal = parseFloat(val);
    if (isNaN(finalVal)) { updateField('costo_impuesto', val); return; }
    const { baseCalculada } = calculateReverseBase(finalVal, formData.impuestos_compra || []);
    handleCostoBaseChange(baseCalculada);
    updateField('costo_impuesto', finalVal);
    const pFinal = parseFloat(formData?.precio_impuesto) || 0;
    const utilBruta = Math.round((pFinal - finalVal) * 100) / 100;
    updateField('ganancia_final', utilBruta);
    updateField('utilidad_bruta', utilBruta);
  };

  const handlePrecioImpuestoChange = (val) => {
    const finalVal = parseFloat(val);
    if (isNaN(finalVal)) { updateField('precio_impuesto', val); return; }
    const { baseCalculada } = calculateReverseBase(finalVal, formData.impuestos_venta || []);
    handlePrecioBaseChange(baseCalculada);
    updateField('precio_impuesto', finalVal);
    const cFinal = parseFloat(formData?.costo_impuesto) || 0;
    const utilBruta = Math.round((finalVal - cFinal) * 100) / 100;
    updateField('ganancia_final', utilBruta);
    updateField('utilidad_bruta', utilBruta);
  };

  const handleSmartRound = (target) => {
    const current = parseFloat(target === 'precio' ? formData.precio_impuesto : formData.costo_impuesto) || 0;
    const rounded = calculateSmartCommercialRound(current);
    if (target === 'precio') handlePrecioImpuestoChange(rounded);
    else handleCostoImpuestoChange(rounded);
  };

  const handleSaveTax = (newTax, target) => {
    setAllCustomTaxes(prev => [...prev, newTax]);
    const field = target === 'compra' ? 'impuestos_compra' : 'impuestos_venta';
    const updated = [...(formData[field] || []), newTax];
    updateField(field, updated);
    const fin = syncFinancials(
      parseFloat(formData.costo_base) || 0,
      parseFloat(formData.precio_base) || 0,
      target === 'compra' ? updated : formData.impuestos_compra || [],
      target === 'venta' ? updated : formData.impuestos_venta || []
    );
    Object.entries(fin).forEach(([k, v]) => updateField(k, v));
  };

  return (
    <div className="product-pricing-form">
      <div className="mb-3">
        <h5 className="card-title mb-1">Costos, Precios e Impuestos</h5>
        <p className="text-muted fs-14 mb-0">
          Definición de costos, precio base, cálculo de múltiples impuestos (porcentaje y fijos) y margen de utilidad
        </p>
      </div>

      <Row className="g-4 mb-3">
        <CostosCompraCard
          formData={formData}
          updateField={updateField}
          taxesCatalog={taxesList}
          onCostoBaseChange={handleCostoBaseChange}
          onCostoImpuestoChange={handleCostoImpuestoChange}
          onSmartRound={() => handleSmartRound('costo')}
          onOpenCustomTax={() => setModalTax({ show: true, target: 'compra' })}
          triggerDeleteConfirm={triggerDeleteConfirm}
        />
        <PreciosVentaCard
          formData={formData}
          updateField={updateField}
          taxesCatalog={taxesList}
          costoImpuesto={formData?.costo_impuesto}
          onPrecioBaseChange={handlePrecioBaseChange}
          onPrecioImpuestoChange={handlePrecioImpuestoChange}
          onSmartRound={() => handleSmartRound('precio')}
          onOpenCustomTax={() => setModalTax({ show: true, target: 'venta' })}
          triggerDeleteConfirm={triggerDeleteConfirm}
        />
      </Row>

      <RentabilidadSummaryCard
        utilidadValor={formData?.utilidad_valor}
        utilidadPorcentaje={formData?.utilidad_porcentaje}
        costoFinal={formData?.costo_impuesto}
        precioFinal={formData?.precio_impuesto}
        costoBase={formData?.costo_base}
        precioBase={formData?.precio_base}
        gananciaFinal={formData?.ganancia_final}
        utilidadBruta={formData?.utilidad_bruta ?? formData?.ganancia_final}
      />

      <ListasPreciosCard
        formData={formData}
        updateField={updateField}
        priceListsCatalog={priceLists}
        taxesCatalog={taxesList}
        costoBase={parseFloat(formData.costo_base) || 0}
        onOpenCreateList={() => setShowPriceListModal(true)}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />

      <RetencionesCard
        formData={formData}
        updateField={updateField}
        withholdingsCatalog={withholdingsList}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />

      <ModalNuevoImpuesto
        show={modalTax.show}
        target={modalTax.target}
        onHide={() => setModalTax({ show: false, target: 'compra' })}
        onSave={handleSaveTax}
        existingTaxes={taxesList}
      />

      <ModalNuevaListaPrecio
        show={showPriceListModal}
        onHide={() => setShowPriceListModal(false)}
        onSave={(newList) => setAllCustomLists(prev => [...prev, newList])}
        existingLists={priceLists}
      />
    </div>
  );
};

export default PricingCostsForm;
