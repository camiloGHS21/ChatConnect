import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Servicio centralizado para la gestión del pool de conexiones a PostgreSQL.
 *
 * Características clave:
 * - Implementa el patrón Singleton mediante la inyección de dependencias de NestJS.
 * - Pool de conexiones configurable (tamaño máximo, timeouts).
 * - Ejecución de consultas parametrizadas para prevenir inyecciones SQL (SQL Injection).
 * - Ciclo de vida gestionado (OnModuleInit verifica la conexión al iniciar, OnModuleDestroy libera el pool al apagar).
 * - Aislamiento estricto de credenciales: Lee únicamente desde variables de entorno (.env).
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: pg.Pool;

  /**
   * Inicializa el pool de conexiones leyendo las variables del entorno.
   * Lanza un error explícito si falta alguna variable crítica.
   */
  constructor() {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
    const database = process.env.DB_NAME;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;

    if (!host || !database || !user || !password) {
      throw new Error(
        'Faltan variables de entorno para la base de datos (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD). Configure su archivo .env.',
      );
    }

    this.pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      max: 10, // Máximo 10 clientes simultáneos en el pool
      idleTimeoutMillis: 30000, // Tiempo de inactividad antes de liberar cliente (30s)
      connectionTimeoutMillis: 10000, // Timeout de conexión al servidor (10s)
    });
  }

  /**
   * Hook del ciclo de vida de NestJS ejecutado al inicializar el módulo.
   * Realiza una prueba de conexión rápida para validar la disponibilidad del servidor PostgreSQL.
   */
  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      this.logger.log('Conexión exitosa a la base de datos PostgreSQL');
      client.release();
    } catch (error) {
      this.logger.error('Error al inicializar la conexión con la base de datos PostgreSQL');
    }
  }

  /**
   * Ejecuta una consulta SQL parametrizada de manera segura.
   *
   * @template T Tipo de los registros devueltos por la consulta.
   * @param queryText Consulta SQL con parámetros posicionales ($1, $2, ...).
   * @param params Valores que sustituyen los marcadores de posición para evitar inyección SQL.
   * @returns Resultado de la consulta con las filas tipadas.
   */
  async query<T extends pg.QueryResultRow = any>(
    queryText: string,
    params?: any[],
  ): Promise<pg.QueryResult<T>> {
    return this.pool.query<T>(queryText, params);
  }

  /**
   * Hook del ciclo de vida ejecutado al destruir el módulo.
   * Cierra de forma ordenada todas las conexiones activas del pool para evitar fugas de recursos.
   */
  async onModuleDestroy() {
    this.logger.log('Cerrando pool de conexiones de PostgreSQL...');
    await this.pool.end();
  }
}

