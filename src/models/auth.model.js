/**
 * MODELO: AUTENTICACIÓN Y SESIÓN (FRONTEND MVC)
 * Basado en las entidades relacionales: usuarios, empresas y roles
 */

/**
 * @typedef {Object} UsuarioModel
 * @property {number} id
 * @property {string} nombre
 * @property {string} [apellido]
 * @property {string} email
 * @property {number} empresa_id
 * @property {string} [rol]
 */

/**
 * @typedef {Object} EmpresaModel
 * @property {number} id
 * @property {string} nombre
 * @property {string} [nit]
 */

/**
 * @typedef {Object} AuthSessionModel
 * @property {string} token
 * @property {UsuarioModel} user
 * @property {EmpresaModel} [empresa]
 */

export const DEFAULT_CREDENTIALS = {
  email: 'test@techzaa.in',
  password: 'password',
};
