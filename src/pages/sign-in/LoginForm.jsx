import { Link } from 'react-router-dom';
import * as yup from 'yup';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { Button } from 'react-bootstrap';
import useSignIn from './useSignIn';

export const loginSchema = yup.object({
  email: yup.string().email('Por favor ingresa un correo válido').required('Por favor ingresa tu correo'),
  password: yup.string().required('Por favor ingresa tu contraseña'),
});

const LoginForm = () => {
  const { loading, login, control } = useSignIn();

  return (
    <form onSubmit={login} className="authentication-form">
      <TextFormInput
        control={control}
        name="email"
        containerClassName="mb-3"
        label="Correo Electrónico"
        id="email-id"
        placeholder="ejemplo@novatech.co"
      />

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

      <div className="mb-3">
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="checkbox-signin" defaultChecked />
          <label className="form-check-label" htmlFor="checkbox-signin">
            Recordarme
          </label>
        </div>
      </div>
      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;