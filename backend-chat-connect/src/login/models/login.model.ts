/**
 * =============================================================================
 * MODELOS: AUTENTICACIÓN Y USUARIO
 * Representación del modelo relacional de la base de datos PostgreSQL de ChatConnect.
 * =============================================================================
 */

/**
 * Representa la entidad Empresa (`public.empresas`).
 * Agrupa la configuración multitenant, razón social y datos de contacto de WhatsApp.
 */
export interface EmpresaModel {
  /** Identificador primario autoincremental en PostgreSQL */
  id: number;
  /** Identificador universal único opcional */
  uuid?: string;
  /** Nombre comercial o de marca de la empresa */
  nombre_comercial: string;
  /** Razón social legal registrada ante autoridades tributarias */
  razon_social?: string;
  /** Número telefónico de WhatsApp de la empresa */
  whatsapp?: string;
  /** Número de Identificación Tributaria o documento fiscal */
  nit?: string;
  /** Estado operativo de la empresa ('activo' | 'inactivo') */
  estado: string;
  /** Fecha de registro en el sistema */
  created_at?: Date | string;
  /** Fecha de última modificación */
  updated_at?: Date | string;
}

/**
 * Representa la entidad Usuario (`public.usuarios`).
 * Corresponde a los operadores, asesores y administradores que acceden al CRM.
 */
export class UsuarioModel {
  /** Identificador primario único del usuario */
  id: number;
  /** Clave foránea que referencia a `public.empresas(id)` */
  empresa_id: number;
  /** Nombre de pila del usuario */
  nombre: string;
  /** Apellidos del usuario */
  apellido?: string;
  /** Correo electrónico único utilizado como credencial de acceso */
  email: string;
  /** Hash criptográfico de la contraseña (Bcrypt) */
  password_hash: string;
  /** Rol de permisos ('administrador' | 'asesor' | 'usuario') */
  rol: string;
  /** Estado de la cuenta ('activo' | 'inactivo') */
  estado: string;
  /** Marca temporal del último inicio de sesión exitoso */
  ultimo_login?: Date | string;
  /** Fecha de creación del registro */
  created_at?: Date | string;
  /** Fecha de última actualización del registro */
  updated_at?: Date | string;

  /** Entidad empresa hidratada en consultas con JOIN */
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


