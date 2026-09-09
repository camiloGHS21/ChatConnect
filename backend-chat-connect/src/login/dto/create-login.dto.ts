/**
 * Objeto de Transferencia de Datos (DTO) para la petición de inicio de sesión.
 */
export class CreateLoginDto {
  /**
   * Correo electrónico registrado del usuario.
   * @example "admin@chatconnect.com"
   */
  email: string;

  /**
   * Contraseña en texto plano para verificar contra el hash Bcrypt.
   * @example "PasswordSegura123!"
   */
  password: string;
}

