/**
 * Sanitización profunda para el robot y políticas de comercio de Meta (WhatsApp).
 */
export function sanitizeMetaText(txt: string, isTitle: boolean = false): string {
  if (!txt) return '';
  let clean = txt
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\b(www\.[a-z0-9.-]+\.[a-z]{2,})/gi, '')
    .replace(/wa\.me\/\S+/gi, '')
    .replace(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g, '')
    .replace(/\b(r[eé]plica|copia\s+exacta|imitaci[oó]n|clon|falsificaci[oó]n)\b/gi, 'Compatible con')
    .replace(/\b[aá]cido\s+muri[aá]tico\b/gi, 'Limpiador Desincrustante')
    .replace(/\bveneno(\s+para\s+ratas)?\b/gi, 'Cebo de Control')
    .replace(/\bpesticida|plaguicida\b/gi, 'Protector de Cultivo')
    .replace(/\bp[oó]lvora\b/gi, 'Material Propulsor')
    .replace(/\bfulminante\b/gi, 'Dispositivo de Fijación')
    .replace(/\b(droga|estupefaciente|narc[oó]tico|marihuana|cannabis|cigarrillo|vapeador|vape)\b/gi, '')
    .replace(/[!¡?¿$]{2,}/g, '!')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (isTitle) {
    const lettersOnly = clean.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
    if (lettersOnly.length > 5 && lettersOnly === lettersOnly.toUpperCase()) {
      clean = clean.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
    }
    return clean.substring(0, 100);
  }

  return clean.substring(0, 5000);
}

/**
 * Construye la descripción enriquecida para WhatsApp Catalog según la jerarquía visual de Meta.
 */
export function buildMetaDescription(params: {
  prod: any;
  refPrincipal?: string;
  catNombre?: string;
  subcatNombre?: string;
  attrsMap?: Map<string, any>;
}): string {
  const { prod, refPrincipal, catNombre, subcatNombre, attrsMap } = params;
  const descBase = sanitizeMetaText(prod.descripcion_corta || prod.descripcion_larga || prod.nombre || '');
  const detailsList: string[] = [];

  if (refPrincipal) detailsList.push(`🔖 Referencia: ${refPrincipal}`);
  if (catNombre) detailsList.push(`🏷️ Categoría: ${catNombre}`);
  if (subcatNombre) detailsList.push(`📁 Subcategoría: ${subcatNombre}`);
  if (prod.marca_nombre) detailsList.push(`🏷️ Marca: ${prod.marca_nombre}`);

  if (attrsMap) {
    for (const [, attr] of attrsMap.entries()) {
      const ops = Array.from(attr.opciones);
      if (ops.length > 0) {
        const lower = attr.nombre.toLowerCase();
        const icon = lower.includes('color') ? '🎨' : lower.includes('talla') ? '📏' : lower.includes('volt') ? '⚡' : '⚙️';
        detailsList.push(`${icon} ${attr.nombre}: ${ops.join(', ')}`);
      }
    }
  }

  if (prod.ficha_tecnica) {
    detailsList.push(`\n📋 Ficha Técnica:\n${sanitizeMetaText(prod.ficha_tecnica)}`);
  }

  if (detailsList.length > 0) {
    return `${descBase}\n\n${detailsList.join('\n')}`.trim();
  }
  return descBase;
}

/**
 * Construye las dimensiones de variantes (ProductGroup) para Meta Commerce.
 */
export function buildVariantDimensions(attrsMap: Map<string, any>, varRows: any[]): any[] {
  const variantDimensions: any[] = [];
  for (const [key, attr] of attrsMap.entries()) {
    const ops = Array.from(attr.opciones);
    if (ops.length === 0) continue;

    if (key.includes('color')) {
      variantDimensions.push({ label: attr.nombre, product_field: 'color', options: ops });
    } else if (key.includes('talla') || key.includes('tamaño') || key.includes('tamano')) {
      variantDimensions.push({ label: attr.nombre, product_field: 'size', options: ops });
    } else if (key.includes('material')) {
      variantDimensions.push({ label: attr.nombre, product_field: 'material', options: ops });
    } else if (key.includes('estampado') || key.includes('diseño') || key.includes('diseno') || key.includes('patron')) {
      variantDimensions.push({ label: attr.nombre, product_field: 'pattern', options: ops });
    } else {
      variantDimensions.push({ label: attr.nombre, product_field: `custom_data:${attr.nombre}`, options: ops });
    }
  }

  if (variantDimensions.length === 0) {
    variantDimensions.push({
      label: 'Opción',
      product_field: 'size',
      options: varRows.map((v: any) => (v.sku || v.referencia || `VAR-${v.id_producto_variante}`).trim()),
    });
  }

  return variantDimensions;
}

/**
 * Extrae y clasifica los componentes de una variante.
 */
export function extractVariantComponents(comps: any[]): {
  color?: string;
  size?: string;
  material?: string;
  pattern?: string;
  additionalAttrs: Record<string, string>;
  specsDetails: string[];
} {
  let color: string | undefined = undefined;
  let size: string | undefined = undefined;
  let material: string | undefined = undefined;
  let pattern: string | undefined = undefined;
  const additionalAttrs: Record<string, string> = {};
  const specsDetails: string[] = [];

  for (const c of comps) {
    const cAttrName = (c.attr_nombre || '').trim();
    const cCompName = (c.comp_nombre || '').trim();
    const lowerName = cAttrName.toLowerCase();

    if (lowerName.includes('color')) {
      color = cCompName;
      specsDetails.push(`🎨 Color: ${cCompName}`);
    } else if (lowerName.includes('talla') || lowerName.includes('tamaño') || lowerName.includes('tamano')) {
      size = cCompName;
      specsDetails.push(`📏 Talla: ${cCompName}`);
    } else if (lowerName.includes('material')) {
      material = cCompName;
      specsDetails.push(`🧵 Material: ${cCompName}`);
    } else if (lowerName.includes('estampado') || lowerName.includes('diseño') || lowerName.includes('diseno') || lowerName.includes('patron')) {
      pattern = cCompName;
      specsDetails.push(`✨ Diseño: ${cCompName}`);
    } else {
      additionalAttrs[cAttrName] = cCompName;
      const icon = lowerName.includes('volt') || lowerName.includes('energ') || lowerName.includes('potenc') ? '⚡' : '⚙️';
      specsDetails.push(`${icon} ${cAttrName}: ${cCompName}`);
    }
  }

  return { color, size, material, pattern, additionalAttrs, specsDetails };
}

/**
 * Asigna una imagen específica de variante según coincidencia con el color.
 */
export function matchVariantImage(color: string | undefined, prodImages: any[], fallbackUrl: string): string {
  if (!prodImages || prodImages.length === 0 || !color) return fallbackUrl;
  const vMatch = prodImages.find((img: any) => {
    const str = `${img.nombre || ''} ${img.url || ''}`.toLowerCase();
    const cLower = color.toLowerCase();
    if (str.includes(cLower)) return true;
    if (cLower.includes('amarillo') && (str.includes('amarillo') || str.includes('yellow') || str.includes('ama'))) return true;
    if (cLower.includes('negro') && (str.includes('negro') || str.includes('black') || str.includes('neg'))) return true;
    if (cLower.includes('blanco') && (str.includes('blanco') || str.includes('white') || str.includes('bla'))) return true;
    if (cLower.includes('azul') && (str.includes('azul') || str.includes('blue') || str.includes('azu'))) return true;
    return false;
  });
  return vMatch?.url || fallbackUrl;
}
