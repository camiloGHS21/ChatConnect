import { Controller, Get, Post, Put, Patch, Delete, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductoRepository } from '../repositories/producto.repository.js';
import { CreateProductoDto } from '../dto/create-producto.dto.js';
import { UpdateProductoDto } from '../dto/update-producto.dto.js';

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
    return await this.dataSourceDepartamentos();
  }

  private async dataSourceDepartamentos() {
    return await this.productoRepo.getCatalogosConfiguracion().then(c => c.departamentos);
  }

  @Post('departamentos')
  @HttpCode(HttpStatus.CREATED)
  async crearDepartamento(@Body() dto: any) {
    return await this.productoRepo.crearDepartamento(dto);
  }

  @Get('ciudades')
  async getCiudades(@Query('departamento_id') departamentoId?: string) {
    const cat = await this.productoRepo.getCatalogosConfiguracion();
    if (!departamentoId) return cat.ciudades;
    return cat.ciudades.filter(c => String(c.id_departamento) === String(departamentoId));
  }

  @Post('ciudades')
  @HttpCode(HttpStatus.CREATED)
  async crearCiudad(@Body() dto: any) {
    return await this.productoRepo.crearCiudad(dto);
  }
}

