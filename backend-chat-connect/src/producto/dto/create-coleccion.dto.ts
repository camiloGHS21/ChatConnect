export class CreateColeccionDto {
  name: string;
  tipo: 'categoria' | 'subcategoria' | 'productos_seleccionados';
  categoriaNombre?: string;
  subcategoriaNombre?: string;
  retailerIds?: string[];
  empresa_id?: number;
}
