import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Empresa (`public.empresas`)
 * Coincide 1:1 con la tabla PostgreSQL del diagrama:
 * - id: bigserial (PK)
 * - uuid: uuid (Unique)
 * - razon_social: character varying(200)
 * - nombre_comercial: character varying(200)
 * - nit: character varying(50)
 * - telefono: character varying(50)
 * - whatsapp: character varying(30)
 * - email: character varying(150)
 * - direccion: text
 * - pais: character varying(100)
 * - departamento: character varying(100)
 * - ciudad: character varying(100)
 * - sector: character varying(100)
 * - estado: character varying(30)
 * - created_at: timestamp with time zone
 * - updated_at: timestamp with time zone
 * =============================================================================
 */
@Entity('empresas', { schema: 'public' })
export class EmpresaModel {
  /** Identificador primario (bigserial en PostgreSQL) */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** Identificador universal único */
  @Column({ type: 'uuid', generated: 'uuid', nullable: true, unique: true })
  uuid?: string;

  /** Razón social legal registrada */
  @Column({ type: 'varchar', length: 200, nullable: true })
  razon_social?: string;

  /** Nombre comercial de la empresa */
  @Column({ type: 'varchar', length: 200 })
  nombre_comercial: string;

  /** Número de Identificación Tributaria o documento fiscal */
  @Column({ type: 'varchar', length: 50, nullable: true })
  nit?: string;

  /** Teléfono de contacto */
  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono?: string;

  /** Número de WhatsApp de la empresa */
  @Column({ type: 'varchar', length: 30, nullable: true })
  whatsapp?: string;

  /** Correo electrónico de la empresa */
  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  /** Dirección física */
  @Column({ type: 'text', nullable: true })
  direccion?: string;

  /** País */
  @Column({ type: 'varchar', length: 100, nullable: true })
  pais?: string;

  /** Departamento / Estado */
  @Column({ type: 'varchar', length: 100, nullable: true })
  departamento?: string;

  /** Ciudad */
  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad?: string;

  /** Sector económico o comercial */
  @Column({ type: 'varchar', length: 100, nullable: true })
  sector?: string;

  /** Estado operativo de la empresa ('activo' | 'inactivo') */
  @Column({ type: 'varchar', length: 30, default: 'activo' })
  estado: string;

  /** Fecha de registro en el sistema */
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at?: Date | string;

  /** Fecha de última modificación */
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updated_at?: Date | string;

  /** Relación uno a muchos con los usuarios de la empresa */
  @OneToMany(() => UsuarioModel, (usuario) => usuario.empresa)
  usuarios?: UsuarioModel[];
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Usuario (`public.usuarios`)
 * Coincide 1:1 con la tabla PostgreSQL del diagrama:
 * - id: bigserial (PK)
 * - empresa_id: bigint (FK -> public.empresas.id)
 * - nombre: character varying(150)
 * - apellido: character varying(150)
 * - email: character varying(150) (Unique)
 * - password_hash: character varying(255)
 * - rol: character varying(50)
 * - estado: character varying(30)
 * - ultimo_login: timestamp with time zone
 * - created_at: timestamp with time zone
 * - updated_at: timestamp with time zone
 * =============================================================================
 */
@Entity('usuarios', { schema: 'public' })
export class UsuarioModel {
  /** Identificador primario (bigserial en PostgreSQL) */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** Clave foránea que referencia a public.empresas(id) */
  @Column({ type: 'bigint', name: 'empresa_id' })
  empresa_id: number;

  /** Nombre de pila del usuario */
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  /** Apellidos del usuario */
  @Column({ type: 'varchar', length: 150, nullable: true })
  apellido?: string;

  /** Correo electrónico único utilizado para login */
  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  /** Hash Bcrypt de la contraseña */
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  password_hash: string;

  /** Rol asignado ('administrador', 'asesor', etc.) */
  @Column({ type: 'varchar', length: 50, default: 'usuario' })
  rol: string;

  /** Estado del usuario ('activo' | 'inactivo') */
  @Column({ type: 'varchar', length: 30, default: 'activo' })
  estado: string;

  /** Marca temporal del último inicio de sesión */
  @Column({ type: 'timestamp with time zone', nullable: true, name: 'ultimo_login' })
  ultimo_login?: Date | string;

  /** Fecha de creación del registro */
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at?: Date | string;

  /** Fecha de última actualización del registro */
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updated_at?: Date | string;

  /** Relación muchos a uno con la empresa */
  @ManyToOne(() => EmpresaModel, (empresa) => empresa.usuarios)
  @JoinColumn({ name: 'empresa_id' })
  empresa?: EmpresaModel;
}

/**
 * Estructura de respuesta devuelta por el endpoint `POST /login` tras una autenticación exitosa.
 */
export class LoginResponseModel {
  /** Token de acceso JWT firmado criptográficamente para autenticar peticiones subsecuentes */
  token: string;

  /** Datos públicos del usuario autenticado para consumo de la UI */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    email: string;
    empresa_id: number;
    rol: string;
  };

  /** Información de la empresa asociada al usuario */
  empresa?: {
    id: number;
    nombre: string;
    razon_social?: string;
    whatsapp?: string;
  };
}
