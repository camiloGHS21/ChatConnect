import { applyProductRelations, RELATION_COLUMNS } from './productoExcelRelations.js';

export const PRODUCT_COLUMNS = [
  'codigo_interno', 'nombre', 'descripcion_corta', 'categoria_id', 'subcategoria_id',
  'marca_id', 'costo_base', 'precio_base', 'precio_impuesto', 'existencia_inicial',
  'maneja_inventario', 'stock_minimo', 'stock_maximo', 'medida_id',
  'tipo_inventario_id', 'presentacion', 'referencia', 'estado_producto', 'estado_publicacion',
  'descripcion_larga', 'ficha_tecnica', 'costo_impuesto',
  'titulo_seo', 'descripcion_seo', 'palabras_clave', 'slug', ...RELATION_COLUMNS,
];

const numericFields = new Set(['costo_base', 'costo_impuesto', 'precio_base', 'precio_impuesto',
  'existencia_inicial', 'stock_minimo', 'stock_maximo']);
const catalogs = {
  categoria_id: 'categorias', subcategoria_id: 'subcategorias', marca_id: 'marcas',
  medida_id: 'medidas', tipo_inventario_id: 'tiposInventario',
};
const textLimits = { codigo_interno: 100, nombre: 250, descripcion_corta: 10000,
  presentacion: 1000, referencia: 100, descripcion_larga: 30000, ficha_tecnica: 30000,
  descripcion_seo: 1000, palabras_clave: 1000 };

export function parseProductRow(values, catalogos, existingCodes) {
  const dto = {};
  for (const key of PRODUCT_COLUMNS) {
    if (RELATION_COLUMNS.includes(key)) continue;
    const value = values[key];
    if (value === undefined || value === null || String(value).trim() === '') continue;
    const text = String(value).trim();
    if (numericFields.has(key) || catalogs[key]) {
      const number = typeof value === 'number' ? value : Number(text.replace(',', '.'));
      if (!Number.isFinite(number) || number < 0) throw new Error(`${key}: debe ser un número positivo o cero (sin separador de miles)`);
      if (catalogs[key] && (!Number.isInteger(number) || !(catalogos[catalogs[key]] || []).some(c => Number(c.id) === number))) {
        throw new Error(`${key}: ID no encontrado en el catálogo de la empresa`);
      }
      if (['stock_minimo', 'stock_maximo'].includes(key) && !Number.isInteger(number)) throw new Error(`${key}: debe ser entero`);
      if (numericFields.has(key) && number >= 1e12) throw new Error(`${key}: valor fuera de rango`);
      dto[key] = number;
    } else if (key === 'maneja_inventario') {
      const normalized = text.toLowerCase();
      if (!['si', 'sí', 'no', 'true', 'false', '1', '0'].includes(normalized)) throw new Error('maneja_inventario: use SI o NO');
      dto[key] = ['si', 'sí', 'true', '1'].includes(normalized);
    } else {
      if (text.length > (textLimits[key] || 255)) throw new Error(`${key}: texto demasiado largo`);
      dto[key] = text;
    }
  }
  if (!dto.nombre) throw new Error('El nombre es obligatorio');
  if (dto.codigo_interno && existingCodes.has(dto.codigo_interno.toLowerCase())) throw new Error(`Código existente o repetido: ${dto.codigo_interno}`);
  if (dto.subcategoria_id) {
    const sub = catalogos.subcategorias.find(s => Number(s.id) === dto.subcategoria_id);
    if (Number(sub.categoria_id) !== dto.categoria_id) throw new Error('La subcategoría no pertenece a la categoría indicada');
  }
  if (dto.estado_producto && !['activo', 'inactivo'].includes(dto.estado_producto)) throw new Error('estado_producto: use activo o inactivo');
  if (dto.estado_publicacion && !['publicado', 'no_publicado'].includes(dto.estado_publicacion)) throw new Error('estado_publicacion: use publicado o no_publicado');
  if (dto.stock_maximo && dto.stock_maximo < (dto.stock_minimo || 0)) throw new Error('stock_maximo debe ser mayor o igual a stock_minimo');
  if (dto.maneja_inventario === false && ['existencia_inicial', 'stock_minimo', 'stock_maximo'].some(key => dto[key] > 0)) {
    throw new Error('Un servicio sin inventario debe dejar existencia y stocks vacíos o en cero');
  }
  applyProductRelations(values, dto, catalogos);
  return dto;
}
