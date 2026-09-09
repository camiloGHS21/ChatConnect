import { Controller, Post, Get, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LoginService } from '../services/login.service.js';
import { CreateLoginDto } from '../dto/create-login.dto.js';
import { LoginResponseModel } from '../models/login.model.js';


/**
 * Controlador de Autenticación (`/login`).
 *
 * Expone las rutas de:
 * 1. `POST /login` - Autenticación de credenciales, emisión de token JWT y datos de sesión.
 * 2. `GET /login` - Estado de salud (Health check) del servicio de autenticación.
 * 3. `GET /login/csrf-token` - Emisión y firma de tokens de protección CSRF para el cliente web.
 */
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  /**
   * Endpoint de Inicio de Sesión.
   *
   * Seguridad:
   * - Limitación de tasa estricta (@Throttle): Máximo 5 peticiones por minuto por IP para mitigar
   *   ataques de fuerza bruta y adivinación de credenciales.
   *   @see https://docs.nestjs.com/security/rate-limiting
   *
   * @param createLoginDto Objeto con correo electrónico y contraseña.
   * @returns Datos del usuario autenticado, empresa asociada y token JWT firmado.
   * @throws BadRequestException (400) Si faltan campos obligatorios.
   * @throws UnauthorizedException (401) Si las credenciales son incorrectas o el usuario está inactivo.
   * @throws ThrottlerException (429) Si se supera el límite de 5 intentos por minuto.
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @HttpCode(HttpStatus.OK)
  async login(@Body() createLoginDto: CreateLoginDto): Promise<LoginResponseModel> {
    return this.loginService.login(createLoginDto);
  }

  /**
   * Endpoint de Comprobación de Salud (Health Check).
   *
   * Permite a los balanceadores de carga, proxies y sistemas de monitoreo validar
   * que el servicio de autenticación responde adecuadamente sin exponer metadatos sensibles.
   *
   * @returns Objeto JSON con el estado operativo del servicio y marca temporal.
   */
  @Get()
  status() {
    return this.loginService.getHealthStatus();
  }

  /**
   * Endpoint para Obtención de Token de Protección CSRF.
   *
   * Emite un token criptográfico generado por el plugin `@fastify/csrf-protection`
   * e inyecta la cookie firmada `_csrf` en la respuesta HTTP. El cliente debe enviar este
   * valor en la cabecera `x-csrf-token` en peticiones mutables (POST, PUT, DELETE, PATCH).
   *
   * @see https://docs.nestjs.com/security/csrf#use-with-fastify
   * @param reply Objeto de respuesta Fastify inyectado para invocar `reply.generateCsrf()`.
   * @returns Objeto JSON con la propiedad `csrfToken`.
   */
  @Get('csrf-token')
  getCsrfToken(@Res({ passthrough: true }) reply: any) {
    const token = typeof reply.generateCsrf === 'function' ? reply.generateCsrf() : null;
    return {
      csrfToken: token,
    };
  }
}

