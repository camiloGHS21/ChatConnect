import { Link } from 'react-router-dom';
import * as yup from 'yup';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { Button } from 'react-bootstrap';
import useSignIn from './useSignIn';

/**
 * Esquema de validación Yup para el formulario de login.
 * Define las restricciones de email y password requeridos.
 */
export const loginSchema = yup.object({
  email: yup.string().email('Por favor ingresa un correo válido').required('Por favor ingresa tu correo'),
  password: yup.string().required('Por favor ingresa tu contraseña'),
});

/**
 * ============================================================================
 * VISTA (MVC): LoginForm
 * ============================================================================
 * Componente visual que renderiza el formulario de inicio de sesión:
 * - Se conecta con el controlador `useSignIn` para obtener lógica y estado.
 * - Enlaza los inputs mediante `control` (react-hook-form).
 * - Deshabilita el botón de envío y muestra feedback durante la carga.
 */
const LoginForm = () => {
  // Extraer estado y funciones del hook controlador de login
  const { loading, login, control } = useSignIn();

  return (
    // onSubmit ejecuta la función 'login' manejada por react-hook-form en useSignIn
    <form onSubmit={login} className="authentication-form">
      {/* Campo de Correo Electrónico */}
      <TextFormInput
        control={control}
        name="email"
        containerClassName="mb-3"
        label="Correo Electrónico"
        id="email-id"
        placeholder="ejemplo@novatech.co"
      />

      {/* Campo de Contraseña con opción de ver/ocultar y enlace de recuperación */}
      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="••••••••"
        id="password-id"
        label={
          <>
            <Link to="/auth/reset-pass" className="float-end text-muted text-unline-dashed ms-1">
              Restablecer contraseña
            </Link>
            <label className="form-label" htmlFor="example-password">
              Contraseña
            </label>
          </>
        }
      />

      {/* Casilla de verificación para "Recordarme" */}
      <div className="mb-3">
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="checkbox-signin" defaultChecked />
          <label className="form-check-label" htmlFor="checkbox-signin">
            Recordarme
          </label>
        </div>
      </div>

      {/* Botón de envío: Se deshabilita mientras la petición al backend esté en curso */}
      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;