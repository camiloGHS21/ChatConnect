export const getDiscountAmount = product => {
  return product.sale?.type == 'amount' ? product.sale.discount : product.sale?.type == 'percent' ? product.price / 100 * product.sale.discount : 0;
};

export const getCalculatedPrice = product => {
  return getPreciseCurrency(product.price - getDiscountAmount(product));
};

export const getPreciseCurrency = price => {
  return parseFloat(price.toFixed(2));
};

/**
 * Resuelve URLs de imágenes de productos (cadenas, objetos o rutas relativas).
 */
export const resolveProductImageUrl = (rawSrc) => {
  if (!rawSrc) return null;
  if (typeof rawSrc === 'object') {
    return rawSrc.url || rawSrc.src || rawSrc.imagen_principal || null;
  }
  if (typeof rawSrc === 'string') {
    const trimmed = rawSrc.trim();
    if (!trimmed) return null;
    return trimmed;
  }
  return null;
};