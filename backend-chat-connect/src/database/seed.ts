import { NestFactory } from '@nestjs/core';
import { DatabaseModule } from './database.module.js';
import { SeedService } from './seed.service.js';

/**
 * Script ejecutable independiente para semillar la base de datos (CLI).
 * Uso:
 *   npm run seed
 *   bun run src/database/seed.ts
 */
async function bootstrap() {
  console.log('\n\x1b[34m\x1b[1m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\x1b[0m');
  console.log('\x1b[34m\x1b[1m┃       🌱  ChatConnect - Database Seeder             ┃\x1b[0m');
  console.log('\x1b[34m\x1b[1m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\x1b[0m\n');

  const app = await NestFactory.createApplicationContext(DatabaseModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const seedService = app.get(SeedService);
    const result = await seedService.seed();
    if (result.created) {
      console.log('\n\x1b[32m✔ Proceso completado: Usuario por defecto insertado con éxito.\x1b[0m\n');
    } else {
      console.log('\n\x1b[33mℹ Proceso completado: El usuario ya existía, no se hicieron cambios.\x1b[0m\n');
    }
  } catch (error) {
    console.error('\n\x1b[31m✖ Error ejecutando el seeder:\x1b[0m', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
