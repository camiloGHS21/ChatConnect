export interface ImpuestoItemDto {
  impuesto_id: number;
  valor_impuesto?: number;
  tipo?: string;
  porcentaje?: number;
}

export interface ListaPrecioItemDto {
  lista_precio_id: number;
  precio_base?: number;
  utilidad_valor?: number;
  utilidad_porcentaje?: number;
  precio_venta?: number;
}

export interface RetencionItemDto {
  retencion_id: number;
  tipo: 'PORCENTAJE' | 'VALOR_FIJO';
  porcentaje?: number;
  valor_fijo?: number;
}

export interface CodigoBarrasItemDto {
  codigo_barras: string;
  descripcion?: string;
  principal?: boolean;
}

export interface ReferenciaItemDto {
  referencia: string;
  descripcion?: string;
  estado?: string;
}

export interface ProveedorItemDto {
  proveedor_id: number;
  referencia_proveedor?: string;
  principal?: boolean;
}

export interface ImagenItemDto {
  url: string;
  nombre?: string;
  orden?: number;
  principal?: boolean;
}

export interface AtributoAsignadoDto {
  id_atributo: number;
  nombre?: string;
  codigo?: string;
  obligatorio?: boolean;
  orden?: number;
  componentes_seleccionados?: (number | string)[];
}

export interface VarianteItemDto {
  sku?: string;
  combinacion?: string;
  componentes?: any[];
  codigo_barras?: string;
  referencia?: string;
  precio?: number;
  stock?: number;
  estado?: string;
}

export class CreateProductoDto {
  empresa_id?: number;
  categoria_id?: number | null;
  subcategoria_id?: number | null;
  marca_id?: number | null;
  codigo_interno?: string;
  nombre: string;
  descripcion_corta?: string;
  descripcion_larga?: string;
  ficha_tecnica?: string;

  costo_base?: number;
  costo_impuesto?: number;
  precio_base?: number;
  precio_impuesto?: number;
  utilidad_valor?: number;
  utilidad_porcentaje?: number;

  maneja_inventario?: boolean;
  tipo_inventario_id?: number | null;
  stock_minimo?: number;
  stock_maximo?: number;
  medida_id?: number | null;
  presentacion?: string;
  estado_producto?: string;
  estado_publicacion?: string;

  // Inventario inicial
  existencia_inicial?: number;

  // Listas hijas
  impuestos_compra?: ImpuestoItemDto[];
  impuestos_venta?: ImpuestoItemDto[];
  listas_precios?: ListaPrecioItemDto[];
  retenciones?: RetencionItemDto[];
  codigos_barras?: CodigoBarrasItemDto[];
  referencia?: string;
  referencias?: ReferenciaItemDto[];
  proveedores?: ProveedorItemDto[];
  imagenes?: ImagenItemDto[];
  atributos_asignados?: AtributoAsignadoDto[];
  variantes?: VarianteItemDto[];

  // SEO / IA
  titulo_seo?: string;
  descripcion_seo?: string;
  palabras_clave?: string;
  slug?: string;
}
