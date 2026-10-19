// La entidad ya es compartida por autenticación; se reexporta desde el módulo
// de empresa para mantener un único metadata de TypeORM sobre public.empresa.
export { EmpresaModel } from '../../login/models/login.model.js';
