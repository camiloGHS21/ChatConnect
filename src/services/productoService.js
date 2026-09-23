import HttpClient from '@/helpers/httpClient';

/**
 * Servicio de Productos conectado al Backend NestJS y PostgreSQL DOC 02.
 */
export const productoService = {
  /**
   * Carga los catálogos maestros reales desde la base de datos (categorías, marcas, impuestos, etc.).
   */
  async getCatalogos(empresaId = 1) {
    const res = await HttpClient.get(`/productos/catalogos?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Consulta el siguiente código sugerido por la secuencia de la empresa.
   */
  async getSiguienteCodigo(empresaId = 1) {
    const res = await HttpClient.get(`/productos/siguiente-codigo?empresa_id=${empresaId}`);
    return res.data?.codigo || '';
  },

  /**
   * Persiste el nuevo producto con todas sus entidades hijas en PostgreSQL.
   */
  async crearProducto(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Crea una nueva categoría en PostgreSQL.
   */
  async crearCategoria(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/categorias?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Crea una nueva subcategoría en PostgreSQL.
   */
  async crearSubcategoria(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/subcategorias?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Crea una nueva marca en PostgreSQL.
   */
  async crearMarca(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/marcas?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Crea un nuevo impuesto en PostgreSQL.
   */
  async crearImpuesto(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/impuestos?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Crea una nueva lista de precios en PostgreSQL.
   */
  async crearListaPrecio(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/listas-precios?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Crea un nuevo proveedor (tercero) en PostgreSQL.
   */
  async crearProveedor(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/proveedores?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Crea un nuevo atributo en PostgreSQL.
   */
  async crearAtributo(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/atributos?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Crea un nuevo componente de atributo en PostgreSQL.
   */
  async crearComponente(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/componentes?empresa_id=${empresaId}`, datos);
    return res.data;
  },


};

export default productoService;
