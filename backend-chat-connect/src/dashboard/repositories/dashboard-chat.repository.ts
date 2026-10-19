import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * ============================================================================
 * REPOSITORIO DE CHAT (Dashboard) — Conversaciones, Mensajes y Canales
 * ============================================================================
 * Métricas agregadas de la operación WhatsApp (RULE 1: Controller ──► Repo).
 */
@Injectable()
export class DashboardChatRepository {
  constructor(private readonly dataSource: DataSource) {}

  /** Conversaciones totales registradas por la empresa. */
  async contarConversaciones(empresaId: number): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.conversacion WHERE empresa_id = $1;`,
      [empresaId],
    );
    return Number(rows[0]?.total || 0);
  }

  /** Mensajes totales intercambiados por la empresa. */
  async contarMensajes(empresaId: number): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.mensaje WHERE empresa_id = $1;`,
      [empresaId],
    );
    return Number(rows[0]?.total || 0);
  }

  /** Distribución de conversaciones atendidas por IA vs asesor humano. */
  async distribucionModo(empresaId: number) {
    const rows = await this.dataSource.query(
      `SELECT
         COUNT(*) FILTER (WHERE modo = 'ia')::int AS ia,
         COUNT(*) FILTER (WHERE modo = 'humano')::int AS humano
       FROM public.conversacion
       WHERE empresa_id = $1;`,
      [empresaId],
    );
    const r = rows[0] || {};
    return { ia: Number(r.ia || 0), humano: Number(r.humano || 0) };
  }

  /** Volumen de conversaciones agrupado por canal de atención (Meta/WhatsApp). */
  async canalesAtencion(empresaId: number, limite = 5) {
    const rows = await this.dataSource.query(
      `SELECT COALESCE(NULLIF(TRIM(ca.phone_number), ''), ca.tipo || ' · ' || ca.proveedor) AS name,
              COUNT(*)::int AS amount
         FROM public.conversacion cv
         JOIN public.canal ca ON ca.id_canal = cv.canal_id
        WHERE cv.empresa_id = $1
        GROUP BY 1
        ORDER BY amount DESC
        LIMIT $2;`,
      [empresaId, limite],
    );
    return rows.map((r: any) => ({ name: r.name, amount: Number(r.amount || 0) }));
  }

  /** Conteo de mensajes por mes (últimos 12 meses) para la serie temporal. */
  async serieMensajesMensual(empresaId: number) {
    const rows = await this.dataSource.query(
      `SELECT to_char(created_at, 'YYYY-MM') AS ym, COUNT(*)::int AS total
         FROM public.mensaje
        WHERE empresa_id = $1
          AND created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY 1;`,
      [empresaId],
    );
    return rows.map((r: any) => ({ ym: r.ym, total: Number(r.total || 0) }));
  }
}
