/**
 * Estado inicial con datos demo para agilizar pruebas de creación de producto,
 * manteniendo el código interno limpio para ser asignado por PostgreSQL.
 */
export const getInitialProductState = (siguienteCodigo = '') => ({
  // SECCIÓN 1 — Información general (Código interno dinámico/limpio)
  codigo_interno: siguienteCodigo || '',
  nombre: 'Taladro Percutor Inalámbrico 20V MAX XR',
  referencia: 'DW-DCD996B-2026',
  categoria: 'Herramientas Eléctricas',
  categoria_id: '1',
  subcategoria: 'Taladros y Perforación',
  subcategoria_id: '1',
  marca: 'DeWalt',
  marca_id: '1',
  descripcion_corta: 'Taladro percutor inalámbrico con motor sin escobillas (Brushless) de alta eficiencia.',
  descripcion_larga: '<h2>Taladro Percutor Inalámbrico 20V MAX XR</h2><p>Diseñado para aplicaciones exigentes de perforación en mampostería, madera y metal. Cuenta con mandril metálico de 1/2 pulgada y luz LED integrada.</p>',
  ficha_tecnica: 'Voltaje: 20V MAX\nVelocidad sin carga: 0-2000 RPM\nImpactos por minuto: 0-34000 IPM\nMandril: 1/2 pulg metálico\nPeso: 1.6 kg\nGarantía: 3 años',
  estado_producto: 'activo',
  estado_publicacion: 'publicado',

  // SECCIÓN 2 — Costos y precios
  costo_base: 85000,
  impuestos_compra: [
    { id: 1, impuesto_id: 1, codigo: 'IVA19', nombre: 'IVA General 19%', tipo_calculo: 'PORCENTAJE', porcentaje: 19, valor_fijo: 0 }
  ],
  costo_impuesto: 101150,
  precio_base: 145000,
  impuestos_venta: [
    { id: 1, impuesto_id: 1, codigo: 'IVA19', nombre: 'IVA General 19%', tipo_calculo: 'PORCENTAJE', porcentaje: 19, valor_fijo: 0 }
  ],
  precio_impuesto: 172550,
  utilidad_valor: 60000,
  ganancia_final: 71400,
  utilidad_porcentaje: 70.59,

  // SECCIÓN 3 — Listas de precios
  listas_precios: [
    { id: 1, lista_precio_id: '2', nombre_lista: 'Precio Mayorista', precio_base: 120000, utilidad_porcentaje: 41.18, utilidad_valor: 35000, impuesto_porcentaje: 19, precio_venta: 142800, estado: 'activo' },
    { id: 2, lista_precio_id: '3', nombre_lista: 'Precio Distribuidor', precio_base: 110000, utilidad_porcentaje: 29.41, utilidad_valor: 25000, impuesto_porcentaje: 19, precio_venta: 130900, estado: 'activo' }
  ],

  // SECCIÓN 4 — Retenciones (No aplican para valores menores a $500.000 COP)
  retenciones: [],

  // SECCIÓN 5 — Inventario
  maneja_inventario: true,
  tipo_inventario_id: '1',
  medida_id: '1',
  presentacion: 'Caja individual con maletín y batería',
  stock_minimo: 5,
  stock_maximo: 100,
  existencia_inicial: 10,

  // SECCIÓN 6 — Referencias y códigos
  referencias: [
    { id: 1, referencia: 'DW-DCD996B-2026', descripcion: 'Código de fábrica internacional', estado: 'activo' },
    { id: 2, referencia: 'CAT-IND-01', descripcion: 'Catálogo industrial', estado: 'activo' }
  ],
  codigos_barras: [
    { id: 1, codigo_barras: '7701234567890', tipo: 'EAN-13 Comercial', descripcion: 'Código caja máster', principal: true, estado: 'activo' }
  ],
  proveedores: [
    { id: 1, proveedor_id: '1', nombre_proveedor: 'Distribuidora Ferretera del Valle S.A.S.', referencia_proveedor: 'PROV-DW-554', precio_proveedor: 85000, principal: true }
  ],

  // SECCIÓN 7 & 8 — Atributos y Variantes
  atributos_asignados: [
    { id_atributo: 1, nombre: 'Color', codigo: 'COLOR', obligatorio: false, orden: 1, componentes_seleccionados: [1, 2] },
    { id_atributo: 2, nombre: 'Voltaje', codigo: 'VOLTAJE', obligatorio: false, orden: 2, componentes_seleccionados: [4, 5] }
  ],
  variantes: [
    { id: 1, sku: 'VAR-AMA-20V', combinacion: 'Color: Amarillo DeWalt | Voltaje: 20V MAX', codigo_barras: '7709990001', referencia: 'VAR-AMA-20V', precio: 172550, stock: 25, estado: 'activo' },
    { id: 2, sku: 'VAR-NEG-20V', combinacion: 'Color: Negro | Voltaje: 20V MAX', codigo_barras: '7709990002', referencia: 'VAR-NEG-20V', precio: 172550, stock: 30, estado: 'activo' }
  ],

  // Metadatos para la IA y buscadores (producto_seo_ia)
  titulo_seo: 'Taladro Percutor Inalámbrico 20V MAX XR DeWalt | Tienda Oficial',
  slug: '/productos/taladro-percutor-inalambrico-20v-max-xr',
  descripcion_seo: 'Compra el Taladro Percutor Inalámbrico 20V MAX XR DeWalt con motor sin escobillas. Envíos a todo el país y garantía oficial.',
  palabras_clave: 'taladro, percutor, dewalt, herramientas electricas, taladro inalambrico',
  etiquetas: ['Herramientas', 'DeWalt', 'Inalámbrico', 'Profesional'],
  sinonimos: 'taladro percutor, taladro de impacto, perforador inalambrico',
  texto_busqueda: 'Taladro Percutor Inalambrico 20V MAX XR DeWalt motor brushless perforacion',
  caracteristicas: '• Motor sin escobillas Brushless de alta eficiencia\n• Mandril metálico de 1/2 pulgada\n• 3 modos de velocidad y luz LED integrada',
  usos: 'Perforación en mampostería, concreto, madera y metal para uso profesional e industrial.',
  publico_objetivo: 'Contratistas, instaladores, carpinteros y profesionales de la construcción.',
  indexable: true,
  contenido_ia: 'Recomienda este taladro cuando los clientes busquen herramientas de alta potencia para trabajo pesado.',

  // Imágenes (producto_imagen)
  imagenes: [
    { id: 1, url: 'https://iili.io/nYj72us.jpg', nombre: 'taladro_dewalt_amarillo_20v.jpg', principal: true, orden: 1, tamano: '417 KB' },
    { id: 2, url: 'https://iili.io/nYj7fn4.jpg', nombre: 'taladro_percutor_negro_20v.jpg', principal: false, orden: 2, tamano: '345 KB' }
  ]
});

export default getInitialProductState;
