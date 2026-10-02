import { Controller, Get, Post, Put, Patch, Delete, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductoRepository } from '../repositories/producto.repository.js';
import { CreateProductoDto } from '../dto/create-producto.dto.js';
import { UpdateProductoDto } from '../dto/update-producto.dto.js';
import { CreateColeccionDto } from '../dto/create-coleccion.dto.js';
import { EnviarColeccionWhatsAppDto } from '../dto/enviar-coleccion-whatsapp.dto.js';
import { EnviarProductoChatDto } from '../dto/enviar-producto-chat.dto.js';
import { EnviarCategoriasChatDto } from '../dto/enviar-categorias-chat.dto.js';

/**
 * ============================================================================
 * CONTROLADOR DE PRODUCTOS (Directo a Repositorio, sin capa Service)
 * ============================================================================
 * Flujo directo idéntico a LoginController:
 * Controller ──► Repository (TypeORM) ──► PostgreSQL
 */
@Controller('productos')
export class ProductoController {
  constructor(private readonly productoRepo: ProductoRepository) { }

  @Get('catalogos')
  async getCatalogos(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getCatalogos(id);
  }

  @Get('siguiente-codigo')
  async getSiguienteCodigo(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getSiguienteCodigo(id);
  }

  @Post('seed-ferreteria')
  @HttpCode(HttpStatus.OK)
  async seedFerreteria(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.seedFerreteria(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearProducto(@Body() dto: CreateProductoDto, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearProducto(dto, id);
  }

  @Post(':id/sync-meta')
  @HttpCode(HttpStatus.OK)
  async syncMeta(@Param('id') id: string, @Query('empresa_id') empresaId?: string) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    const prodId = parseInt(id, 10);
    return await this.productoRepo.sincronizarConMetaCatalog(prodId, empId);
  }

  @Post('categorias')
  @HttpCode(HttpStatus.CREATED)
  async crearCategoria(@Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearCategoria(dto, id);
  }

  @Post('subcategorias')
  @HttpCode(HttpStatus.CREATED)
  async crearSubcategoria(@Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearSubcategoria(dto, id);
  }

  @Post('marcas')
  @HttpCode(HttpStatus.CREATED)
  async crearMarca(@Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearMarca(dto, id);
  }

  @Post('impuestos')
  @HttpCode(HttpStatus.CREATED)
  async crearImpuesto(@Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearImpuesto(dto, id);
  }

  @Post('listas-precios')
  @HttpCode(HttpStatus.CREATED)
  async crearListaPrecio(@Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearListaPrecio(dto, id);
  }

  @Post('proveedores')
  @HttpCode(HttpStatus.CREATED)
  async crearProveedor(@Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearProveedor(dto, id);
  }

  @Post('atributos')
  @HttpCode(HttpStatus.CREATED)
  async crearAtributo(@Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearAtributo(dto, id);
  }

  @Post('componentes')
  @HttpCode(HttpStatus.CREATED)
  async crearComponente(@Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearComponente(dto, id);
  }

  @Get()
  async getProductos(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getProductos(id);
  }

  @Get(':id')
  async getProductoPorId(@Param('id') id: string, @Query('empresa_id') empresaId?: string) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getProductoPorId(parseInt(id, 10), empId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async actualizarProducto(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.actualizarProducto(parseInt(id, 10), dto, empId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async patchProducto(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.actualizarProducto(parseInt(id, 10), dto, empId);
  }

  @Delete('todos')
  @HttpCode(HttpStatus.OK)
  async eliminarTodos(@Query('empresa_id') empresaId?: string) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.eliminarTodosLosProductos(empId);
  }

  @Post('eliminar-todos')
  @HttpCode(HttpStatus.OK)
  async postEliminarTodos(@Query('empresa_id') empresaId?: string) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.eliminarTodosLosProductos(empId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminarProducto(@Param('id') id: string, @Query('empresa_id') empresaId?: string) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.eliminarProducto(parseInt(id, 10), empId);
  }

  // ==========================================================================
  // MÓDULO DE CONFIGURACIONES (renombrar catálogos maestros)
  // ==========================================================================

  @Get('configuraciones/catalogos')
  async getConfiguraciones(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getCatalogosConfiguracion(id);
  }

  @Patch('configuraciones/categorias/:id')
  async actualizarCategoria(
    @Param('id') id: string,
    @Body() dto: any,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.actualizarCategoria(parseInt(id, 10), dto, empId);
  }

  @Patch('configuraciones/marcas/:id')
  async actualizarMarca(@Param('id') id: string, @Body() dto: any, @Query('empresa_id') empresaId?: string) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.actualizarMarca(parseInt(id, 10), dto, empId);
  }

  @Patch('configuraciones/listas-precios/:id')
  async actualizarListaPrecio(
    @Param('id') id: string,
    @Body() dto: any,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.actualizarListaPrecio(parseInt(id, 10), dto, empId);
  }

  @Patch('configuraciones/impuestos/:id')
  async actualizarImpuesto(
    @Param('id') id: string,
    @Body() dto: any,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.actualizarImpuesto(parseInt(id, 10), dto, empId);
  }

  // ==========================================================================
  // CATÁLOGOS GEOGRÁFICOS (Departamento / Ciudad)
  // ==========================================================================

  @Get('departamentos')
  async getDepartamentos() {
    return await this.productoRepo.getDepartamentos();
  }

  @Post('departamentos')
  @HttpCode(HttpStatus.CREATED)
  async crearDepartamento(@Body() dto: any) {
    return await this.productoRepo.crearDepartamento(dto);
  }

  @Get('ciudades')
  async getCiudades(@Query('departamento_id') departamentoId?: string) {
    const depId = departamentoId ? parseInt(departamentoId, 10) : undefined;
    return await this.productoRepo.getCiudades(depId);
  }

  @Post('ciudades')
  @HttpCode(HttpStatus.CREATED)
  async crearCiudad(@Body() dto: any) {
    return await this.productoRepo.crearCiudad(dto);
  }

  // ==========================================================================
  // COLECCIONES DE PRODUCTOS EN WHATSAPP (Meta Commerce / Graph API)
  // ==========================================================================

  @Get('colecciones')
  async getColecciones(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getColeccionesMeta(id);
  }

  @Get('colecciones/:id/productos')
  async getProductosDeColeccion(
    @Param('id') id: string,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getProductosDeColeccionMeta(id, empId);
  }

  @Post('colecciones')
  @HttpCode(HttpStatus.CREATED)
  async crearColeccion(
    @Body() dto: CreateColeccionDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const id = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.crearColeccionMeta(dto, id);
  }

  @Delete('colecciones/:id')
  @HttpCode(HttpStatus.OK)
  async eliminarColeccion(
    @Param('id') id: string,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.eliminarColeccionMeta(id, empId);
  }

  @Post('colecciones/sincronizar')
  @HttpCode(HttpStatus.OK)
  async sincronizarColecciones(@Query('empresa_id') empresaId?: string) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.sincronizarColeccionesMeta(empId);
  }

  @Post('colecciones/enviar-whatsapp')
  @HttpCode(HttpStatus.OK)
  async enviarColeccionWhatsApp(
    @Body() dto: EnviarColeccionWhatsAppDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.enviarColeccionWhatsApp(dto, empId);
  }

  // ==========================================================================
  // CHAT Y CONVERSACIONES WHATSAPP (PostgreSQL Single Source of Truth)
  // ==========================================================================

  @Get('chat/conversaciones')
  async getConversaciones(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getConversacionesChat(id);
  }

  @Get('chat/conversaciones/:id/mensajes')
  async getMensajesConversacion(
    @Param('id') id: string,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getMensajesConversacionChat(parseInt(id, 10), empId);
  }

  @Patch('chat/conversaciones/:id/modo')
  @HttpCode(HttpStatus.OK)
  async cambiarModoConversacion(
    @Param('id') id: string,
    @Body('modo') modo: 'ia' | 'humano',
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.cambiarModoConversacion(parseInt(id, 10), modo, empId);
  }

  @Post('chat/conversaciones/:id/enviar-texto')
  @HttpCode(HttpStatus.OK)
  async enviarMensajeTextoChat(
    @Param('id') id: string,
    @Body('texto') texto: string,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.enviarMensajeTextoChat(parseInt(id, 10), texto, empId);
  }

  @Get('chat/catalogo-disponible')
  async getCatalogoDisponibleChat(@Query('empresa_id') empresaId?: string) {
    const id = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.getCatalogoDisponibleChat(id);
  }

  @Post('chat/conversaciones/:id/enviar-producto')
  @HttpCode(HttpStatus.OK)
  async enviarProductoChat(
    @Param('id') id: string,
    @Body() dto: EnviarProductoChatDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.enviarProductoChat(parseInt(id, 10), dto, empId);
  }

  @Post('chat/conversaciones/:id/enviar-categorias')
  @HttpCode(HttpStatus.OK)
  async enviarCategoriasChat(
    @Param('id') id: string,
    @Body() dto: EnviarCategoriasChatDto,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = dto.empresa_id || (empresaId ? parseInt(empresaId, 10) : 1);
    return await this.productoRepo.enviarCategoriasChat(parseInt(id, 10), dto, empId);
  }

  @Post('chat/conversaciones/:id/enviar-catalogo-multicategoria')
  @HttpCode(HttpStatus.OK)
  async enviarCatalogoMultiCategoria(
    @Param('id') id: string,
    @Query('empresa_id') empresaId?: string,
  ) {
    const empId = empresaId ? parseInt(empresaId, 10) : 1;
    return await this.productoRepo.enviarCatalogoMultiCategoria(parseInt(id, 10), empId);
  }
}

