import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateLoginDto } from '../dto/create-login.dto.js';
import { LoginResponseModel } from '../models/login.model.js';
import { DatabaseService } from '../../database/database.service.js';

/**
 * Servicio Central de Autenticación (`LoginService`).
 *
 * Encapsula la lógica de negocio para la gestión de identidades y acceso:
 * - Verificación criptográfica de contraseñas con Bcrypt.
 * - Migración transparente y segura de contraseñas heredadas a hashes Bcrypt.
 * - Generación y verificación de tokens de acceso JSON Web Token (JWT).
 * - Consultas parametrizadas sobre las tablas `usuarios` y `empresas` en PostgreSQL.
 * - Registro de auditoría del último acceso (`ultimo_login`).
 * - Exposición de estado operativo mediante sondas de salud (Health check).
 */
@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  /**
   * Inicializa el servicio validando la presencia del secreto criptográfico JWT.
   * @throws Error si `JWT_SECRET` no está configurado en el archivo `.env`.
   */
  constructor(private readonly databaseService: DatabaseService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET debe estar definido en el archivo .env para garantizar la seguridad');
    }
    this.jwtSecret = secret;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Encripta una contraseña en texto plano utilizando el algoritmo Bcrypt con factor de coste 10.
   *
   * @param password Contraseña en texto plano suministrada.
   * @returns Hash Bcrypt seguro de 60 caracteres.
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compara una contraseña en texto plano contra un hash Bcrypt existente de forma segura
   * contra ataques de temporización (timing attacks).
   *
   * @param password Contraseña candidata enviada por el usuario.
   * @param hash Hash almacenado en la base de datos PostgreSQL.
   * @returns `true` si la contraseña coincide con el hash; de lo contrario `false`.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Genera un token JWT (JSON Web Token) firmado criptográficamente con HMAC-SHA256.
   *
   * Claims incluidos en el payload:
   * - `sub`: Identificador numérico único del usuario en PostgreSQL.
   * - `email`: Correo electrónico del usuario.
   * - `empresa_id`: Identificador de la empresa u organización a la que pertenece.
   * - `rol`: Rol del usuario en la plataforma ('administrador', 'asesor', etc.).
   *
   * @param payload Datos esenciales del usuario para incrustar en el token.
   * @returns Token JWT compacto codificado en Base64Url.
   */
  generateJwt(payload: { id: number; email: string; empresa_id: number; rol: string }): string {
    return jwt.sign(
      {
        sub: payload.id,
        email: payload.email,
        empresa_id: payload.empresa_id,
        rol: payload.rol,
      },
      this.jwtSecret,
      {
        expiresIn: this.jwtExpiresIn as any,
      },
    );
  }

  /**
   * Verifica la integridad, validez temporal y firma criptográfica de un token JWT.
   *
   * @param token Cadena del token JWT recibido en la cabecera Authorization: Bearer <token>.
   * @returns Objeto con el payload decodificado si es válido.
   * @throws UnauthorizedException Si el token ha expirado, está malformado o la firma es inválida.
   */
  verifyJwt(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Token JWT inválido o expirado');
    }
  }

  /**
   * Proceso integral de autenticación de usuario contra la base de datos PostgreSQL.
   *
   * Pasos del flujo:
   * 1. Validación de presencia de credenciales (email y password).
   * 2. Búsqueda parametrizada en las tablas `usuarios` unida con `empresas`.
   * 3. Comprobación del estado de la cuenta (`estado === 'activo'`).
   * 4. Validación criptográfica de la contraseña con Bcrypt. Si se detecta una contraseña legada
   *    en texto plano, la valida y migra inmediatamente a un hash Bcrypt en la BD.
   * 5. Actualización no bloqueante del campo `ultimo_login` y `updated_at`.
   * 6. Emisión de token JWT firmado y retorno de perfil de usuario y empresa.
   *
   * @param credentials Objeto con `email` y `password`.
   * @returns Estructura con `token`, `user` y `empresa`.
   * @throws BadRequestException Si faltan email o password.
   * @throws UnauthorizedException Si las credenciales no coinciden o el usuario no está activo.
   */
  async login(credentials: CreateLoginDto): Promise<LoginResponseModel> {
    const { email, password } = credentials || {};

    if (!email || !password) {
      throw new BadRequestException({ error: 'Debes proporcionar correo y contraseña' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Consulta directa a la base de datos PostgreSQL real con marcadores de posición parametrizados
    const result = await this.databaseService.query(
      `SELECT 
         u.id, 
         u.empresa_id, 
         u.nombre, 
         u.apellido, 
         u.email, 
         u.password_hash, 
         u.rol, 
         u.estado,
         e.nombre_comercial,
         e.razon_social,
         e.whatsapp
       FROM public.usuarios u
       JOIN public.empresas e ON e.id = u.empresa_id
       WHERE LOWER(u.email) = LOWER($1)
       LIMIT 1`,
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      this.logger.warn(`Intento de login fallido para: ${normalizedEmail}`);
      throw new UnauthorizedException({ error: 'Correo electrónico o contraseña incorrectos' });
    }

    const usuario = result.rows[0];

    // Verificar si el usuario se encuentra activo en el sistema
    if (usuario.estado !== 'activo') {
      throw new UnauthorizedException({ error: 'El usuario se encuentra inactivo en el sistema' });
    }

    // Comprobación de contraseña segura con Bcrypt
    let isPasswordValid = false;
    const isBcryptHash =
      usuario.password_hash.startsWith('$2a$') ||
      usuario.password_hash.startsWith('$2b$') ||
      usuario.password_hash.startsWith('$2y$');

    if (isBcryptHash) {
      isPasswordValid = await this.comparePassword(password, usuario.password_hash);
    } else {
      // Si la contraseña estaba en texto plano en la BD, la autentica y la encripta automáticamente con Bcrypt
      isPasswordValid = usuario.password_hash === password;
      if (isPasswordValid) {
        this.logger.log(`Auto-encriptando contraseña con Bcrypt para usuario ID ${usuario.id}`);
        const secureHash = await this.hashPassword(password);
        await this.databaseService.query(
          'UPDATE public.usuarios SET password_hash = $1 WHERE id = $2',
          [secureHash, usuario.id],
        );
      }
    }

    if (!isPasswordValid) {
      this.logger.warn(`Contraseña incorrecta para: ${normalizedEmail}`);
      throw new UnauthorizedException({ error: 'Correo electrónico o contraseña incorrectos' });
    }

    // Actualizar fecha de último login en PostgreSQL de forma asíncrona
    try {
      await this.databaseService.query(
        'UPDATE public.usuarios SET ultimo_login = NOW(), updated_at = NOW() WHERE id = $1',
        [usuario.id],
      );
    } catch (e) {
      this.logger.error('No se pudo actualizar ultimo_login');
    }

    // Generar token JWT estándar firmado
    const token = this.generateJwt({
      id: Number(usuario.id),
      email: usuario.email,
      empresa_id: Number(usuario.empresa_id),
      rol: usuario.rol || 'usuario',
    });

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
        nombre: usuario.nombre_comercial || usuario.razon_social || 'Empresa',
        razon_social: usuario.razon_social,
        whatsapp: usuario.whatsapp,
      },
    };
  }

  /**
   * Health status público seguro.
   * No expone detalles internos de la infraestructura, nombres de bases de datos ni stacks de errores.
   *
   * @returns Objeto de estado operativo del microservicio.
   */
  getHealthStatus() {
    return {
      status: 'ok',
      service: 'chatconnect-auth',
      timestamp: new Date().toISOString(),
    };
  }
}


