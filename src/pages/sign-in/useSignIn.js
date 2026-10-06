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
 * ============================================================================
 * CONTROLADOR (MVC): useSignIn
 * ============================================================================
 * Custom Hook que centraliza toda la lógica de negocio para el inicio de sesión:
 * 1. Control del estado de carga (loading) para feedback visual y bloqueo de UI.
 * 2. Validación de campos (email y password) usando Yup y React Hook Form.
 * 3. Invocación al servicio de autenticación (`authService.login`).
 * 4. Manejo de respuesta exitosa: almacenamiento de token/sesión y redirección.
 * 5. Manejo de errores: captura de fallos de red o credenciales incorrectas.
 */
const useSignIn = () => {
  // Estado local para indicar si la petición HTTP está en curso
  const [loading, setLoading] = useState(false);

  // Hook de React Router para navegación programática (redirigir de página)
  const navigate = useNavigate();

  // Función provista por el AuthContext para persistir la sesión en cookies/localStorage
  const { saveSession } = useAuthContext();

  // Permite leer parámetros de búsqueda de la URL (ej: ?redirectTo=/chats)
  const [searchParams] = useSearchParams();

  // Hook de notificaciones globales para mostrar mensajes tipo toast (éxito o error)
  const { showNotification } = useNotificationContext();

  /**
   * --------------------------------------------------------------------------
   * ESQUEMA DE VALIDACIÓN (Yup)
   * --------------------------------------------------------------------------
   * Define las reglas que deben cumplir los campos antes de permitir el envío:
   * - email: Debe ser obligatorio y tener formato de correo electrónico válido.
   * - password: Debe ser obligatorio.
   */
  const loginFormSchema = yup.object({
    email: yup
      .string()
      .email('Ingresa un correo electrónico válido')
      .required('Por favor ingresa tu correo'),
    password: yup
      .string()
      .required('Por favor ingresa tu contraseña'),
  });

  /**
   * --------------------------------------------------------------------------
   * CONFIGURACIÓN DE REACT HOOK FORM
   * --------------------------------------------------------------------------
   * - resolver: Conecta Yup con react-hook-form para validar automáticamente.
   * - defaultValues: Valores iniciales cargados desde auth.model.js (útil para pruebas).
   */
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: DEFAULT_CREDENTIALS.email,
      password: DEFAULT_CREDENTIALS.password,
    },
  });

  /**
   * Redirige al usuario tras un login exitoso:
   * Si la URL contenía "?redirectTo=/alguna-ruta", redirige allí;
   * de lo contrario, lo envía por defecto al "/dashboard".
   */
  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) navigate(redirectLink);
    else navigate('/dashboard');
  };

  /**
   * --------------------------------------------------------------------------
   * FUNCIÓN PRINCIPAL DE LOGIN (SUBMIT HANDLER)
   * --------------------------------------------------------------------------
   * Se ejecuta automáticamente tras validar exitosamente el formulario con Yup.
   * @param {{ email: string, password: string }} values - Datos ingresados en el formulario
   */
  const login = handleSubmit(async (values) => {
    // 1. Activar bandera de carga (deshabilita botones y muestra spinner/texto de carga)
    setLoading(true);

    try {
      // 2. Llamada asíncrona al servicio de autenticación (POST /login al backend NestJS)
      const data = await authService.login(values);

      // 3. Si el backend responde con un token JWT válido:
      if (data?.token) {
        // Guardar la información de sesión (token, datos de usuario y empresa)
        // tanto en cookies como en localStorage y en el estado global de React
        saveSession({
          ...data,
          token: data.token,
        });

        // Redirigir al usuario al dashboard o a la ruta solicitada previamente
        redirectUser();

        // Mostrar notificación toast de bienvenida con el nombre del usuario
        showNotification({
          message: `¡Bienvenido de nuevo, ${data.user?.nombre || 'Usuario'}! Redirigiendo...`,
          variant: 'success',
        });
      }
    } catch (e) {
      // 4. Captura de errores (credenciales incorrectas 401, error 500 o fallo de conexión)
      // Se extrae el mensaje prioritariamente de la respuesta del backend
      const errorMessage =
        e.response?.data?.error ||
        e.response?.data?.message ||
        e.message ||
        'Error de conexión con el servidor';

      // Mostrar toast de alerta en color rojo (danger) con el mensaje de error
      showNotification({
        message: errorMessage,
        variant: 'danger',
      });
    } finally {
      // 5. Restablecer el estado de carga al terminar (éxito o error)
      setLoading(false);
    }
  });

  // Retorna las propiedades y funciones necesarias para la vista (LoginForm.jsx)
  return {
    loading, // boolean: true si está procesando la petición
    login,   // function: función para enlazar en onSubmit del formulario
    control, // object: controlador para vincular los inputs de react-hook-form
  };
};

export default useSignIn;