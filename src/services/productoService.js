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
    const res = await HttpClient.post(`/productos?empresa_id=${empresaId}`, datos, { timeout: 90000 });
    return res.data;
  },

  /**
   * Obtiene un producto completo por su ID para edición o detalle.
   */
  async getProducto(id, empresaId = 1) {
    const res = await HttpClient.get(`/productos/${id}?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Actualiza un producto existente en PostgreSQL y sincroniza el diff con Meta WhatsApp Catalog.
   */
  async actualizarProducto(id, datos, empresaId = 1) {
    const res = await HttpClient.put(`/productos/${id}?empresa_id=${empresaId}`, datos, { timeout: 90000 });
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

  /**
   * Lista los productos registrados en el catálogo.
   */
  async getProductos(empresaId = 1) {
    const res = await HttpClient.get(`/productos?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Ejecuta el seed integral de ferretería: 48 productos con categorías,
   * marcas, variantes, inventario, imágenes y SEO en PostgreSQL.
   */
  async seedFerreteria(empresaId = 1) {
    const res = await HttpClient.post(`/productos/seed-ferreteria?empresa_id=${empresaId}`, {}, { timeout: 120000 });
    return res.data;
  },

  /**
   * Elimina un producto de la base de datos y de WhatsApp / Meta Commerce Catalog.
   */
  async eliminarProducto(id, empresaId = 1) {
    const res = await HttpClient.delete(`/productos/${id}?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Elimina todos los productos de la empresa en PostgreSQL y en el catálogo de WhatsApp.
   */
  async eliminarTodosLosProductos(empresaId = 1) {
    const res = await HttpClient.delete(`/productos/todos?empresa_id=${empresaId}`, { timeout: 120000 });
    return res.data;
  },

  /**
   * Sincroniza manualmente un producto con Meta Catalog (Facebook / WhatsApp).
   */
  async syncMeta(productoId, empresaId = 1) {
    const res = await HttpClient.post(`/productos/${productoId}/sync-meta?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Obtiene todos los catálogos para el módulo de configuración.
   */
  async getConfiguraciones(empresaId = 1) {
    const res = await HttpClient.get(`/productos/configuraciones/catalogos?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Actualiza el nombre/estado de una categoría.
   */
  async actualizarCategoria(id, datos, empresaId = 1) {
    const res = await HttpClient.patch(`/productos/configuraciones/categorias/${id}?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Elimina una categoría si no tiene productos asociados.
   */
  async eliminarCategoria(id, empresaId = 1) {
    const res = await HttpClient.delete(`/productos/configuraciones/categorias/${id}?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Actualiza el nombre/estado de una marca.
   */
  async actualizarMarca(id, datos, empresaId = 1) {
    const res = await HttpClient.patch(`/productos/configuraciones/marcas/${id}?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Elimina una marca si no tiene productos asociados.
   */
  async eliminarMarca(id, empresaId = 1) {
    const res = await HttpClient.delete(`/productos/configuraciones/marcas/${id}?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Actualiza el nombre/estado de una lista de precios.
   */
  async actualizarListaPrecio(id, datos, empresaId = 1) {
    const res = await HttpClient.patch(`/productos/configuraciones/listas-precios/${id}?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Elimina una lista de precios si no tiene productos asociados.
   */
  async eliminarListaPrecio(id, empresaId = 1) {
    const res = await HttpClient.delete(`/productos/configuraciones/listas-precios/${id}?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Actualiza un impuesto en el catálogo.
   */
  async actualizarImpuesto(id, datos, empresaId = 1) {
    const res = await HttpClient.patch(`/productos/configuraciones/impuestos/${id}?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Persiste el estado de una retención del catálogo de referencia.
   */
  async actualizarRetencion(id, datos, empresaId = 1) {
    const res = await HttpClient.patch(`/productos/configuraciones/retenciones/${id}?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Obtiene el catálogo de departamentos.
   */
  async getDepartamentos() {
    const res = await HttpClient.get('/productos/departamentos');
    return res.data;
  },

  /**
   * Obtiene las ciudades (opcionalmente filtradas por departamento).
   */
  async getCiudades(departamentoId) {
    const qs = departamentoId ? `?departamento_id=${departamentoId}` : '';
    const res = await HttpClient.get(`/productos/ciudades${qs}`);
    return res.data;
  },

  /**
   * Registra un nuevo departamento.
   */
  async crearDepartamento(datos) {
    const res = await HttpClient.post('/productos/departamentos', datos);
    return res.data;
  },

  /**
   * Registra una nueva ciudad.
   */
  async crearCiudad(datos) {
    const res = await HttpClient.post('/productos/ciudades', datos);
    return res.data;
  },

  // ==========================================================================
  // COLECCIONES DE PRODUCTOS EN WHATSAPP (Meta Commerce / Graph API)
  // ==========================================================================

  /**
   * Lista todas las colecciones (Product Sets) configuradas en Meta WhatsApp.
   */
  async getColecciones(empresaId = 1) {
    const res = await HttpClient.get(`/productos/colecciones?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Obtiene los productos pertenecientes a una colección en Meta.
   */
  async getProductosDeColeccion(id, empresaId = 1) {
    const res = await HttpClient.get(`/productos/colecciones/${id}/productos?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Crea una nueva colección (Product Set) en Meta Commerce Catalog.
   */
  async crearColeccion(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/colecciones?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  /**
   * Elimina una colección en Meta Catalog.
   */
  async eliminarColeccion(id, empresaId = 1) {
    const res = await HttpClient.delete(`/productos/colecciones/${id}?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Sincroniza automáticamente todas las categorías y subcategorías como colecciones en Meta.
   */
  async sincronizarColecciones(empresaId = 1) {
    const res = await HttpClient.post(`/productos/colecciones/sincronizar?empresa_id=${empresaId}`, {});
    return res.data;
  },

  /**
   * Envía una colección interactiva de productos directamente a un número de WhatsApp vía Meta Cloud API.
   */
  async enviarColeccionWhatsApp(datos, empresaId = 1) {
    const res = await HttpClient.post(`/productos/colecciones/enviar-whatsapp?empresa_id=${empresaId}`, datos);
    return res.data;
  },

  // ==========================================================================
  // CONVERSACIONES Y CHAT EN VIVO WHATSAPP
  // ==========================================================================

  /**
   * Obtiene las conversaciones activas desde PostgreSQL.
   */
  async getConversaciones(empresaId = 1) {
    const res = await HttpClient.get(`/productos/chat/conversaciones?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Obtiene o inicia una conversación para un cliente en PostgreSQL.
   */
  async obtenerOCrearConversacion(clienteId, empresaId = 1) {
    const res = await HttpClient.post(`/productos/chat/conversaciones/obtener-o-crear?empresa_id=${empresaId}`, {
      cliente_id: Number(clienteId),
    });
    return res.data;
  },

  /**
   * Obtiene los mensajes de una conversación desde PostgreSQL.
   */
  async getMensajesConversacion(id, empresaId = 1) {
    const res = await HttpClient.get(`/productos/chat/conversaciones/${id}/mensajes?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Cambia el modo de atención ('ia' o 'humano').
   */
  async cambiarModoConversacion(id, modo, empresaId = 1) {
    const res = await HttpClient.patch(`/productos/chat/conversaciones/${id}/modo?empresa_id=${empresaId}`, { modo });
    return res.data;
  },

  /**
   * Envía un mensaje de texto por WhatsApp al cliente y lo almacena en la BD.
   */
  async enviarMensajeTexto(id, texto, empresaId = 1) {
    const res = await HttpClient.post(`/productos/chat/conversaciones/${id}/enviar-texto?empresa_id=${empresaId}`, { texto });
    return res.data;
  },

  /**
   * Envía automáticamente el catálogo multi-categoría dividido en secciones al cliente.
   */
  async enviarCatalogoMultiCategoria(id, empresaId = 1) {
    const res = await HttpClient.post(`/productos/chat/conversaciones/${id}/enviar-catalogo-multicategoria?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Obtiene las categorías y productos disponibles en PostgreSQL y sincronizados con Meta para enviar en el chat.
   */
  async getCatalogoDisponibleChat(empresaId = 1) {
    const res = await HttpClient.get(`/productos/chat/catalogo-disponible?empresa_id=${empresaId}`);
    return res.data;
  },

  /**
   * Envía un producto individual interactivo (Single Product Message - SPM) al cliente en WhatsApp.
   */
  async enviarProductoChat(conversacionId, codigoInterno, texto = '', empresaId = 1) {
    const res = await HttpClient.post(`/productos/chat/conversaciones/${conversacionId}/enviar-producto?empresa_id=${empresaId}`, {
      codigo_interno: codigoInterno,
      texto,
    });
    return res.data;
  },

  /**
   * Envía productos de 1 o varias categorías (Multi-Product Message - MPM) en secciones interactivas al cliente en WhatsApp.
   */
  async enviarCategoriasChat(conversacionId, categoriaIds, titulo = '', texto = '', empresaId = 1) {
    const res = await HttpClient.post(`/productos/chat/conversaciones/${conversacionId}/enviar-categorias?empresa_id=${empresaId}`, {
      categoria_ids: categoriaIds,
      titulo,
      texto,
    });
    return res.data;
  },
};

export default productoService;
