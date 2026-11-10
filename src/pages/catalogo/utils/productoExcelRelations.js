const split = value => String(value || '').split(';').map(v => v.trim()).filter(Boolean);
const amount = value => {
  const number = Number(String(value).replace(',', '.'));
  if (!String(value).trim() || !Number.isFinite(number) || number < 0 || number >= 1e12) {
    throw new Error('Importe inválido: use un número positivo o cero sin separadores de miles');
  }
  return number;
};

function catalogItem(items, value, label) {
  const id = Number(value);
  const item = (items || []).find(item => Number(item.id) === id);
  if (!Number.isInteger(id) || !item) throw new Error(`${label}: ID no encontrado en el catálogo de la empresa`);
  return item;
}

export const RELATION_COLUMNS = ['impuestos_compra_ids', 'impuestos_venta_ids',
  'codigos_barras', 'proveedores_ids', 'listas_precios_valores'];

export function applyProductRelations(values, dto, catalogos) {
  for (const type of ['compra', 'venta']) {
    const ids = split(values[`impuestos_${type}_ids`]);
    if (!ids.length) continue;
    const seen = new Set();
    const base = dto[type === 'compra' ? 'costo_base' : 'precio_base'] || 0;
    dto[`impuestos_${type}`] = ids.map(id => {
      const tax = catalogItem(catalogos.impuestos, id, `Impuesto de ${type}`);
      if (seen.has(Number(id))) throw new Error(`Impuesto de ${type} repetido: ${id}`);
      seen.add(Number(id));
      const total = tax.tipo === 'VALOR_FIJO' ? amount(tax.valor ?? 0) : base * amount(tax.porcentaje ?? 0) / 100;
      return { impuesto_id: Number(id), valor_impuesto: Math.round(total * 100) / 100 };
    });
    const key = type === 'compra' ? 'costo_impuesto' : 'precio_impuesto';
    if (dto[key] === undefined) dto[key] = Math.round((base + dto[`impuestos_${type}`].reduce((sum, tax) => sum + tax.valor_impuesto, 0)) * 100) / 100;
  }
  const barcodes = split(values.codigos_barras);
  if (barcodes.length) {
    if (new Set(barcodes).size !== barcodes.length) throw new Error('Códigos de barras repetidos');
    if (barcodes.some(code => code.length > 100)) throw new Error('Código de barras demasiado largo');
    dto.codigos_barras = barcodes.map((codigo_barras, index) => ({ codigo_barras, principal: index === 0 }));
  }
  const suppliers = split(values.proveedores_ids);
  if (suppliers.length) {
    if (new Set(suppliers.map(Number)).size !== suppliers.length) throw new Error('Proveedor repetido');
    dto.proveedores = suppliers.map((id, index) => ({
      proveedor_id: Number(catalogItem(catalogos.proveedores, id, 'Proveedor').id), principal: index === 0,
    }));
  }
  const prices = split(values.listas_precios_valores);
  if (prices.length) {
    const seen = new Set();
    dto.listas_precios = prices.map(entry => {
      const parts = entry.split(':');
      if (parts.length !== 2) throw new Error('Listas de precios: use ID:precio;ID:precio');
      const item = catalogItem(catalogos.listasPrecios, parts[0], 'Lista de precios');
      if (seen.has(Number(item.id))) throw new Error('Lista de precios repetida');
      seen.add(Number(item.id));
      return { lista_precio_id: Number(item.id), precio_base: dto.precio_base || 0, precio_venta: amount(parts[1]) };
    });
  }
}

export function exportProductRelations(product) {
  return {
    impuestos_compra_ids: (product.impuestos_compra || []).map(i => i.impuesto_id).join(';'),
    impuestos_venta_ids: (product.impuestos_venta || []).map(i => i.impuesto_id).join(';'),
    codigos_barras: (product.codigos_barras || []).map(i => i.codigo_barras).join(';'),
    proveedores_ids: (product.proveedores || []).map(i => i.proveedor_id).join(';'),
    listas_precios_valores: (product.listas_precios || []).map(i => `${i.lista_precio_id}:${i.precio_venta}`).join(';'),
  };
}
