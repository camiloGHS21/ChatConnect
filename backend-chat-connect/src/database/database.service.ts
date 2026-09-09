import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Servicio unificado de acceso a base de datos mediante TypeORM.
 *
 * Expone:
 * - `dataSource`: La instancia global de conexión de TypeORM.
 * - `query()`: Método para ejecutar consultas SQL directas si fuera necesario.
 */
@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Ejecuta una consulta SQL nativa utilizando el pool de conexiones administrado por TypeORM.
   *
   * @param queryText Consulta SQL con parámetros ($1, $2, etc.)
   * @param params Valores que sustituyen los parámetros
   * @returns Registros devueltos por PostgreSQL
   */
  async query<T = any>(queryText: string, params?: any[]): Promise<T> {
    return this.dataSource.query(queryText, params);
  }

  /**
   * Obtiene la instancia activa de DataSource de TypeORM.
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }
}
