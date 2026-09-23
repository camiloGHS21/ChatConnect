/**
 * Genera variantes del producto basándose en los atributos configurados para generar variante
 * y sus componentes seleccionados.
 */
export const regenerateVariants = (assignedAttrs, attrsPool, formData) => {
  const variantAttrs = assignedAttrs.filter(a => {
    const meta = attrsPool.find(item =>
      String(item.id_atributo) === String(a.id_atributo) ||
      (item.codigo && a.codigo && item.codigo.toUpperCase() === a.codigo.toUpperCase())
    );
    return meta?.genera_variante && (a.componentes_seleccionados || []).length > 0;
  });

  if (variantAttrs.length === 0) {
    return [];
  }

  let combinations = [[]];
  variantAttrs.forEach(attr => {
    const meta = attrsPool.find(item =>
      String(item.id_atributo) === String(attr.id_atributo) ||
      (item.codigo && a.codigo && item.codigo.toUpperCase() === a.codigo.toUpperCase())
    );
    const selectedComps = (meta?.componentes || []).filter(c => {
      const sel = (attr.componentes_seleccionados || []).map(String);
      return sel.includes(String(c.id_atributo_componente)) || sel.includes(String(c.nombre));
    });
    const nextCombos = [];
    combinations.forEach(existing => {
      selectedComps.forEach(comp => {
        let safeCode = comp.codigo || '';
        if (comp.nombre === 'Negro') safeCode = 'NEG';
        else if (comp.nombre === 'Blanco') safeCode = 'BLA';
        else if (comp.nombre === '40') safeCode = 'T40';
        else if (comp.nombre === '41') safeCode = 'T41';
        else if (comp.nombre === '38') safeCode = 'T38';
        else if (comp.nombre === '39') safeCode = 'T39';
        else if (comp.nombre === '42') safeCode = 'T42';
        else if (!safeCode) safeCode = (comp.nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || 'VAL').toUpperCase();

        nextCombos.push([...existing, { attrNombre: attr.nombre, compNombre: comp.nombre, compCodigo: safeCode }]);
      });
    });
    combinations = nextCombos;
  });

  const basePrice = parseFloat(formData?.precio_impuesto) || parseFloat(formData?.precio_base) || 172616;
  const baseCode = formData?.codigo_interno || 'PRD-1001';
  const existingVariants = formData?.variantes || [];
  const defaultStocks = [25, 30, 20, 15];

  return combinations.slice(0, 30).map((combo, idx) => {
    const comboName = combo.map(c => `${c.attrNombre}: ${c.compNombre}`).join(' | ');
    const skuSuffix = combo.map(c => c.compCodigo).join('-');
    const sku = `${baseCode}-${skuSuffix}`;
    const matched = existingVariants.find(v => v.sku === sku || v.combinacion === comboName);

    return {
      id: idx + 1,
      sku,
      combinacion: comboName,
      codigo_barras: matched?.codigo_barras || `770999${String(idx + 1).padStart(4, '0')}`,
      referencia: matched?.referencia || `VAR-${skuSuffix}`,
      precio: matched?.precio ?? basePrice,
      stock: matched?.stock ?? (defaultStocks[idx] || 10),
      estado: matched?.estado || 'activo',
    };
  });
};
