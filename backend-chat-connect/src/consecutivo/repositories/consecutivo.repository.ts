import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdateConsecutivoDto } from '../dto/update-consecutivo.dto.js';
import { ConsecutivoModel } from '../models/consecutivo.model.js';

const MODULOS = [
  { modulo: 'producto', nombre: 'Productos', prefijo: 'PRD-' },
  { modulo: 'pedido', nombre: 'Pedidos', prefijo: 'PED-' },
  { modulo: 'remision', nombre: 'Remisiones', prefijo: 'REM-' },
  { modulo: 'cotizacion', nombre: 'Cotizaciones', prefijo: 'COT-' },
] as const;

const normalizarModulo = (modulo: string) => {
  const valor = (modulo || '').trim().toLowerCase();
  if (valor === 'productos') return 'producto';
  if (valor === 'pedidos') return 'pedido';
  if (valor === 'remisiones') return 'remision';
  if (valor === 'cotizaciones') return 'cotizacion';
  return valor;
};

@Injectable()
export class ConsecutivoRepository implements OnApplicationBootstrap {
  private readonly logger = new Logger(ConsecutivoRepository.name);

  constructor(
    @InjectRepository(ConsecutivoModel)
    private readonly consecutivoRepo: Repository<ConsecutivoModel>,
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.instalarGeneradorPedido();
      const empresas = await this.dataSource.query('SELECT id_empresa FROM public.empresa');
      for (const empresa of empresas) {
        const empresaId = Number(empresa.id_empresa);
        const consecutivos = await this.asegurarConsecutivos(empresaId);
        await this.normalizarPedidosIniciales(empresaId, consecutivos);
      }
    } catch (error: any) {
      this.logger.error(`No se pudo inicializar la numeración documental: ${error.message}`);
    }
  }

  async listar(empresaId: number) {
    this.validarId(empresaId, 'empresa');
    const consecutivos = await this.asegurarConsecutivos(empresaId);
    return MODULOS.map(config => {
      const item = consecutivos.find(s => normalizarModulo(s.modulo) === config.modulo);
      return this.mapear(item!, config.modulo, config.nombre);
    });
  }

  async actualizar(id: number, empresaId: number, dto: UpdateConsecutivoDto) {
    this.validarId(id, 'consecutivo');
    this.validarId(empresaId, 'empresa');
    const consecutivo = await this.consecutivoRepo.findOne({ where: { id, empresaId } });
    if (!consecutivo) throw new NotFoundException('Configuración de consecutivo no encontrada');

    if (dto.prefijo !== undefined) {
      const prefijo = dto.prefijo === null ? '' : String(dto.prefijo).trim().toUpperCase();
      if (prefijo.length > 50) throw new BadRequestException('El prefijo no puede superar 50 caracteres');
      consecutivo.prefijo = prefijo || null;
    }
    if (dto.consecutivo_actual !== undefined) {
      const actual = Number(dto.consecutivo_actual);
      if (!Number.isSafeInteger(actual) || actual < 0) {
        throw new BadRequestException('El consecutivo actual debe ser un número entero mayor o igual a cero');
      }
      consecutivo.consecutivoActual = actual;
    }
    if (dto.longitud !== undefined) {
      const longitud = Number(dto.longitud);
      if (!Number.isInteger(longitud) || longitud < 1 || longitud > 20) {
        throw new BadRequestException('La longitud debe ser un número entero entre 1 y 20');
      }
      consecutivo.longitud = longitud;
    }

    consecutivo.estado = 'activo';
    const saved = await this.consecutivoRepo.save(consecutivo);
    const modulo = normalizarModulo(saved.modulo);
    const config = MODULOS.find(item => item.modulo === modulo);
    return this.mapear(saved, modulo, config?.nombre || saved.modulo);
  }

  private async asegurarConsecutivos(empresaId: number) {
    const existentes = await this.consecutivoRepo.find({
      where: { empresaId },
      order: { id: 'ASC' },
    });

    for (const config of MODULOS) {
      const existentesModulo = existentes.filter(item => normalizarModulo(item.modulo) === config.modulo);
      let item = existentesModulo.find(item => item.estado === 'activo') || existentesModulo[0];
      if (!item) {
        item = await this.consecutivoRepo.save({
          empresaId,
          modulo: config.modulo,
          prefijo: config.prefijo,
          consecutivoActual: 0,
          longitud: 6,
          estado: 'activo',
        });
        existentes.push(item);
      }
    }
    return existentes;
  }

  private async normalizarPedidosIniciales(
    empresaId: number,
    consecutivos: ConsecutivoModel[],
  ) {
    const pedido = consecutivos.find(item => normalizarModulo(item.modulo) === 'pedido');
    if (!pedido || Number(pedido.consecutivoActual) !== 0) return;

    await this.dataSource.transaction(async manager => {
      const [secuencia] = await manager.query(
        `SELECT consecutivo_actual
         FROM public.secuencia
         WHERE id_secuencia = $1 AND empresa_id = $2
         FOR UPDATE`,
        [pedido.id, empresaId],
      );
      if (!secuencia || Number(secuencia.consecutivo_actual) !== 0) return;

      const pedidos = await manager.query(
        `SELECT id_pedido
         FROM public.pedido
         WHERE empresa_id = $1
         ORDER BY created_at ASC, id_pedido ASC`,
        [empresaId],
      );
      if (pedidos.length > 0) {
        await manager.query(
          `UPDATE public.pedido
           SET numero_pedido = CONCAT('__MIG-', $1::text, '-', id_pedido::text)
           WHERE empresa_id = $1`,
          [empresaId],
        );
      }
      for (const item of pedidos) {
        const [generado] = await manager.query(
          `SELECT public.generar_consecutivo_documento($1, 'PEDIDO') AS numero`,
          [empresaId],
        );
        await manager.query(
          `UPDATE public.pedido SET numero_pedido = $1 WHERE id_pedido = $2 AND empresa_id = $3`,
          [generado.numero, item.id_pedido, empresaId],
        );
      }
    });
  }

  private mapear(item: ConsecutivoModel, modulo: string, nombre: string) {
    const consecutivoActual = Number(item.consecutivoActual) || 0;
    const longitud = Number(item.longitud) || 6;
    const prefijo = item.prefijo || '';
    return {
      id: Number(item.id),
      modulo,
      nombre,
      prefijo,
      consecutivo_actual: consecutivoActual,
      longitud,
      estado: item.estado,
      siguiente: `${prefijo}${String(consecutivoActual + 1).padStart(longitud, '0')}`,
    };
  }

  private validarId(id: number, nombre: string) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException(`El identificador de ${nombre} no es válido`);
    }
  }

  private async instalarGeneradorPedido() {
    await this.dataSource.query(`
      ALTER TABLE public.pedido
      DROP CONSTRAINT IF EXISTS pedido_numero_pedido_unique;

      DO $ddl$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'pedido_empresa_numero_pedido_unique'
            AND conrelid = 'public.pedido'::regclass
        ) THEN
          ALTER TABLE public.pedido
          ADD CONSTRAINT pedido_empresa_numero_pedido_unique
          UNIQUE (empresa_id, numero_pedido);
        END IF;
      END;
      $ddl$;

      CREATE OR REPLACE FUNCTION public.generar_consecutivo_documento(
        p_empresa_id BIGINT,
        p_modulo VARCHAR
      ) RETURNS VARCHAR
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        v_prefijo VARCHAR(50);
        v_longitud INTEGER;
        v_consecutivo BIGINT;
        v_modulo VARCHAR(100) := UPPER(BTRIM(p_modulo));
      BEGIN
        INSERT INTO public.secuencia (
          empresa_id, modulo, prefijo, consecutivo_actual, longitud, estado
        )
        SELECT
          p_empresa_id,
          LOWER(v_modulo),
          CASE v_modulo
            WHEN 'PRODUCTO' THEN 'PRD-'
            WHEN 'PEDIDO' THEN 'PED-'
            WHEN 'REMISION' THEN 'REM-'
            WHEN 'COTIZACION' THEN 'COT-'
            ELSE ''
          END,
          0,
          6,
          'activo'
        WHERE NOT EXISTS (
          SELECT 1
          FROM public.secuencia s
          WHERE s.empresa_id = p_empresa_id
            AND CASE UPPER(s.modulo)
              WHEN 'PRODUCTOS' THEN 'PRODUCTO'
              WHEN 'PEDIDOS' THEN 'PEDIDO'
              WHEN 'REMISIONES' THEN 'REMISION'
              WHEN 'COTIZACIONES' THEN 'COTIZACION'
              ELSE UPPER(s.modulo)
            END = v_modulo
            AND s.estado = 'activo'
        )
        ON CONFLICT (empresa_id, modulo) DO UPDATE SET estado = 'activo';

        UPDATE public.secuencia
           SET consecutivo_actual = consecutivo_actual + 1
         WHERE id_secuencia = (
           SELECT s.id_secuencia
           FROM public.secuencia s
           WHERE s.empresa_id = p_empresa_id
             AND CASE UPPER(s.modulo)
               WHEN 'PRODUCTOS' THEN 'PRODUCTO'
               WHEN 'PEDIDOS' THEN 'PEDIDO'
               WHEN 'REMISIONES' THEN 'REMISION'
               WHEN 'COTIZACIONES' THEN 'COTIZACION'
               ELSE UPPER(s.modulo)
             END = v_modulo
             AND s.estado = 'activo'
           ORDER BY s.id_secuencia
           LIMIT 1
           FOR UPDATE
         )
         RETURNING prefijo, longitud, consecutivo_actual
              INTO v_prefijo, v_longitud, v_consecutivo;

        IF v_consecutivo IS NULL THEN
          RAISE EXCEPTION 'No existe consecutivo activo para % en la empresa %', p_modulo, p_empresa_id;
        END IF;

        RETURN COALESCE(v_prefijo, '') || LPAD(v_consecutivo::TEXT, v_longitud, '0');
      END;
      $func$;

      CREATE OR REPLACE FUNCTION public.asignar_numero_pedido()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $trigger$
      BEGIN
        NEW.numero_pedido := public.generar_consecutivo_documento(NEW.empresa_id, 'PEDIDO');
        RETURN NEW;
      END;
      $trigger$;

      DROP TRIGGER IF EXISTS trg_asignar_numero_pedido ON public.pedido;
      CREATE TRIGGER trg_asignar_numero_pedido
      BEFORE INSERT ON public.pedido
      FOR EACH ROW
      EXECUTE FUNCTION public.asignar_numero_pedido();
    `);
  }
}
