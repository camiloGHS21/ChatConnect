import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
  BadRequestException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateLoginDto } from '../dto/create-login.dto.js';
import { LoginResponseModel, UsuarioModel } from '../models/login.model.js';
import { LoginRepository } from '../repositories/login.repository.js';
import { CsrfGuard } from '../guards/csrf.guard.js';

/**
 * ============================================================================
 * CONTROLADOR DE AUTENTICACIÓN (`/login`) DIRECTO A REPOSITORIO
 * ============================================================================
 * Flujo directo y simplificado:
 * Controller ──► Repository (TypeORM) ──► PostgreSQL
 *
 * Sin capas intermedias innecesarias:
 * 1. `POST /login` - Valida credenciales contra el repositorio y emite JWT.
 *    Protegido con Rate Limiting (@Throttle) y Validación CSRF (@UseGuards(CsrfGuard)).
 * 2. `GET /login` - Health check del microservicio.
 * 3. `GET /login/csrf-token` - Emisión y firma de token CSRF.
 */
@Controller('login')
export class LoginController {
  private readonly logger = new Logger(LoginController.name);
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(private readonly loginRepository: LoginRepository) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET debe estar definido en el archivo .env');
    }
    this.jwtSecret = secret;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Endpoint de Inicio de Sesión protegido contra ataques de fuerza bruta y CSRF
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(CsrfGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  async login(@Body() createLoginDto: CreateLoginDto): Promise<LoginResponseModel> {
    const { email, password } = createLoginDto || {};
    if (!email || !password) {
      throw new BadRequestException({ error: 'Debes proporcionar correo y contraseña' });
    }

    // 1. Consulta directa al repositorio TypeORM
    const usuario = await this.loginRepository.findByEmail(email);
    if (!usuario) {
      this.logger.warn(`Login fallido: usuario no encontrado (${email})`);
      throw new UnauthorizedException({ error: 'Correo electrónico o contraseña incorrectos' });
    }

    // 2. Verificar estado activo
    if (usuario.estado !== 'activo') {
      throw new UnauthorizedException({ error: 'El usuario se encuentra inactivo en el sistema' });
    }

    // 3. Validar contraseña (con migración a Bcrypt si estaba en texto plano)
    const isValid = await this.validatePassword(password, usuario);
    if (!isValid) {
      this.logger.warn(`Login fallido: contraseña incorrecta (${email})`);
      throw new UnauthorizedException({ error: 'Correo electrónico o contraseña incorrectos' });
    }

    // 4. Actualizar fecha de último login en background
    this.loginRepository.updateUltimoLogin(usuario.id).catch((err) => {
      this.logger.error('Error al actualizar ultimo_login', err);
    });

    // 5. Generar token JWT
    const token = jwt.sign(
      {
        sub: Number(usuario.id),
        email: usuario.email,
        empresa_id: Number(usuario.empresa_id),
        rol: usuario.rol || 'usuario',
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn as any },
    );

    const empresa = usuario.empresa;

    return {
      token,
      user: {
        id: Number(usuario.id),
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        empresa_id: Number(usuario.empresa_id),
        rol: usuario.rol || 'usuario',
      },
      empresa: {
        id: Number(usuario.empresa_id),
        nombre: empresa?.nombre_comercial || empresa?.razon_social || 'Empresa',
        razon_social: empresa?.razon_social,
        whatsapp: empresa?.whatsapp,
      },
    };
  }

  /**
   * Compara la contraseña y migra contraseñas legadas
   */
  private async validatePassword(password: string, usuario: UsuarioModel): Promise<boolean> {
    const isBcrypt =
      usuario.password_hash.startsWith('$2a$') ||
      usuario.password_hash.startsWith('$2b$') ||
      usuario.password_hash.startsWith('$2y$');

    if (isBcrypt) {
      return bcrypt.compare(password, usuario.password_hash);
    }

    if (usuario.password_hash === password) {
      this.logger.log(`Auto-encriptando contraseña con Bcrypt para usuario ID ${usuario.id}`);
      const hash = await bcrypt.hash(password, 10);
      await this.loginRepository.updatePassword(usuario.id, hash);
      return true;
    }

    return false;
  }

  /**
   * Health check público
   */
  @Get()
  status() {
    return {
      status: 'ok',
      service: 'chatconnect-auth',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Token CSRF
   */
  @Get('csrf-token')
  getCsrfToken(@Res({ passthrough: true }) reply: any) {
    const token = typeof reply.generateCsrf === 'function' ? reply.generateCsrf() : null;
    return { csrfToken: token };
  }
}
