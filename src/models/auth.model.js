/**
 * ============================================================================
 * MODELO: AUTENTICACIÓN Y SESIÓN (FRONTEND MVC)
 * ============================================================================
 * Define las interfaces de datos (JSDoc) correspondientes a las entidades
 * que viajan entre el backend NestJS y la aplicación cliente.
 */

/**
 * Modelo de Usuario que retorna el backend tras el login exitoso.
 * @typedef {Object} UsuarioModel
 * @property {number} id - Identificador único del usuario en base de datos.
 * @property {string} nombre - Nombre del usuario.
 * @property {string} [apellido] - Apellido del usuario (opcional).
 * @property {string} email - Correo electrónico de acceso.
 * @property {number} empresa_id - ID de la empresa vinculada.
 * @property {string} [rol] - Rol o permisos asignados (ej: 'ADMIN', 'AGENTE').
 */

/**
 * Modelo de Empresa a la que pertenece el usuario.
 * @typedef {Object} EmpresaModel
 * @property {number} id - Identificador único de la empresa.
 * @property {string} nombre - Nombre comercial o razón social.
 * @property {string} [nit] - Número de Identificación Tributaria (opcional).
 */

/**
 * Estructura de la sesión completa que se persiste en cookies y localStorage.
 * @typedef {Object} AuthSessionModel
 * @property {string} token - Token JWT para autorizar peticiones en cabecera HTTP Bearer.
 * @property {UsuarioModel} user - Datos del usuario autenticado.
 * @property {EmpresaModel} [empresa] - Datos de la empresa asociada.
 */

/**
 * Credenciales por defecto prellenadas en el formulario de login
 * para facilitar pruebas de desarrollo rápido.
 */
export const DEFAULT_CREDENTIALS = {
  email: 'test@techzaa.in',
  password: 'password',
};
