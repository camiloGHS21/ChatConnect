export class CreateClienteDto {
  tipo_persona?: 'natural' | 'juridica';
  tipo_tercero?: 'cliente' | 'proveedor' | 'ambos';
  tipo_documento?: string;
  numero_documento?: string;
  digito_verificacion?: string;
  nombre?: string;
  apellido?: string;
  razon_social?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  whatsapp?: string;
  id_departamento?: number;
  id_ciudad?: number;
  departamento?: string;
  ciudad?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
}

export class UpdateClienteDto {
  tipo_persona?: 'natural' | 'juridica';
  tipo_documento?: string;
  numero_documento?: string;
  digito_verificacion?: string;
  nombre?: string;
  apellido?: string;
  razon_social?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  departamento?: string;
  ciudad?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  estado?: 'activo' | 'inactivo';
}
