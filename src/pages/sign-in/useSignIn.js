import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import authService from '@/services/authService';
import { DEFAULT_CREDENTIALS } from '@/models/auth.model';

/**
 * CONTROLADOR (MVC): useSignIn
 * Gestiona el estado, validación y envío de credenciales hacia el modelo
 */
const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotificationContext();

  const loginFormSchema = yup.object({
    email: yup.string().email('Ingresa un correo electrónico válido').required('Por favor ingresa tu correo'),
    password: yup.string().required('Por favor ingresa tu contraseña'),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: DEFAULT_CREDENTIALS.email,
      password: DEFAULT_CREDENTIALS.password,
    },
  });

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) navigate(redirectLink);
    else navigate('/dashboard');
  };

  const login = handleSubmit(async (values) => {
    setLoading(true);
    try {
      // Llamada al servicio del modelo
      const data = await authService.login(values);

      if (data?.token) {
        saveSession({
          ...data,
          token: data.token,
        });
        redirectUser();
        showNotification({
          message: `¡Bienvenido de nuevo, ${data.user?.nombre || 'Usuario'}! Redirigiendo...`,
          variant: 'success',
        });
      }
    } catch (e) {
      const errorMessage =
        e.response?.data?.error ||
        e.response?.data?.message ||
        e.message ||
        'Error de conexión con el servidor backend';
      showNotification({
        message: errorMessage,
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  });

  return {
    loading,
    login,
    control,
  };
};

export default useSignIn;