import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from '../dto/create-producto.dto.js';
import { UpdateProductoDto } from '../dto/update-producto.dto.js';
import { CreateColeccionDto } from '../dto/create-coleccion.dto.js';
import { EnviarColeccionWhatsAppDto } from '../dto/enviar-coleccion-whatsapp.dto.js';
import { CatalogoRepository } from './catalogo.repository.js';
import { CatalogoConfigRepository } from './catalogo-config.repository.js';
import { GeografiaProveedorRepository } from './geografia-proveedor.repository.js';
import { ProductoQueryRepository } from './producto-query.repository.js';
import { ProductoCreateRepository } from './producto-create.repository.js';
import { ProductoUpdateRepository } from './producto-update.repository.js';
import { ProductoDeleteRepository } from './producto-delete.repository.js';
import { MetaCatalogRepository } from './meta-catalog.repository.js';
import { MetaColeccionRepository } from './meta-coleccion.repository.js';
import { ChatWhatsappRepository } from './chat-whatsapp.repository.js';
import { ChatCatalogoRepository } from './chat-catalogo.repository.js';
import { resolverUrlPublicaImagen } from './image-upload.helper.js';

/**
 * ============================================================================
 * PRODUCTO REPOSITORY (Facade / Orquestador Central)
 * ============================================================================
 * Provee la interfaz pública completa esperada por ProductoController sin
 * alterar contratos, delegando cada responsabilidad a repositorios especializados
 * de TypeORM conforme a las reglas de arquitectura de ChatConnect (DOC 02).
 */
@Injectable()
export class ProductoRepository {
  constructor(
    private readonly catalogoRepo: CatalogoRepository,
    private readonly catalogoConfigRepo: CatalogoConfigRepository,
    private readonly geografiaProveedorRepo: GeografiaProveedorRepository,
    private readonly productoQueryRepo: ProductoQueryRepository,
    private readonly productoCreateRepo: ProductoCreateRepository,
    private readonly productoUpdateRepo: ProductoUpdateRepository,
    private readonly productoDeleteRepo: ProductoDeleteRepository,
    private readonly metaCatalogRepo: MetaCatalogRepository,
    private readonly metaColeccionRepo: MetaColeccionRepository,
    private readonly chatWhatsappRepo: ChatWhatsappRepository,
    private readonly chatCatalogoRepo: ChatCatalogoRepository,
  ) { }

  // --- Configuración y Catálogos ---
  async asegurarConfiguracionDianPorDefecto(empresaId = 1): Promise<void> {
    return this.catalogoConfigRepo.asegurarConfiguracionDianPorDefecto(empresaId);
  }

  async getCatalogos(empresaId = 1) {
    return this.catalogoRepo.getCatalogos(empresaId);
  }

  async getSiguienteCodigo(empresaId = 1): Promise<{ codigo: string }> {
    return this.productoQueryRepo.getSiguienteCodigo(empresaId);
  }

  async crearCategoria(dto: { nombre: string }, empresaId = 1) {
    return this.catalogoRepo.crearCategoria(dto, empresaId);
  }

  async crearSubcategoria(dto: { categoria_id: number; nombre: string }, empresaId = 1) {
    return this.catalogoRepo.crearSubcategoria(dto, empresaId);
  }

  async crearMarca(dto: { nombre: string }, empresaId = 1) {
    return this.catalogoRepo.crearMarca(dto, empresaId);
  }

  async crearImpuesto(dto: { codigo?: string; nombre: string; porcentaje?: number; valor?: number; tipo?: string }, empresaId = 1) {
    return this.catalogoRepo.crearImpuesto(dto, empresaId);
  }

  async crearListaPrecio(dto: { nombre: string }, empresaId = 1) {
    return this.catalogoRepo.crearListaPrecio(dto, empresaId);
  }

  async getCatalogosConfiguracion(empresaId = 1) {
    return this.catalogoConfigRepo.getCatalogosConfiguracion(empresaId);
  }

  async actualizarCategoria(id: number, dto: { nombre?: string; estado?: string }, empresaId = 1) {
    return this.catalogoRepo.actualizarCategoria(id, dto, empresaId);
  }

  async actualizarMarca(id: number, dto: { nombre?: string; estado?: string }, empresaId = 1) {
    return this.catalogoRepo.actualizarMarca(id, dto, empresaId);
  }

  async actualizarListaPrecio(id: number, dto: { nombre?: string; estado?: string }, empresaId = 1) {
    return this.catalogoRepo.actualizarListaPrecio(id, dto, empresaId);
  }

  async actualizarImpuesto(id: number, dto: { nombre?: string; porcentaje?: number; valor?: number; tipo?: string; estado?: string }, empresaId = 1) {
    return this.catalogoRepo.actualizarImpuesto(id, dto, empresaId);
  }

  async eliminarCategoria(id: number, empresaId = 1) {
    return this.catalogoRepo.eliminarCategoria(id, empresaId);
  }

  async eliminarMarca(id: number, empresaId = 1) {
    return this.catalogoRepo.eliminarMarca(id, empresaId);
  }

  async eliminarListaPrecio(id: number, empresaId = 1) {
    return this.catalogoRepo.eliminarListaPrecio(id, empresaId);
  }

  // --- Geografía y Proveedores ---
  async getDepartamentos() {
    return this.geografiaProveedorRepo.getDepartamentos();
  }

  async getCiudades(departamentoId?: number) {
    return this.geografiaProveedorRepo.getCiudades(departamentoId);
  }

  async crearDepartamento(dto: { codigo?: string; nombre: string }) {
    return this.geografiaProveedorRepo.crearDepartamento(dto);
  }

  async crearCiudad(dto: { id_departamento: number; codigo?: string; nombre: string }) {
    return this.geografiaProveedorRepo.crearCiudad(dto);
  }

  async crearProveedor(dto: any, empresaId = 1) {
    return this.geografiaProveedorRepo.crearProveedor(dto, empresaId);
  }

  async crearAtributo(dto: any, empresaId = 1) {
    return this.geografiaProveedorRepo.crearAtributo(dto, empresaId);
  }

  async crearComponente(dto: { atributo_id: number; nombre: string; codigo?: string; valor?: string; descripcion?: string; orden?: number }, empresaId = 1) {
    return this.geografiaProveedorRepo.crearComponente(dto, empresaId);
  }

  async resolverUrlPublicaImagen(urlOPath?: string | null): Promise<string> {
    return resolverUrlPublicaImagen(urlOPath);
  }

  // --- CRUD de Productos ---
  async crearProducto(dto: CreateProductoDto, empresaId = 1) {
    return this.productoCreateRepo.crearProducto(dto, empresaId);
  }

  async getProductos(empresaId = 1) {
    return this.productoQueryRepo.getProductos(empresaId);
  }

  async getProductoPorId(productoId: number, empresaId = 1) {
    return this.productoQueryRepo.getProductoPorId(productoId, empresaId);
  }

  async actualizarProducto(productoId: number, dto: UpdateProductoDto, empresaId = 1) {
    return this.productoUpdateRepo.actualizarProducto(productoId, dto, empresaId);
  }

  async eliminarProducto(productoId: number, empresaId = 1) {
    return this.productoDeleteRepo.eliminarProducto(productoId, empresaId);
  }

  async eliminarTodosLosProductos(empresaId = 1) {
    return this.productoDeleteRepo.eliminarTodosLosProductos(empresaId);
  }

  async seedFerreteria(empresaId = 1) {
    return this.productoDeleteRepo.seedFerreteria(empresaId);
  }

  // --- Sincronización Meta Catalog ---
  async sincronizarConMetaCatalog(productoId: number, empresaId = 1, cachedContext?: any) {
    return this.metaCatalogRepo.sincronizarConMetaCatalog(productoId, empresaId, cachedContext);
  }

  async sincronizarLoteConMetaCatalog(productoIds: number[], empresaId = 1) {
    return this.metaCatalogRepo.sincronizarLoteConMetaCatalog(productoIds, empresaId);
  }

  // --- Colecciones Meta ---
  async getColeccionesMeta(empresaId = 1) {
    return this.metaColeccionRepo.getColeccionesMeta(empresaId);
  }

  async getProductosDeColeccionMeta(productSetId: string, empresaId = 1) {
    return this.metaColeccionRepo.getProductosDeColeccionMeta(productSetId, empresaId);
  }

  async crearColeccionMeta(dto: CreateColeccionDto, empresaId = 1) {
    return this.metaColeccionRepo.crearColeccionMeta(dto, empresaId);
  }

  async eliminarColeccionMeta(productSetId: string, empresaId = 1) {
    return this.metaColeccionRepo.eliminarColeccionMeta(productSetId, empresaId);
  }

  async sincronizarColeccionesMeta(empresaId = 1) {
    return this.metaColeccionRepo.sincronizarColeccionesMeta(empresaId);
  }

  // --- WhatsApp Chat & Envío de Catálogos ---
  async verificarVentanaServicio24h(conversacionId: number, empresaId = 1) {
    return this.chatWhatsappRepo.verificarVentanaServicio24h(conversacionId, empresaId);
  }

  async getConversacionesChat(empresaId = 1) {
    return this.chatWhatsappRepo.getConversacionesChat(empresaId);
  }

  async obtenerOCrearConversacion(clienteId: number, empresaId = 1) {
    return this.chatWhatsappRepo.obtenerOCrearConversacion(clienteId, empresaId);
  }

  async getCatalogoDisponibleChat(empresaId = 1) {
    return this.chatWhatsappRepo.getCatalogoDisponibleChat(empresaId);
  }

  async getMensajesConversacionChat(conversacionId: number, empresaId = 1) {
    return this.chatWhatsappRepo.getMensajesConversacionChat(conversacionId, empresaId);
  }

  async cambiarModoConversacion(conversacionId: number, modo: 'ia' | 'humano', empresaId = 1) {
    return this.chatWhatsappRepo.cambiarModoConversacion(conversacionId, modo, empresaId);
  }

  async enviarMensajeTextoChat(conversacionId: number, texto: string, empresaId = 1) {
    return this.chatWhatsappRepo.enviarMensajeTextoChat(conversacionId, texto, empresaId);
  }

  async enviarProductoChat(conversacionId: number, dto: any, empresaId = 1) {
    return this.chatCatalogoRepo.enviarProductoChat(conversacionId, dto, empresaId);
  }

  async enviarCategoriasChat(conversacionId: number, dto: any, empresaId = 1) {
    return this.chatCatalogoRepo.enviarCategoriasChat(conversacionId, dto, empresaId);
  }

  async enviarCatalogoMultiCategoria(conversacionId: number, empresaId = 1) {
    return this.chatCatalogoRepo.enviarCatalogoMultiCategoria(conversacionId, empresaId);
  }

  async enviarColeccionWhatsApp(dto: EnviarColeccionWhatsAppDto, empresaId = 1) {
    return this.chatCatalogoRepo.enviarColeccionWhatsApp(dto, empresaId);
  }
}
