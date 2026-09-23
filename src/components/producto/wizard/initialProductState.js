/**
 * Estado inicial del producto idéntico al template oficial Reback
 * (Zapatillas Deportivas Ultra Light Pro) con datos completos en los 5 pasos.
 */
export const getInitialProductState = (siguienteCodigo = '') => ({
  // SECCIÓN 1 — Información general
  codigo_interno: siguienteCodigo || 'FER-0049',
  nombre: 'Taladro Percutor Inalámbrico 20V MAX XR',
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
  utilidad_porcentaje: 70.59,

  // SECCIÓN 3 — Listas de precios
  listas_precios: [
    { id: 1, lista_precio_id: '2', nombre_lista: 'Precio Mayorista', precio_base: 120000, utilidad_porcentaje: 41.18, utilidad_valor: 35000, impuesto_porcentaje: 19, precio_venta: 142800, estado: 'activo' },
    { id: 2, lista_precio_id: '3', nombre_lista: 'Precio Distribuidor', precio_base: 110000, utilidad_porcentaje: 29.41, utilidad_valor: 25000, impuesto_porcentaje: 19, precio_venta: 130900, estado: 'activo' }
  ],

  // SECCIÓN 4 — Retenciones
  retenciones: [
    { id: 1, retencion_id: '1', nombre_retencion: 'Retención en la Fuente 2.5% (Compras generales)', tipo: 'PORCENTAJE', porcentaje: 2.5, valor_fijo: null, estado: 'activo' },
    { id: 2, retencion_id: '2', nombre_retencion: 'Retención de IVA 15% (ReteIVA)', tipo: 'PORCENTAJE', porcentaje: 15.0, valor_fijo: null, estado: 'activo' }
  ],

  // SECCIÓN 5 — Inventario
  maneja_inventario: true,
  tipo_inventario_id: '1',
  medida_id: '1',
  presentacion: 'Caja individual con maletín y batería',
  stock_minimo: 5,
  stock_maximo: 100,

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
    { id: 1, sku: 'FER-0050-AMA-20V', combinacion: 'Color: Amarillo DeWalt | Voltaje: 20V MAX', codigo_barras: '7709990001', referencia: 'VAR-AMA-20V', precio: 172550, stock: 25, estado: 'activo' },
    { id: 2, sku: 'FER-0050-NEG-20V', combinacion: 'Color: Negro | Voltaje: 20V MAX', codigo_barras: '7709990002', referencia: 'VAR-NEG-20V', precio: 172550, stock: 30, estado: 'activo' }
  ],

  // Metadatos para la IA y buscadores (producto_seo_ia)
  titulo_seo: 'Zapatillas Deportivas Ultra Light Pro | Tienda Oficial',
  slug: '/productos/zapatillas-deportivas-ultra-light-pro',
  descripcion_seo: 'Compra las Zapatillas Deportivas Ultra Light Pro con amortiguación premium. Envíos a todo el país y pago contraentrega.',
  palabras_clave: 'zapatillas, running, calzado deportivo, zapatillas nike, tenis deportivos',
  etiquetas: ['Running', 'Hombre', 'Nueva Colección', 'Tendencia'],
  sinonimos: 'tenis deportivos, zapatillas para correr, calzado runner',
  texto_busqueda: 'Zapatillas Deportivas Ultra Light Pro PRD-1001 running calzado suela antideslizante',
  caracteristicas: '• Amortiguación avanzada de impacto\n• Malla ultra transpirable\n• Suela de alta tracción',
  usos: 'Entrenamiento diario, carreras de 5k a 21k, gimnasio y uso casual.',
  publico_objetivo: 'Atletas, deportistas y personas que buscan comodidad al caminar o ejercitarse.',
  indexable: true,
  contenido_ia: 'Recomienda este calzado cuando los clientes busquen zapatillas cómodas para correr o hacer ejercicio diario.',

  // Imágenes (producto_imagen)
  imagenes: [
    { id: 1, url: '/src/assets/images/products/product-1(1).png', nombre: 'vista_frontal.png', principal: true, orden: 1, tamano: '142 KB' },
    { id: 2, url: '/src/assets/images/products/product-1(2).png', nombre: 'vista_lateral.png', principal: false, orden: 2, tamano: '138 KB' }
  ]
});
