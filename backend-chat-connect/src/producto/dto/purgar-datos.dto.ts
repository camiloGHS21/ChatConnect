/**
 * =============================================================================
 * DTO: Opciones de Purga y Limpieza de Datos de Empresa
 * =============================================================================
 */
export class PurgarDatosDto {
  empresa_id?: number;

  /** Elimina mensajes, conversaciones y procesamientos IA */
  eliminarMensajesIa?: boolean;

  /** Elimina contactos y clientes de la tabla tercero */
  eliminarClientes?: boolean;

  /** Elimina pedidos, carritos y líneas de detalle con impuestos */
  eliminarPedidos?: boolean;

  /** Elimina productos, variantes, inventario y relaciones comerciales */
  eliminarProductos?: boolean;

  /** Elimina categorías, marcas y listas de precios secundarias */
  eliminarCatalogos?: boolean;

  /** Realiza un borrado total operativo de la empresa */
  eliminarTodo?: boolean;

  /** Palabra clave de seguridad exigida: 'ELIMINAR' */
  confirmacion: string;
}
