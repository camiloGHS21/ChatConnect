export class EnviarColeccionWhatsAppDto {
  telefono: string;
  coleccionId?: string;
  nombreColeccion: string;
  titulo?: string;
  cuerpo?: string;
  retailerIds?: string[];
  tipoMensaje?: 'product_list' | 'catalog_message' | 'multi_seccion';
  conversacionId?: number;
  empresa_id?: number;
}
