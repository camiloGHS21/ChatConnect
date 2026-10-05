import {
  ImpuestoItemDto,
  ListaPrecioItemDto,
  RetencionItemDto,
  CodigoBarrasItemDto,
  ReferenciaItemDto,
  ProveedorItemDto,
  ImagenItemDto,
  AtributoAsignadoDto,
  VarianteItemDto,
} from './create-producto.dto.js';

export class UpdateProductoDto {
  empresa_id?: number;
  categoria_id?: number | null;
  subcategoria_id?: number | null;
  marca_id?: number | null;
  codigo_interno?: string;
  nombre?: string;
  descripcion_corta?: string;
  descripcion_larga?: string;
  ficha_tecnica?: string;

  costo_base?: number;
  costo_impuesto?: number;
  precio_base?: number;
  precio_impuesto?: number;
  utilidad_valor?: number;
  utilidad_bruta?: number;
  utilidad_porcentaje?: number;

  maneja_inventario?: boolean;
  tipo_inventario_id?: number | null;
  stock_minimo?: number;
  stock_maximo?: number;
  medida_id?: number | null;
  presentacion?: string;
  estado_producto?: string;
  estado_publicacion?: string;

  existencia_inicial?: number;

  impuestos_compra?: ImpuestoItemDto[];
  impuestos_venta?: ImpuestoItemDto[];
  listas_precios?: ListaPrecioItemDto[];
  retenciones?: RetencionItemDto[];
  codigos_barras?: CodigoBarrasItemDto[];
  referencias?: ReferenciaItemDto[];
  referencia?: string;
  proveedores?: ProveedorItemDto[];

  titulo_seo?: string;
  descripcion_seo?: string;
  palabras_clave?: string;
  slug?: string;

  imagenes?: ImagenItemDto[];
  atributos_asignados?: AtributoAsignadoDto[];
  variantes?: VarianteItemDto[];
}
