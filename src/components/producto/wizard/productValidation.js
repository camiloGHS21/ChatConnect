/**
 * @fileoverview Reglas de validación para el asistente de creación de productos.
 * Sincronizado estrictamente con los CHECKs, TRIGGERS y tipos de datos de PostgreSQL.
 */

export const validateStep1 = (data) => {
  const errors = {};
  const codigo = (data?.codigo_interno || '').trim();
  if (codigo.length > 100) errors.codigo_interno = 'El código interno no puede superar 100 caracteres.';

  const nombre = (data?.nombre || '').trim();
  if (!nombre) errors.nombre = 'El nombre del producto es obligatorio.';
  else if (nombre.length < 3) errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
  else if (nombre.length > 250) errors.nombre = 'El nombre no puede superar los 250 caracteres.';

  if (!data?.categoria_id || String(data.categoria_id).trim() === '') {
    errors.categoria_id = 'Debes seleccionar una categoría principal.';
  }

  const errorKeys = Object.keys(errors);
  return { isValid: errorKeys.length === 0, errors, message: errorKeys.length > 0 ? errors[errorKeys[0]] : null };
};

export const validateStep2 = (data) => {
  const errors = {};
  const costo = parseFloat(data?.costo_base);
  if (Number.isNaN(costo) || costo < 0) errors.costo_base = 'El costo base no puede ser negativo.';

  const precio = parseFloat(data?.precio_base);
  if (Number.isNaN(precio) || precio < 0) errors.precio_base = 'El precio base no puede ser negativo.';
  else if (precio === 0) errors.precio_base = 'El precio base de venta debe ser superior a 0.';

  if (Array.isArray(data?.retenciones)) {
    data.retenciones.forEach((ret, idx) => {
      if (ret.tipo === 'PORCENTAJE') {
        const p = parseFloat(ret.porcentaje);
        if (Number.isNaN(p) || p < 0 || p > 100) errors[`retencion_${idx}`] = 'El porcentaje debe estar entre 0 y 100%.';
      }
    });
  }

  const errorKeys = Object.keys(errors);
  return { isValid: errorKeys.length === 0, errors, message: errorKeys.length > 0 ? errors[errorKeys[0]] : null };
};

export const validateStep3 = (data) => {
  const errors = {};
  if (data?.maneja_inventario) {
    const min = parseInt(data?.stock_minimo, 10);
    const max = parseInt(data?.stock_maximo, 10);
    if (Number.isNaN(min) || min < 0) errors.stock_minimo = 'Las existencias mínimas no pueden ser negativas.';
    if (Number.isNaN(max) || max < 0) errors.stock_maximo = 'Las existencias máximas no pueden ser negativas.';
    if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
      errors.stock_maximo = `Las existencias máximas (${max}) no pueden ser inferiores a las existencias mínimas (${min}).`;
    }
    const initStock = parseInt(data?.existencia_inicial, 10);
    if (!Number.isNaN(initStock) && initStock < 0) errors.existencia_inicial = 'La existencia inicial no puede ser negativa.';
  }

  if (Array.isArray(data?.variantes)) {
    data.variantes.forEach((v, idx) => {
      if (!v?.sku || !String(v.sku).trim()) errors[`variante_sku_${idx}`] = `La variante #${idx + 1} requiere un SKU válido.`;
    });
  }

  const errorKeys = Object.keys(errors);
  return { isValid: errorKeys.length === 0, errors, message: errorKeys.length > 0 ? errors[errorKeys[0]] : null };
};

export const validateStep4 = () => ({ isValid: true, errors: {}, message: null });

export const validateStep5 = (data) => {
  const errors = {};
  if (data?.titulo_seo && data.titulo_seo.length > 250) errors.titulo_seo = 'El título SEO no puede exceder 250 caracteres.';
  const errorKeys = Object.keys(errors);
  return { isValid: errorKeys.length === 0, errors, message: errorKeys.length > 0 ? errors[errorKeys[0]] : null };
};

export const validateStep = (stepIndex, data) => {
  switch (stepIndex) {
    case 1: return validateStep1(data);
    case 2: return validateStep2(data);
    case 3: return validateStep3(data);
    case 4: return validateStep4(data);
    case 5: return validateStep5(data);
    default: return { isValid: true, errors: {}, message: null };
  }
};

export const validateAllProductData = (data) => {
  for (let step = 1; step <= 5; step++) {
    const res = validateStep(step, data);
    if (!res.isValid) {
      return { isValid: false, firstInvalidStep: step, errors: res.errors, message: `Paso ${step}: ${res.message}` };
    }
  }
  return { isValid: true, firstInvalidStep: null, errors: {}, message: null };
};
