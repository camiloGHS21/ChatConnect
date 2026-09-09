import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UsuarioModel } from '../models/login.model.js';

/**
 * ============================================================================
 * REPOSITORIO (DATA ACCESS LAYER): LoginRepository
 * ============================================================================
 * Al igual que en Spring Data JPA / Repository Pattern:
 * Encapsula de forma exclusiva todas las operaciones sobre la base de datos
 * para la autenticación, aislando TypeORM del servicio de negocio.
 */
@Injectable()
export class LoginRepository {
  constructor(
    @InjectRepository(UsuarioModel)
    private readonly repo: Repository<UsuarioModel>,
  ) {}

  /**
   * Busca un usuario por email (búsqueda case-insensitive)
   * e hidrata automáticamente su relación con la empresa.
   *
   * @param email Correo electrónico a buscar
   * @returns Usuario con empresa vinculada o null
   */
  async findByEmail(email: string): Promise<UsuarioModel | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.repo.findOne({
      where: { email: ILike(normalizedEmail) },
      relations: { empresa: true },
    });
  }

  /**
   * Actualiza el hash de la contraseña del usuario en PostgreSQL.
   *
   * @param id ID del usuario
   * @param passwordHash Nuevo hash Bcrypt
   */
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.repo.update(id, {
      password_hash: passwordHash,
      updated_at: new Date(),
    });
  }

  /**
   * Actualiza la fecha del último inicio de sesión del usuario.
   *
   * @param id ID del usuario
   */
  async updateUltimoLogin(id: number): Promise<void> {
    await this.repo.update(id, {
      ultimo_login: new Date(),
      updated_at: new Date(),
    });
  }
}
