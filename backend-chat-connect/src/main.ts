import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
import { LoginModule } from './login/login.module.js';

/**
 * Función principal de arranque (Bootstrap) del servidor backend ChatConnect CRM.
 *
 * Configura:
 * 1. Motor HTTP de alto rendimiento: Fastify (en lugar de Express)
 * 2. Cabeceras de seguridad HTTP: Helmet (@fastify/helmet)
 * 3. Protección contra falsificación de peticiones en sitios cruzados: CSRF (@fastify/csrf-protection)
 * 4. Manejo y firma de cookies seguras: (@fastify/cookie)
 * 5. Control de Acceso CORS granular para clientes autorizados
 * 6. Enlace de red en 0.0.0.0 para compatibilidad en entornos locales y contenedores/VPS
 */
async function bootstrap() {
  // Inicialización de la aplicación NestJS utilizando el adaptador Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    LoginModule,
    new FastifyAdapter(),
  );

  /**
   * Configuración de Helmet para Fastify
   * Aplica cabeceras estándar de protección (X-Content-Type-Options, Strict-Transport-Security, etc.)
   * Configura crossOriginResourcePolicy en 'cross-origin' para permitir consumo de recursos estáticos.
   */
  await app.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  const cookieSecret = process.env.COOKIE_SECRET || process.env.JWT_SECRET || 'ChatConnect_Cookie_Secret_Key_32_Chars_Min';

  /**
   * Manejo de cookies firmadas
   */
  await app.register(fastifyCookie, {
    secret: cookieSecret,
  });

  /**
   * Protección CSRF basada en Cookies firmadas
   * Genera y valida tokens mediante la cabecera 'x-csrf-token'
   */
  await app.register(fastifyCsrf, {
    cookieKey: '_csrf',
    cookieOpts: {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      signed: true,
    },
  });

  /**
   * Configuración de CORS (Cross-Origin Resource Sharing)
   * Permite cookies y la cabecera 'x-csrf-token' desde el frontend en localhost:5173
   */
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'csrf-token'],
  });

  // Resolución de puerto y escucha en todas las interfaces de red
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  // Banner informativo en consola
  console.log('\n\x1b[32m\x1b[1m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\x1b[0m');
  console.log('\x1b[32m\x1b[1m┃                                                     ┃\x1b[0m');
  console.log('\x1b[32m\x1b[1m┃   ✨  ChatConnect CRM iniciado exitosamente         ┃\x1b[0m');
  console.log('\x1b[32m\x1b[1m┃                                                     ┃\x1b[0m');
  console.log(`\x1b[32m\x1b[1m┃   \x1b[36m\x1b[1m➜  📱 Frontend: \x1b[0m\x1b[1mhttp://localhost:5173\x1b[32m\x1b[1m              ┃\x1b[0m`);
  console.log(`\x1b[32m\x1b[1m┃   \x1b[35m\x1b[1m➜  ⚙️  Backend:  \x1b[0m\x1b[1mhttp://localhost:${port}\x1b[32m\x1b[1m              ┃\x1b[0m`);
  console.log('\x1b[32m\x1b[1m┃                                                     ┃\x1b[0m');
  console.log('\x1b[32m\x1b[1m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\x1b[0m\n');
}

await bootstrap();