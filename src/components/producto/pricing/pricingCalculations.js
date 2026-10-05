/**
 * @fileoverview Funciones de cálculo para costos, precios, impuestos y redondeo comercial COP.
 */
export { getCommercialRoundingSuggestions, calculateSmartCommercialRound } from './roundingHelpers';

export const calcTaxBreakdown = (taxesList = []) => {
  let totalPorcentaje = 0;
  let totalFijo = 0;
  (taxesList || []).forEach(t => {
    if (t.tipo_calculo === 'VALOR_FIJO' || (t.valor && Number(t.valor) > 0 && !t.porcentaje)) {
      totalFijo += Number(t.valor_fijo || t.valor) || 0;
    } else {
      totalPorcentaje += Number(t.porcentaje) || 0;
    }
  });
  return { totalPorcentaje, totalFijo };
};

export const calculateTaxBreakdown = (baseAmount, taxesList = []) => {
  const base = Number(baseAmount) || 0;
  const { totalPorcentaje, totalFijo } = calcTaxBreakdown(taxesList);
  const totalTaxAmount = ((base * totalPorcentaje) / 100) + totalFijo;
  const totalWithTax = base + totalTaxAmount;

  return {
    base,
    totalPercent: totalPorcentaje,
    totalFixed: totalFijo,
    totalTaxAmount,
    totalWithTax,
  };
};

export const calculateFinalWithTax = (baseAmount, taxesList = []) => {
  const { totalWithTax } = calculateTaxBreakdown(baseAmount, taxesList);
  return totalWithTax;
};

export const calculateReverseBase = (finalAmount, taxList = []) => {
  const finalVal = parseFloat(finalAmount) || 0;
  let totalFijo = 0;
  let totalPorcentaje = 0;

  (taxList || []).forEach(t => {
    if (t.tipo_calculo === 'PORCENTAJE') {
      totalPorcentaje += parseFloat(t.porcentaje) || 0;
    } else {
      totalFijo += parseFloat(t.valor_fijo || t.valor) || 0;
    }
  });

  const subtotalSinFijo = Math.max(0, finalVal - totalFijo);
  const baseCalculada = totalPorcentaje > 0
    ? Math.round((subtotalSinFijo / (1 + totalPorcentaje / 100)) * 100) / 100
    : subtotalSinFijo;

  return { finalVal, totalFijo, totalPorcentaje, baseCalculada };
};

export const calculateProfitMargins = (costoBase, precioBase) => {
  const costo = Number(costoBase) || 0;
  const precio = Number(precioBase) || 0;
  const valor = precio - costo;
  const porcentaje = costo > 0 ? (valor / costo) * 100 : 0;
  return {
    utilidadValor: valor,
    utilidadPorcentaje: porcentaje,
  };
};

export const calculateUtilidadBruta = (precioFinalVenta, costoFinalConImpuestos) => {
  const pFinal = Number(precioFinalVenta) || 0;
  const cFinal = Number(costoFinalConImpuestos) || 0;
  return Math.round((pFinal - cFinal) * 100) / 100;
};

export const syncFinancials = (costoBase, precioBase, taxesCompra = [], taxesVenta = []) => {
  const cBase = Math.max(0, Number(costoBase) || 0);
  const pBase = Math.max(0, Number(precioBase) || 0);
  const cFinal = calculateFinalWithTax(cBase, taxesCompra);
  const pFinal = calculateFinalWithTax(pBase, taxesVenta);
  const { utilidadValor, utilidadPorcentaje } = calculateProfitMargins(cBase, pBase);
  const gananciaFinal = pFinal - cFinal;

  return {
    costo_base: cBase,
    costo_impuesto: Math.round(cFinal * 100) / 100,
    precio_base: pBase,
    precio_impuesto: Math.round(pFinal * 100) / 100,
    utilidad_valor: Math.round(utilidadValor * 100) / 100,
    ganancia_final: Math.round(gananciaFinal * 100) / 100,
    utilidad_bruta: Math.round(gananciaFinal * 100) / 100, // Precio Final de Venta - Costo Final con Impuestos
    utilidad_porcentaje: Math.round(utilidadPorcentaje * 100) / 100,
  };
};

export const calcPriceListByBase = (pBase, cBase, taxPercent = 19) => {
  if (pBase === '' || isNaN(parseFloat(pBase))) {
    return { precio_base: pBase, utilidad_porcentaje: '', precio_venta: '' };
  }
  const base = parseFloat(pBase);
  const cost = parseFloat(cBase) || 0;
  const util = cost > 0 ? ((base - cost) / cost) * 100 : 0;
  const pVenta = base * (1 + taxPercent / 100);
  return {
    precio_base: base,
    utilidad_porcentaje: (Math.round(util * 100) / 100).toString(),
    precio_venta: (Math.round(pVenta * 100) / 100).toString(),
  };
};

export const calcPriceListByUtilidad = (utilPorc, cBase, currentBase, taxPercent = 19) => {
  if (utilPorc === '' || isNaN(parseFloat(utilPorc))) {
    return { utilidad_porcentaje: utilPorc };
  }
  const util = parseFloat(utilPorc);
  const cost = parseFloat(cBase) || 0;
  const base = cost > 0 ? cost * (1 + util / 100) : (parseFloat(currentBase) || 0);
  const pVenta = base * (1 + taxPercent / 100);
  return {
    utilidad_porcentaje: util,
    precio_base: (Math.round(base * 100) / 100).toString(),
    precio_venta: (Math.round(pVenta * 100) / 100).toString(),
  };
};

export const calcPriceListByVenta = (pVenta, cBase, taxPercent = 19) => {
  if (pVenta === '' || isNaN(parseFloat(pVenta))) {
    return { precio_venta: pVenta, precio_base: '', utilidad_porcentaje: '' };
  }
  const venta = parseFloat(pVenta);
  const cost = parseFloat(cBase) || 0;
  const base = venta / (1 + taxPercent / 100);
  const util = cost > 0 ? ((base - cost) / cost) * 100 : 0;
  return {
    precio_venta: venta,
    precio_base: (Math.round(base * 100) / 100).toString(),
    utilidad_porcentaje: (Math.round(util * 100) / 100).toString(),
  };
};
