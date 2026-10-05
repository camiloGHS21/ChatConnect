import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurgarDatosDto } from '../dto/purgar-datos.dto.js';

/**
 * =============================================================================
 * REPOSITORIO DE LIMPIEZA Y PURGA DE DATOS DE EMPRESA
 * =============================================================================
 * Control directo contra PostgreSQL chatbotDatabase sin capa de servicio (RULE 1).
 * Gestiona de forma transaccional y atómica el vaciado de datos multiempresa.
 */
@Injectable()
export class EmpresaLimpiezaRepository {
  private readonly logger = new Logger(EmpresaLimpiezaRepository.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Obtiene el conteo en tiempo real de registros por módulo para la empresa.
   */
  async getResumenDatos(empresaId: number) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    try {
      const [
        mensajesRes,
        conversacionesRes,
        iaRes,
        clientesRes,
        pedidosRes,
        carritosRes,
        productosRes,
        categoriasRes,
        marcasRes,
      ] = await Promise.all([
        qr.query(`SELECT count(*)::int AS count FROM public.mensaje WHERE empresa_id = $1;`, [empresaId]),
        qr.query(`SELECT count(*)::int AS count FROM public.conversacion WHERE empresa_id = $1;`, [empresaId]),
        qr.query(`SELECT count(*)::int AS count FROM public.procesamiento_ia WHERE empresa_id = $1;`, [empresaId]),
        qr.query(`SELECT count(*)::int AS count FROM public.tercero WHERE empresa_id = $1 AND tipo_tercero IN ('cliente','ambos');`, [empresaId]),
        qr.query(`SELECT count(*)::int AS count FROM public.pedido WHERE empresa_id = $1;`, [empresaId]),
        qr.query(`SELECT count(*)::int AS count FROM public.carrito WHERE empresa_id = $1;`, [empresaId]),
        qr.query(`SELECT count(*)::int AS count FROM public.producto WHERE empresa_id = $1;`, [empresaId]),
        qr.query(`SELECT count(*)::int AS count FROM public.categoria WHERE empresa_id = $1;`, [empresaId]),
        qr.query(`SELECT count(*)::int AS count FROM public.marca WHERE empresa_id = $1;`, [empresaId]),
      ]);

      return {
        empresa_id: empresaId,
        mensajes: mensajesRes[0]?.count || 0,
        conversaciones: conversacionesRes[0]?.count || 0,
        procesamientos_ia: iaRes[0]?.count || 0,
        clientes: clientesRes[0]?.count || 0,
        pedidos: pedidosRes[0]?.count || 0,
        carritos: carritosRes[0]?.count || 0,
        productos: productosRes[0]?.count || 0,
        categorias: categoriasRes[0]?.count || 0,
        marcas: marcasRes[0]?.count || 0,
      };
    } finally {
      await qr.release();
    }
  }

  /**
   * Ejecuta la purga selectiva o total de los datos de la empresa en una transacción atómica.
   */
  async purgarDatos(dto: PurgarDatosDto, empresaId: number) {
    if (!dto.confirmacion || dto.confirmacion.trim().toUpperCase() !== 'ELIMINAR') {
      throw new BadRequestException('Debe escribir exactamente "ELIMINAR" para confirmar la operación.');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    const reporte: Record<string, number> = {};

    try {
      const borrarTodo = Boolean(dto.eliminarTodo);
      const borrarMensajes = borrarTodo || Boolean(dto.eliminarMensajesIa);
      const borrarPedidos = borrarTodo || Boolean(dto.eliminarPedidos) || Boolean(dto.eliminarProductos);
      const borrarProductos = borrarTodo || Boolean(dto.eliminarProductos);
      const borrarClientes = borrarTodo || Boolean(dto.eliminarClientes);
      const borrarCatalogos = borrarTodo || Boolean(dto.eliminarCatalogos);

      // 1. PEDIDOS Y CARRITOS (Líneas de detalle con impuestos desglosados y pedidos)
      if (borrarPedidos) {
        const pdi = await qr.query(`
          DELETE FROM public.pedido_detalle_impuesto
          WHERE pedido_detalle_id IN (
            SELECT pd.id_pedido_detalle
              FROM public.pedido_detalle pd
              JOIN public.pedido p ON p.id_pedido = pd.pedido_id
             WHERE p.empresa_id = $1
          );`, [empresaId]);
        reporte.pedido_detalle_impuestos = pdi[1] || 0;

        const pd = await qr.query(`
          DELETE FROM public.pedido_detalle
          WHERE pedido_id IN (SELECT id_pedido FROM public.pedido WHERE empresa_id = $1);
        `, [empresaId]);
        reporte.pedido_detalles = pd[1] || 0;

        await qr.query(`DELETE FROM public.pedido_estado WHERE pedido_id IN (SELECT id_pedido FROM public.pedido WHERE empresa_id = $1);`, [empresaId]);
        const ped = await qr.query(`DELETE FROM public.pedido WHERE empresa_id = $1;`, [empresaId]);
        reporte.pedidos = ped[1] || 0;

        await qr.query(`DELETE FROM public.carrito_detalle WHERE carrito_id IN (SELECT id_carrito FROM public.carrito WHERE empresa_id = $1);`, [empresaId]);
        const car = await qr.query(`DELETE FROM public.carrito WHERE empresa_id = $1;`, [empresaId]);
        reporte.carritos = car[1] || 0;
      }

      // 2. MENSAJES Y CONVERSACIONES IA
      if (borrarMensajes) {
        const ia = await qr.query(`DELETE FROM public.procesamiento_ia WHERE empresa_id = $1;`, [empresaId]);
        reporte.procesamientos_ia = ia[1] || 0;

        const msgs = await qr.query(`DELETE FROM public.mensaje WHERE empresa_id = $1;`, [empresaId]);
        reporte.mensajes = msgs[1] || 0;

        const convs = await qr.query(`DELETE FROM public.conversacion WHERE empresa_id = $1;`, [empresaId]);
        reporte.conversaciones = convs[1] || 0;
      }

      // 3. PRODUCTOS E INVENTARIO
      if (borrarProductos) {
        await qr.query(`DELETE FROM public.inventario WHERE empresa_id = $1;`, [empresaId]);
        await qr.query(`DELETE FROM public.precio WHERE empresa_id = $1;`, [empresaId]);

        const prodIdsQuery = `SELECT id_producto FROM public.producto WHERE empresa_id = $1`;
        await qr.query(`DELETE FROM public.producto_impuesto_compra WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`DELETE FROM public.producto_impuesto_venta WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`DELETE FROM public.producto_lista_precio WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`DELETE FROM public.producto_retencion WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`DELETE FROM public.producto_referencia WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`DELETE FROM public.producto_codigo_barras WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`
          DELETE FROM public.variante_componente
          WHERE producto_variante_id IN (SELECT id_producto_variante FROM public.producto_variante WHERE producto_id IN (${prodIdsQuery}));
        `, [empresaId]);
        await qr.query(`DELETE FROM public.producto_variante WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`
          DELETE FROM public.producto_atributo_componente
          WHERE producto_atributo_id IN (SELECT id_producto_atributo FROM public.producto_atributo WHERE producto_id IN (${prodIdsQuery}));
        `, [empresaId]);
        await qr.query(`DELETE FROM public.producto_atributo WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`DELETE FROM public.producto_proveedor WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`DELETE FROM public.producto_imagen WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);
        await qr.query(`DELETE FROM public.producto_seo_ia WHERE producto_id IN (${prodIdsQuery});`, [empresaId]);

        const prodRes = await qr.query(`DELETE FROM public.producto WHERE empresa_id = $1;`, [empresaId]);
        reporte.productos = prodRes[1] || 0;

        // Restablecer consecutivo de secuencia para productos
        await qr.query(`
          UPDATE public.secuencia 
             SET consecutivo_actual = 0 
           WHERE empresa_id = $1 AND UPPER(modulo) IN ('PRODUCTO', 'PRODUCTOS');
        `, [empresaId]);
      }

      // 4. CLIENTES / CONTACTOS
      if (borrarClientes) {
        let sqlClientes = `DELETE FROM public.tercero WHERE empresa_id = $1`;
        if (!borrarTodo) {
          sqlClientes += ` AND tipo_tercero IN ('cliente', 'ambos')`;
        }
        const terRes = await qr.query(sqlClientes + `;`, [empresaId]);
        reporte.clientes = terRes[1] || 0;
      }

      // 5. CATÁLOGOS COMERCIALES
      if (borrarCatalogos) {
        await qr.query(`DELETE FROM public.atributo_componente WHERE atributo_id IN (SELECT id_atributo FROM public.atributo WHERE empresa_id = $1);`, [empresaId]);
        await qr.query(`DELETE FROM public.atributo WHERE empresa_id = $1;`, [empresaId]);
        await qr.query(`DELETE FROM public.subcategoria WHERE empresa_id = $1;`, [empresaId]);
        const catRes = await qr.query(`DELETE FROM public.categoria WHERE empresa_id = $1;`, [empresaId]);
        const marRes = await qr.query(`DELETE FROM public.marca WHERE empresa_id = $1;`, [empresaId]);
        await qr.query(`DELETE FROM public.lista_precio WHERE empresa_id = $1 AND es_predeterminada = false;`, [empresaId]);
        reporte.categorias = catRes[1] || 0;
        reporte.marcas = marRes[1] || 0;
      }

      // 6. AUDITORÍA DE LA EMPRESA (si es borrado total)
      if (borrarTodo) {
        await qr.query(`DELETE FROM public.auditoria WHERE empresa_id = $1;`, [empresaId]);
      }

      await qr.commitTransaction();
      this.logger.log(`✓ Purga completada exitosamente para empresa ${empresaId}: ${JSON.stringify(reporte)}`);

      return {
        success: true,
        message: 'Purga de datos ejecutada correctamente en PostgreSQL',
        empresa_id: empresaId,
        reporte,
      };
    } catch (err: any) {
      await qr.rollbackTransaction();
      this.logger.error(`Error purgando datos de empresa ${empresaId}: ${err?.message || err}`, err?.stack);
      throw err;
    } finally {
      await qr.release();
    }
  }
}
