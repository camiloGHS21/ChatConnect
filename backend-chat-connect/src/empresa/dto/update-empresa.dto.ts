export class UpdateEmpresaDto {
  razon_social?: string | null;
  nombre_comercial?: string;
  nit?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  direccion?: string | null;
  pais?: string | null;
  departamento?: string | null;
  ciudad?: string | null;
  sector?: string | null;
  categoria_producto_obligatoria?: boolean;
}
