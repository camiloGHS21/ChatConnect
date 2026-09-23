import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import bcrypt from 'bcryptjs';
import { EmpresaModel, UsuarioModel } from '../login/models/login.model.js';

/**
 * ============================================================================
 * SERVICIO DE SEMILLADO (SEED): SeedService
 * ============================================================================
 * Se encarga de verificar y sembrar en PostgreSQL el usuario por defecto
 * y su empresa asociada si aún no existen.
 *
 * - Implementa `OnApplicationBootstrap` para ejecutarse automáticamente
 *   al arrancar el servidor backend (NestJS).
 * - Expone el método `seed()` para ejecución manual vía script CLI (`npm run seed`).
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);
  private lastResult: { created: boolean; user: Partial<UsuarioModel> } | null = null;

  constructor(
    @InjectRepository(UsuarioModel)
    private readonly usuarioRepo: Repository<UsuarioModel>,
    @InjectRepository(EmpresaModel)
    private readonly empresaRepo: Repository<EmpresaModel>,
  ) { }

  /**
   * Hook del ciclo de vida de NestJS: se ejecuta una vez que los módulos
   * y la conexión con la base de datos están listos.
   */
  async onApplicationBootstrap(): Promise<void> {
    try {
      this.lastResult = await this.seed();
    } catch (error: any) {
      this.logger.error(`Error durante el semillado inicial: ${error?.message}`, error?.stack);
    }
  }

  /**
   * Ejecuta el proceso de seed de forma estrictamente idempotente.
   * Si el usuario por defecto ya existe, no realiza duplicados.
   *
   * @param force Si es true, omite la caché del ciclo de vida actual y re-evalúa la base de datos.
   */
  async seed(force = false): Promise<{ created: boolean; user: Partial<UsuarioModel> }> {
    if (this.lastResult && !force) {
      return this.lastResult;
    }

    const defaultEmail = process.env.DEFAULT_USER_EMAIL!;
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD!;
    const defaultNombre = process.env.DEFAULT_USER_NAME!;
    const defaultApellido = process.env.DEFAULT_USER_LASTNAME!;
    const defaultRol = process.env.DEFAULT_USER_ROLE!;

    // 1. Localizar o crear la empresa por defecto (debe existir siempre para las FK y triggers)
    let empresa = await this.empresaRepo.findOne({
      where: { id: 1 },
    });

    if (!empresa) {
      const existingEmpresas = await this.empresaRepo.find({ take: 1 });
      if (existingEmpresas.length > 0) {
        empresa = existingEmpresas[0];
        this.logger.log(`Asignando a empresa existente: ${empresa.nombre_comercial} (ID: ${empresa.id})`);
      } else {
        this.logger.warn('No se encontró ninguna empresa registrada. Creando empresa por defecto...');
        const nuevaEmpresa = this.empresaRepo.create({
          nombre_comercial: 'Ferretería y Depósito El Constructor S.A.S.',
          razon_social: 'Ferretería y Depósito El Constructor S.A.S.',
          whatsapp: '+573024610721',
          estado: 'activo',
        });
        empresa = await this.empresaRepo.save(nuevaEmpresa);
        this.logger.log(`✓ Empresa por defecto creada exitosamente con ID ${empresa.id}`);
      }
    } else {
      this.logger.log(`✓ Empresa por defecto verificada: ${empresa.nombre_comercial} (ID: ${empresa.id})`);
    }

    // 2. Verificar si el usuario ya existe en PostgreSQL
    this.logger.log(`Verificando existencia del usuario por defecto (${defaultEmail})...`);
    const existingUser = await this.usuarioRepo.findOne({
      where: { email: ILike(defaultEmail) },
    });

    if (existingUser) {
      this.logger.log(
        `✓ El usuario por defecto ya existe en la base de datos (ID: ${existingUser.id}, Email: ${existingUser.email}). No se requiere acción.`,
      );
      this.lastResult = {
        created: false,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          nombre: existingUser.nombre,
          apellido: existingUser.apellido,
          rol: existingUser.rol,
          empresa_id: existingUser.empresa_id,
        },
      };
      return this.lastResult;
    }

    // 3. Hashear la contraseña por defecto con Bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // 4. Crear y persistir el usuario inicial
    const nuevoUsuario = this.usuarioRepo.create({
      empresa_id: Number(empresa.id),
      nombre: defaultNombre,
      apellido: defaultApellido,
      email: defaultEmail,
      password_hash: passwordHash,
      rol: defaultRol,
      estado: 'activo',
    });

    const usuarioGuardado = await this.usuarioRepo.save(nuevoUsuario);

    this.logger.log(
      `✓ Usuario por defecto creado exitosamente: ID: ${usuarioGuardado.id} | Email: ${usuarioGuardado.email} | Rol: ${usuarioGuardado.rol} | Empresa ID: ${empresa.id}`,
    );

    this.lastResult = {
      created: true,
      user: {
        id: usuarioGuardado.id,
        email: usuarioGuardado.email,
        nombre: usuarioGuardado.nombre,
        apellido: usuarioGuardado.apellido,
        rol: usuarioGuardado.rol,
        empresa_id: usuarioGuardado.empresa_id,
      },
    };

    return this.lastResult;
  }
}
