// Helper oficial DIAN: Cálculo de Dígito de Verificación (DV) para NIT en Colombia (Módulo 11)
export const calcularDvDian = (nitStr) => {
  const nit = String(nitStr || '').replace(/\D/g, '');
  if (!nit) return '';
  const primos = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  let suma = 0;
  const nitLen = nit.length;
  const primosSubset = primos.slice(primos.length - nitLen);
  for (let i = 0; i < nitLen; i++) {
    suma += parseInt(nit[i], 10) * primosSubset[i];
  }
  const residuo = suma % 11;
  return residuo === 0 || residuo === 1 ? String(residuo) : String(11 - residuo);
};

export const INITIAL_SUPPLIER_FORM = {
  tipo_persona: 'juridica',
  tipo_tercero: 'Proveedor',
  tipo_documento: 'NIT',
  numero_documento: '',
  digito_verificacion: '',
  razon_social: '',
  email: '',
  telefono_fijo: '',
  celular: '',
  departamento: '',
  ciudad: '',
  direccion: '',
};

export const DOC_TYPES = [
  { id: 'NIT', nombre: 'NIT - Identificación Tributaria' },
  { id: 'CC', nombre: 'Cédula de Ciudadanía' },
  { id: 'CE', nombre: 'Cédula de Extranjería' },
  { id: 'PAS', nombre: 'Pasaporte' },
  { id: 'DIE', nombre: 'Documento Extranjero' },
];
