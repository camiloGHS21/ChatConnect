import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductoRepository } from '../repositories/producto.repository.js';
import { CreateProductoDto } from '../dto/create-producto.dto.js';

/**
 * ============================================================================
 * CONTROLADOR DE PRODUCTOS (Directo a Repositorio, sin capa Service)
 * ============================================================================
 * Flujo directo idéntico a LoginController:
 * Controller ──► Repository (TypeORM) ──► PostgreSQL
 */
@Controller('productos')
export class ProductoController {
  constructor(private readonly productoRepo: ProductoRepository) {}

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
}
