-- ============================================================
-- CHATCONNECT - INSERT / SEED INTEGRAL DE FERRETERÍA
-- Compatible con ChatConnect_SQL_FINAL_TERCERO_SIN_CLIENTE.sql
-- ============================================================
SET LOCAL app.current_empresa_id = '1';

-- 1. EMPRESA
INSERT INTO public.empresa (
    id_empresa, nombre_comercial, razon_social, nit, telefono, whatsapp, email,
    direccion, pais, departamento, ciudad, sector, categoria_producto_obligatoria, estado
) VALUES (
    1,
    'Ferretería y Depósito El Constructor S.A.S.',
    'Ferretería y Depósito El Constructor S.A.S.',
    '900999999-9',
    '+576063000000',
    '+573024610721',
    'contacto@elconstructor.example',
    'Dirección de demostración',
    'Colombia',
    'Risaralda',
    'Pereira',
    'Ferretería y construcción',
    TRUE,
    'activo'
)
ON CONFLICT (id_empresa) DO UPDATE SET
    nombre_comercial = EXCLUDED.nombre_comercial,
    razon_social = EXCLUDED.razon_social,
    nit = EXCLUDED.nit,
    telefono = EXCLUDED.telefono,
    whatsapp = EXCLUDED.whatsapp,
    email = EXCLUDED.email,
    direccion = EXCLUDED.direccion,
    pais = EXCLUDED.pais,
    departamento = EXCLUDED.departamento,
    ciudad = EXCLUDED.ciudad,
    sector = EXCLUDED.sector,
    categoria_producto_obligatoria = EXCLUDED.categoria_producto_obligatoria,
    estado = EXCLUDED.estado,
    updated_at = now();

-- 2. CANAL META / WHATSAPP
INSERT INTO public.canal (
    id_canal, empresa_id, tipo, proveedor, phone_number, phone_number_id,
    waba_id, business_account_id, app_id, estado, configuracion
) VALUES (
    1, 1, 'whatsapp', 'meta', '+573024610721', '1305340429332213',
    NULL, NULL, NULL, 'activo', '{"seed":true}'::jsonb
)
ON CONFLICT (id_canal) DO UPDATE SET
    empresa_id = EXCLUDED.empresa_id,
    tipo = EXCLUDED.tipo,
    proveedor = EXCLUDED.proveedor,
    phone_number = EXCLUDED.phone_number,
    phone_number_id = EXCLUDED.phone_number_id,
    waba_id = COALESCE(public.canal.waba_id, EXCLUDED.waba_id, '2153627058835618'),
    catalog_id = COALESCE(public.canal.catalog_id, '912267985057130'),
    estado = EXCLUDED.estado,
    configuracion = EXCLUDED.configuracion,
    updated_at = now();


-- 2.1 LIMPIEZA PREVIA DE PRODUCTOS, ATRIBUTOS Y CATÁLOGO PARA DEMO (Evita duplicados y conflictos de unicidad)
DELETE FROM public.inventario WHERE empresa_id = 1;
DELETE FROM public.producto WHERE empresa_id = 1;
DELETE FROM public.subcategoria WHERE empresa_id = 1;
DELETE FROM public.categoria WHERE empresa_id = 1;
DELETE FROM public.marca WHERE empresa_id = 1;
DELETE FROM public.atributo WHERE empresa_id = 1;
DELETE FROM public.medida WHERE empresa_id = 1;
DELETE FROM public.tipo_inventario WHERE empresa_id = 1;
DELETE FROM public.lista_precio WHERE empresa_id = 1;
DELETE FROM public.retencion WHERE empresa_id = 1;
DELETE FROM public.impuesto WHERE empresa_id = 1;

-- 3. CATEGORÍAS
INSERT INTO public.categoria (id_categoria, empresa_id, nombre, estado) VALUES
(1, 1, 'Herramientas Eléctricas', 'activo'),
(2, 1, 'Herramientas Manuales', 'activo'),
(3, 1, 'Materiales de Construcción', 'activo'),
(4, 1, 'Plomería y Grifería', 'activo'),
(5, 1, 'Material Eléctrico e Iluminación', 'activo'),
(6, 1, 'Pinturas y Acabados', 'activo'),
(7, 1, 'Tornillería y Fijación', 'activo'),
(8, 1, 'Cerrajería y Seguridad Industrial', 'activo')
ON CONFLICT (id_categoria) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, nombre=EXCLUDED.nombre,
    estado=EXCLUDED.estado, updated_at=now();

-- 4. SUBCATEGORÍAS
INSERT INTO public.subcategoria (id_subcategoria, empresa_id, categoria_id, nombre, estado) VALUES
(1, 1, 1, 'Taladros y Perforación', 'activo'),
(2, 1, 1, 'Corte y Desbaste', 'activo'),
(3, 1, 2, 'Herramientas de Golpe', 'activo'),
(4, 1, 2, 'Herramientas de Mano', 'activo'),
(5, 1, 3, 'Cementos y Agregados', 'activo'),
(6, 1, 3, 'Acero y Refuerzo', 'activo'),
(7, 1, 4, 'Tuberías, Accesorios y Grifería', 'activo'),
(8, 1, 5, 'Cables y Conductores', 'activo'),
(9, 1, 5, 'Protección, Mecanismos e Iluminación', 'activo'),
(10, 1, 6, 'Pinturas', 'activo'),
(11, 1, 6, 'Accesorios, Abrasivos y Sellantes', 'activo'),
(12, 1, 7, 'Fijaciones', 'activo'),
(13, 1, 8, 'Cerrajería', 'activo'),
(14, 1, 8, 'Elementos de Protección Personal', 'activo')
ON CONFLICT (id_subcategoria) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, categoria_id=EXCLUDED.categoria_id,
    nombre=EXCLUDED.nombre, estado=EXCLUDED.estado, updated_at=now();

-- 5. MARCAS
INSERT INTO public.marca (id_marca, empresa_id, nombre, estado) VALUES
(1, 1, 'DeWalt', 'activo'),
(2, 1, 'Stanley', 'activo'),
(3, 1, 'Bosch', 'activo'),
(4, 1, 'Argos', 'activo'),
(5, 1, 'Diaco', 'activo'),
(6, 1, 'Pavco', 'activo'),
(7, 1, 'Centelsa', 'activo'),
(8, 1, 'Legrand', 'activo'),
(9, 1, 'Pintuco', 'activo'),
(10, 1, 'Yale', 'activo'),
(11, 1, '3M', 'activo'),
(12, 1, 'Genérico Ferretero', 'activo')
ON CONFLICT (id_marca) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, nombre=EXCLUDED.nombre,
    estado=EXCLUDED.estado, updated_at=now();

-- 6. IMPUESTOS
INSERT INTO public.impuesto (id_impuesto, empresa_id, codigo, nombre, porcentaje, tipo, valor, cuenta_contable_id, estado) VALUES
(1, 1, 'IVA19', 'IVA General 19%', 19.0000, 'PORCENTAJE', NULL, NULL, 'activo'),
(2, 1, 'IVA5', 'IVA Diferencial 5%', 5.0000, 'PORCENTAJE', NULL, NULL, 'activo'),
(3, 1, 'IVA0', 'Exento / Excluido de IVA', 0.0000, 'PORCENTAJE', NULL, NULL, 'activo')
ON CONFLICT (id_impuesto) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, codigo=EXCLUDED.codigo, nombre=EXCLUDED.nombre,
    porcentaje=EXCLUDED.porcentaje, tipo=EXCLUDED.tipo, valor=EXCLUDED.valor,
    cuenta_contable_id=NULL, estado=EXCLUDED.estado, updated_at=now();

-- 7. TIPOS DE INVENTARIO
INSERT INTO public.tipo_inventario (id_tipo_inventario, empresa_id, nombre, descripcion, estado) VALUES
(1, 1, 'Mercancía para la venta', 'Producto terminado disponible para comercialización', 'activo'),
(2, 1, 'Servicio sin inventario', 'Concepto que no controla existencias', 'activo')
ON CONFLICT (id_tipo_inventario) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, nombre=EXCLUDED.nombre,
    descripcion=EXCLUDED.descripcion, estado=EXCLUDED.estado;

-- 8. MEDIDAS
INSERT INTO public.medida (id_medida, empresa_id, codigo, nombre, estado) VALUES
(1, 1, 'UND', 'Unidad', 'activo'),
(2, 1, 'KG', 'Kilogramo', 'activo'),
(3, 1, 'M', 'Metro', 'activo'),
(4, 1, 'ROL', 'Rollo', 'activo'),
(5, 1, 'CAJ', 'Caja', 'activo'),
(6, 1, 'GAL', 'Galón', 'activo'),
(7, 1, 'PAR', 'Par', 'activo')
ON CONFLICT (id_medida) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, codigo=EXCLUDED.codigo, nombre=EXCLUDED.nombre,
    estado=EXCLUDED.estado;

-- 10. SECUENCIA DE PRODUCTOS
INSERT INTO public.secuencia (
    id_secuencia, empresa_id, modulo, prefijo, consecutivo_actual, longitud, estado
) VALUES (1, 1, 'productos', 'FER-', 48, 4, 'activo')
ON CONFLICT (id_secuencia) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id,
    modulo=EXCLUDED.modulo,
    prefijo=EXCLUDED.prefijo,
    consecutivo_actual=GREATEST(public.secuencia.consecutivo_actual, EXCLUDED.consecutivo_actual),
    longitud=EXCLUDED.longitud,
    estado=EXCLUDED.estado;

-- 11. LISTAS DE PRECIOS
INSERT INTO public.lista_precio (
    id_lista_precio, empresa_id, nombre, estado
) VALUES
(1, 1, 'Precio público', 'activo'),
(2, 1, 'Mayorista', 'activo'),
(3, 1, 'Constructor / Contratista', 'activo')
ON CONFLICT (id_lista_precio) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id,
    nombre=EXCLUDED.nombre,
    estado=EXCLUDED.estado;

-- 12. RETENCIONES
INSERT INTO public.retencion (
    id_retencion, empresa_id, nombre, estado
) VALUES
(1, 1, 'Retefuente compras 2.5%', 'activo'),
(2, 1, 'Retención fija demostración', 'activo')
ON CONFLICT (id_retencion) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id,
    nombre=EXCLUDED.nombre,
    estado=EXCLUDED.estado;

-- 13. TERCEROS PROVEEDORES
INSERT INTO public.tercero (id_tercero, empresa_id, tipo_persona, tipo_tercero, tipo_documento, numero_documento, razon_social, email, telefono, estado) VALUES
(101, 1, 'juridica', 'proveedor', 'NIT', '900100001-1', 'Distribuciones Ferreteras Andinas S.A.S.', 'compras@ferreterasandinas.example', '+576010000001', 'activo'),
(102, 1, 'juridica', 'proveedor', 'NIT', '900100002-2', 'Suministros Industriales del Eje S.A.S.', 'ventas@suministroseje.example', '+576060000002', 'activo'),
(103, 1, 'juridica', 'proveedor', 'NIT', '900100003-3', 'Materiales y Acabados Colombia S.A.S.', 'comercial@materialescol.example', '+576040000003', 'activo'),
(104, 1, 'juridica', 'proveedor', 'NIT', '900100004-4', 'Seguridad y Herramientas Nacional S.A.S.', 'pedidos@seguridadherramientas.example', '+576020000004', 'activo')
ON CONFLICT (id_tercero) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, tipo_persona=EXCLUDED.tipo_persona,
    tipo_tercero=EXCLUDED.tipo_tercero, tipo_documento=EXCLUDED.tipo_documento,
    numero_documento=EXCLUDED.numero_documento, razon_social=EXCLUDED.razon_social,
    email=EXCLUDED.email, telefono=EXCLUDED.telefono, estado=EXCLUDED.estado,
    updated_at=now();

-- 14. ATRIBUTOS
INSERT INTO public.atributo (id_atributo, empresa_id, nombre, codigo, descripcion, permite_multiples, genera_variante, obligatorio, estado) VALUES
(1, 1, 'Voltaje', 'VOLTAJE', 'Voltaje de operación del producto', TRUE, TRUE, TRUE, 'activo'),
(2, 1, 'Configuración de venta', 'CONFIG_VENTA', 'Configuración comercial del producto', TRUE, TRUE, TRUE, 'activo'),
(3, 1, 'Material', 'MATERIAL', 'Material principal o descriptivo', TRUE, FALSE, FALSE, 'activo'),
(4, 1, 'Color', 'COLOR', 'Color comercial del producto', TRUE, FALSE, FALSE, 'activo'),
(5, 1, 'Talla', 'TALLA', 'Talla comercial del producto', TRUE, TRUE, TRUE, 'activo')
ON CONFLICT (id_atributo) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, nombre=EXCLUDED.nombre, codigo=EXCLUDED.codigo,
    descripcion=EXCLUDED.descripcion, permite_multiples=EXCLUDED.permite_multiples,
    genera_variante=EXCLUDED.genera_variante, obligatorio=EXCLUDED.obligatorio,
    estado=EXCLUDED.estado, updated_at=now();

-- 15. COMPONENTES DE ATRIBUTO
INSERT INTO public.atributo_componente (id_atributo_componente, empresa_id, atributo_id, nombre, codigo, valor, descripcion, orden, estado) VALUES
(1, 1, 1, '110V', '110V', '110', 'Voltaje nominal 110V', 1, 'activo'),
(2, 1, 1, '220V', '220V', '220', 'Voltaje nominal 220V', 2, 'activo'),
(3, 1, 2, 'Solo herramienta', 'SOLO', 'solo_herramienta', 'Producto sin kit de accesorios', 1, 'activo'),
(4, 1, 2, 'Kit completo', 'KIT', 'kit_completo', 'Producto con accesorios y maletín', 2, 'activo'),
(5, 1, 3, 'Acero', 'ACERO', 'acero', 'Material de acero', 1, 'activo'),
(6, 1, 3, 'PVC', 'PVC', 'pvc', 'Policloruro de vinilo', 2, 'activo'),
(7, 1, 4, 'Negro', 'NEGRO', 'negro', 'Color negro', 1, 'activo'),
(8, 1, 4, 'Blanco', 'BLANCO', 'blanco', 'Color blanco', 2, 'activo'),
(9, 1, 5, 'M', 'M', 'M', 'Talla M', 1, 'activo'),
(10, 1, 5, 'L', 'L', 'L', 'Talla L', 2, 'activo'),
(11, 1, 5, 'XL', 'XL', 'XL', 'Talla XL', 3, 'activo'),
(12, 1, 5, '39', 'T39', '39', 'Talla 39', 4, 'activo'),
(13, 1, 5, '40', 'T40', '40', 'Talla 40', 5, 'activo'),
(14, 1, 5, '41', 'T41', '41', 'Talla 41', 6, 'activo'),
(15, 1, 5, '42', 'T42', '42', 'Talla 42', 7, 'activo'),
(16, 1, 5, '43', 'T43', '43', 'Talla 43', 8, 'activo')
ON CONFLICT (id_atributo_componente) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id, atributo_id=EXCLUDED.atributo_id,
    nombre=EXCLUDED.nombre, codigo=EXCLUDED.codigo, valor=EXCLUDED.valor,
    descripcion=EXCLUDED.descripcion, orden=EXCLUDED.orden,
    estado=EXCLUDED.estado, updated_at=now();

-- 16. PRODUCTOS (48 PRODUCTOS DE FERRETERÍA)
INSERT INTO public.producto (
    id_producto, empresa_id, categoria_id, subcategoria_id, marca_id, codigo_interno, nombre, descripcion_corta, descripcion_larga, ficha_tecnica, costo_base, costo_impuesto, precio_base, precio_impuesto, utilidad_valor, utilidad_porcentaje, maneja_inventario, tipo_inventario_id, stock_minimo, stock_maximo, medida_id, presentacion, estado_producto, estado_publicacion
) VALUES
(1, 1, 1, 1, 1, 'FER-0001', 'Taladro Percutor 1/2 Pulgada 650W', 'Velocidad variable y reversa para perforación en concreto y acero', 'Taladro percutor profesional de 650W con mandril de 1/2 pulgada, velocidad variable y función de reversa.', 'Potencia: 650W; Mandril: 1/2 pulgada; Velocidad variable; Reversa; Uso: concreto, acero y madera.', 220000, 261800, 239495.8, 285000, 19495.80, 8.8617, TRUE, 1, 2, 50, 1, 'Unidad', 'activo', 'publicado'),
(2, 1, 1, 2, 1, 'FER-0002', 'Esmeriladora Angular 4-1/2 Pulgadas 820W', 'Amoladora para corte y desbaste de metales y mampostería', 'Esmeriladora angular de 820W para corte y desbaste profesional.', 'Potencia: 820W; Disco: 4-1/2 pulgadas; Aplicación: corte y desbaste.', 165000, 196350, 180672.27, 215000, 15672.27, 9.4983, TRUE, 1, 2, 40, 1, 'Unidad', 'activo', 'publicado'),
(3, 1, 1, 2, 3, 'FER-0003', 'Sierra Circular 7-1/4 Pulgadas 1400W', 'Corte longitudinal y biselado en madera con guía ajustable', 'Sierra circular Bosch de 1400W para corte longitudinal y biselado en madera.', 'Potencia: 1400W; Disco: 7-1/4 pulgadas; Guía ajustable; Corte biselado.', 350000, 416500, 390756.3, 465000, 40756.30, 11.6447, TRUE, 1, 1, 30, 1, 'Unidad', 'activo', 'publicado'),
(4, 1, 2, 3, 2, 'FER-0004', 'Martillo de Uña Curva 16 oz Mango Fibra', 'Cabeza forjada con empuñadura antivibración', 'Martillo Stanley de uña curva de 16 onzas con mango de fibra.', 'Peso: 16 oz; Mango: fibra; Cabeza forjada; Uña curva.', 29000, 34510, 31932.77, 38000, 2932.77, 10.1130, TRUE, 1, 3, 100, 1, 'Unidad', 'activo', 'publicado'),
(5, 1, 2, 4, 2, 'FER-0005', 'Juego de Destornilladores Pro 6 Piezas', 'Puntas planas y Phillips de cromo vanadio magnetizadas', 'Juego profesional Stanley de seis destornilladores con puntas planas y Phillips.', 'Cantidad: 6 piezas; Material: cromo vanadio; Puntas magnetizadas.', 34000, 40460, 37815.13, 45000, 3815.13, 11.2210, TRUE, 1, 5, 50, 1, 'Unidad', 'activo', 'publicado'),
(6, 1, 2, 4, 2, 'FER-0006', 'Alicate Universal 8 Pulgadas Alta Palanca', 'Mandíbulas maquinadas para sujeción y corte de alambre duro', 'Alicate universal Stanley de 8 pulgadas para sujeción y corte.', 'Longitud: 8 pulgadas; Alta palanca; Mandíbulas maquinadas.', 27000, 32130, 30252.1, 36000, 3252.10, 12.0448, TRUE, 1, 3, 60, 1, 'Unidad', 'activo', 'publicado'),
(7, 1, 2, 4, 2, 'FER-0007', 'Flexómetro Cinta Métrica 8m / 26ft', 'Cinta reforzada recubierta de polímero con freno deslizante', 'Flexómetro Stanley de 8 metros con cinta reforzada y freno deslizante.', 'Longitud: 8m / 26ft; Cinta reforzada; Freno deslizante.', 21000, 24990, 23529.41, 28000, 2529.41, 12.0448, TRUE, 1, 5, 100, 1, 'Unidad', 'activo', 'publicado'),
(8, 1, 2, 4, 12, 'FER-0008', 'Pala Redonda Cuello Soldado Cabo Madera', 'Hoja tratada térmicamente para trabajo pesado en excavación', 'Pala redonda de trabajo pesado con cabo de madera.', 'Hoja tratada térmicamente; Cabo: madera; Aplicación: excavación.', 31000, 36890, 35294.12, 42000, 4294.12, 13.8520, TRUE, 1, 3, 80, 1, 'Unidad', 'activo', 'publicado'),
(9, 1, 3, 5, 4, 'FER-0009', 'Cemento Gris Uso General 50kg', 'Saco de cemento Portland estructural para mezclas de concreto', 'Cemento gris de uso general en presentación de 50 kg para mezclas de concreto.', 'Peso: 50kg; Tipo: cemento Portland; Presentación: saco.', 27000, 32130, 28991.6, 34500, 1991.60, 7.3763, TRUE, 1, 20, 500, 2, 'Saco 50kg', 'activo', 'publicado'),
(10, 1, 3, 6, 5, 'FER-0010', 'Varilla Corrugada 1/2 Pulgada x 6m W60', 'Acero corrugado estructural para vigas y columnas', 'Varilla corrugada Diaco de 1/2 pulgada por 6 metros.', 'Diámetro: 1/2 pulgada; Longitud: 6m; Grado: W60.', 30000, 35700, 31932.77, 38000, 1932.77, 6.4426, TRUE, 1, 20, 300, 3, 'Unidad', 'activo', 'publicado'),
(11, 1, 3, 6, 5, 'FER-0011', 'Varilla Corrugada 3/8 Pulgada x 6m W60', 'Acero de refuerzo para losas y zapatas', 'Varilla corrugada Diaco de 3/8 de pulgada por 6 metros.', 'Diámetro: 3/8 pulgada; Longitud: 6m; Grado: W60.', 19000, 22610, 20168.07, 24000, 1168.07, 6.1477, TRUE, 1, 20, 400, 3, 'Unidad', 'activo', 'publicado'),
(12, 1, 3, 6, 5, 'FER-0012', 'Alambre Negro Recocido Calibre 18 (Kilo)', 'Alambre flexible para amarre de armaduras de hierro', 'Alambre negro recocido calibre 18 para amarre de estructuras.', 'Calibre: 18; Presentación: kilo; Tipo: recocido.', 5800, 6902, 6302.52, 7500, 502.52, 8.6641, TRUE, 1, 20, 200, 2, 'Unidad', 'activo', 'publicado'),
(13, 1, 4, 7, 6, 'FER-0013', 'Tubo PVC Sanitario 3 Pulgadas x 6m', 'Tubo rígido para desagües y alcantarillado doméstico', 'Tubería sanitaria Pavco de PVC de 3 pulgadas por 6 metros.', 'Diámetro: 3 pulgadas; Longitud: 6m; Material: PVC sanitario.', 49000, 58310, 52184.87, 62000, 3184.87, 6.4997, TRUE, 1, 10, 100, 3, 'Unidad', 'activo', 'publicado'),
(14, 1, 4, 7, 6, 'FER-0014', 'Tubo PVC Presión RDE 21 1/2 Pulgada x 6m', 'Tubería para distribución de agua potable domiciliaria', 'Tubería Pavco PVC presión RDE 21 de 1/2 pulgada por 6 metros.', 'Diámetro: 1/2 pulgada; Longitud: 6m; RDE: 21; Material: PVC.', 15000, 17850, 16302.52, 19500, 1302.52, 8.6835, TRUE, 1, 10, 150, 3, 'Unidad', 'activo', 'publicado'),
(15, 1, 4, 7, 6, 'FER-0015', 'Soldadura Líquida PVC Transparente 1/4 Galón', 'Adhesivo de secado rápido y alta resistencia a presión hidráulica', 'Soldadura líquida Pavco transparente para uniones de tubería PVC.', 'Presentación: 1/4 galón; Color: transparente; Uso: PVC.', 37000, 44030, 40101.0, 48000, 3101.00, 8.3811, TRUE, 1, 5, 60, 6, 'Unidad', 'activo', 'publicado'),
(16, 1, 4, 7, 12, 'FER-0016', 'Cinta Teflón 1/2 Pulgada x 10m', 'Sellador para roscas de plomería contra fugas de agua', 'Cinta de PTFE para sellado de conexiones roscadas.', 'Ancho: 1/2 pulgada; Longitud: 10m; Material: PTFE.', 1900, 2261, 2100.84, 2500, 200.84, 10.5705, TRUE, 1, 20, 500, 3, 'Unidad', 'activo', 'publicado'),
(17, 1, 5, 8, 7, 'FER-0017', 'Cable de Cobre THHN Calibre 12 AWG (Rollo 100m)', 'Cable monopolar aislado resistente al calor y humedad', 'Cable Centelsa de cobre THHN calibre 12 AWG en rollo de 100 metros.', 'Calibre: 12 AWG; Tipo: THHN; Material: cobre; Longitud: 100m.', 220000, 261800, 235294.12, 280000, 15294.12, 6.9519, TRUE, 1, 2, 30, 4, 'Rollo 100m', 'activo', 'publicado'),
(18, 1, 5, 9, 8, 'FER-0018', 'Breaker Enchufable Monopolar 20A', 'Interruptor termomagnético de protección contra sobrecargas', 'Breaker Legrand monopolar de 20 amperios para protección eléctrica.', 'Tipo: monopolar; Corriente: 20A; Protección termomagnética.', 17000, 20230, 18487.39, 22000, 1487.39, 8.7494, TRUE, 1, 5, 100, 1, 'Unidad', 'activo', 'publicado'),
(19, 1, 5, 9, 8, 'FER-0019', 'Tomacorriente Doble con Polo a Tierra 15A', 'Módulo de conexión eléctrica blanco con placa incluida', 'Tomacorriente doble Legrand de 15A con polo a tierra.', 'Corriente: 15A; Tipo: doble; Polo a tierra; Color: blanco.', 8500, 10115, 9243.7, 11000, 743.70, 8.7494, TRUE, 1, 10, 150, 1, 'Unidad', 'activo', 'publicado'),
(20, 1, 5, 9, 11, 'FER-0020', 'Cinta Aislante Negra Vinilo 20m', 'Aislante dieléctrico retardante a la llama hasta 600V', 'Cinta aislante 3M de vinilo negro para instalaciones eléctricas.', 'Longitud: 20m; Material: vinilo; Tensión: hasta 600V.', 3500, 4165, 3781.51, 4500, 281.51, 8.0431, TRUE, 1, 20, 300, 3, 'Unidad', 'activo', 'publicado'),
(21, 1, 5, 9, 12, 'FER-0021', 'Bombillo LED Luz Blanca 12W E27', 'Lámpara de bajo consumo equivalente a incandescente de 100W', 'Bombillo LED de 12W con base E27 y luz blanca.', 'Potencia: 12W; Base: E27; Luz: blanca; Tecnología: LED.', 6500, 7735, 7142.86, 8500, 642.86, 9.8902, TRUE, 1, 20, 300, 1, 'Unidad', 'activo', 'publicado'),
(22, 1, 6, 10, 9, 'FER-0022', 'Pintura Vinilo Tipo 1 Blanco Cuñete 5 Galones', 'Pintura lavable antibacterial de alto rendimiento para interiores', 'Pintura Pintuco tipo 1 color blanco en cuñete de 5 galones.', 'Tipo: 1; Color: blanco; Presentación: cuñete 5 galones; Uso: interiores.', 175000, 208250, 184873.95, 220000, 9873.95, 5.6423, TRUE, 1, 2, 30, 6, 'Cuñete 5 galones', 'activo', 'publicado'),
(23, 1, 6, 10, 9, 'FER-0023', 'Esmalte Sintético Anticorrosivo Negro Galón', 'Protección contra óxido para puertas, ventanas y estructuras metálicas', 'Esmalte sintético Pintuco negro con protección anticorrosiva.', 'Tipo: esmalte sintético; Color: negro; Presentación: galón; Anticorrosivo.', 54000, 64260, 57142.86, 68000, 3142.86, 5.8201, TRUE, 1, 3, 50, 6, 'Galón', 'activo', 'publicado'),
(24, 1, 6, 11, 12, 'FER-0024', 'Rodillo Antigoteo Felpa 9 Pulgadas con Manija', 'Rodillo para aplicación homogénea en paredes lisas y techos', 'Rodillo antigoteo de felpa de 9 pulgadas con manija.', 'Ancho: 9 pulgadas; Material: felpa; Incluye manija.', 14000, 16660, 15126.05, 18000, 1126.05, 8.0432, TRUE, 1, 5, 80, 1, 'Unidad', 'activo', 'publicado'),
(25, 1, 6, 11, 12, 'FER-0025', 'Brocha de Cerdas Naturales 3 Pulgadas', 'Brocha plana para cortes y detalles en madera o muro', 'Brocha plana con cerdas naturales de 3 pulgadas.', 'Ancho: 3 pulgadas; Cerdas: naturales; Tipo: plana.', 9500, 11305, 10504.2, 12500, 1004.20, 10.5705, TRUE, 1, 5, 100, 1, 'Unidad', 'activo', 'publicado'),
(26, 1, 7, 12, 12, 'FER-0026', 'Chazo Plástico con Tornillo Goloso 1/4 Pulgada (Caja x 100)', 'Sistema de fijación estándar para muros de mampostería', 'Caja con 100 chazos plásticos y tornillos golosos de 1/4 pulgada.', 'Diámetro: 1/4 pulgada; Cantidad: 100 unidades; Incluye tornillos.', 11500, 13685, 12605.04, 15000, 1105.04, 9.6090, TRUE, 1, 5, 100, 5, 'Caja x 100', 'activo', 'publicado'),
(27, 1, 7, 12, 12, 'FER-0027', 'Tornillo Drywall Punta Aguda 6x1 Pulgada (Caja x 1000)', 'Tornillos fosfatados para fijación de placas de yeso', 'Caja de 1000 tornillos Drywall fosfatados de 6x1 pulgada.', 'Medida: 6x1 pulgada; Cantidad: 1000 unidades; Acabado: fosfatado.', 30000, 35700, 31932.77, 38000, 1932.77, 6.4426, TRUE, 1, 5, 100, 5, 'Caja x 1000', 'activo', 'publicado'),
(28, 1, 7, 12, 3, 'FER-0028', 'Juego de Brocas Mixtas para Muro y Metal 10 Piezas', 'Brocas de acero rápido HSS y tungsteno para mampostería', 'Juego Bosch de 10 brocas mixtas para metal y mampostería.', 'Cantidad: 10 piezas; Material: HSS y tungsteno; Aplicación: muro y metal.', 41000, 48790, 43697.48, 52000, 2697.48, 6.5792, TRUE, 1, 3, 50, 1, 'Unidad', 'activo', 'publicado'),
(29, 1, 8, 13, 10, 'FER-0029', 'Cerradura de Sobreponer Derecha Cilindro Suelto', 'Cerradura metálica de seguridad para puertas principales exteriores', 'Cerradura Yale de sobreponer derecha con cilindro suelto.', 'Tipo: sobreponer; Orientación: derecha; Uso: puertas exteriores.', 75000, 89250, 79831.93, 95000, 4831.93, 6.4426, TRUE, 1, 2, 30, 1, 'Unidad', 'activo', 'publicado'),
(30, 1, 8, 13, 10, 'FER-0030', 'Candado de Latón Macizo 50mm con 3 Llaves', 'Cuerpo macizo con gancho de acero templado resistente a cizalla', 'Candado Yale de latón macizo de 50mm con tres llaves.', 'Material: latón; Tamaño: 50mm; Incluye: 3 llaves.', 33000, 39270, 35294.12, 42000, 2294.12, 6.9519, TRUE, 1, 3, 50, 1, 'Unidad', 'activo', 'publicado'),
(31, 1, 8, 14, 12, 'FER-0031', 'Guantes de Vaqueta Tipo Ingeniero Par', 'Guantes de cuero de alta protección para manejo de materiales pesados', 'Guantes de vaqueta tipo ingeniero para protección de manos.', 'Material: vaqueta; Presentación: par; Uso: manejo de materiales.', 10500, 12495, 11764.71, 14000, 1264.71, 12.0449, TRUE, 1, 10, 200, 7, 'Par', 'activo', 'publicado'),
(32, 1, 8, 14, 11, 'FER-0032', 'Gafas de Seguridad Transparentes Anti-empañante', 'Protección ocular con filtro UV y resistencia a esquirlas', 'Gafas de seguridad transparentes con tratamiento anti-empañante.', 'Lente transparente; Protección UV; Anti-empañante; Resistencia a esquirlas.', 7000, 8330, 7983.19, 9500, 983.19, 14.0456, TRUE, 1, 10, 200, 1, 'Unidad', 'activo', 'publicado'),
(33, 1, 1, 2, 3, 'FER-0033', 'Disco de Corte para Metal 4-1/2 x 1 mm', 'Disco abrasivo delgado para cortes rápidos en acero y perfiles.', 'Disco de corte para esmeriladora angular, diseñado para metal y acero al carbono.', 'Diámetro: 4-1/2 pulgadas; Espesor: 1 mm; Uso: corte de metal.', 5000, 5950.00, 7563.03, 9000, 2563.03, 51.2606, TRUE, 1, 10, 300, 1, 'Unidad', 'activo', 'publicado'),
(34, 1, 1, 2, 3, 'FER-0034', 'Disco Diamantado Segmentado 4-1/2 Pulgadas', 'Disco diamantado para corte de concreto, ladrillo y mampostería.', 'Disco segmentado para esmeriladora, apropiado para trabajo en materiales de construcción.', 'Diámetro: 4-1/2 pulgadas; Tipo: segmentado; Uso: concreto y mampostería.', 18000, 21420.00, 26890.76, 32000, 8890.76, 49.3931, TRUE, 1, 5, 100, 1, 'Unidad', 'activo', 'publicado'),
(35, 1, 6, 11, 11, 'FER-0035', 'Lija de Agua Grano 220', 'Hoja abrasiva para preparación y acabado fino de superficies.', 'Lija resistente al agua para lijado manual de pintura, metal y madera.', 'Grano: 220; Tipo: lija al agua; Uso: acabado.', 1200, 1428.00, 2100.84, 2500, 900.84, 75.0700, TRUE, 1, 30, 500, 1, 'Unidad', 'activo', 'publicado'),
(36, 1, 6, 11, 12, 'FER-0036', 'Silicona Neutra Transparente 280 ml', 'Sellador flexible para vidrio, aluminio, cerámica y juntas.', 'Silicona neutra transparente para sellado interior y exterior.', 'Contenido: 280 ml; Color: transparente; Tipo: neutra.', 12000, 14280.00, 18487.39, 22000, 6487.39, 54.0616, TRUE, 1, 10, 150, 1, 'Unidad', 'activo', 'publicado'),
(37, 1, 6, 11, 12, 'FER-0037', 'Adhesivo Epóxico Dos Componentes 50 ml', 'Adhesivo de alta resistencia para metal, madera, cerámica y concreto.', 'Sistema epóxico bicomponente para reparaciones y pegado estructural.', 'Contenido: 50 ml; Componentes: resina + endurecedor; Curado: alta resistencia.', 16000, 19040.00, 25210.08, 30000, 9210.08, 57.5630, TRUE, 1, 8, 120, 1, 'Unidad', 'activo', 'publicado'),
(38, 1, 2, 4, 2, 'FER-0038', 'Llave Ajustable 10 Pulgadas', 'Llave cromada de apertura graduable para tuercas y conexiones.', 'Llave ajustable de 10 pulgadas para mantenimiento general y plomería.', 'Longitud: 10 pulgadas; Material: acero cromado; Mordaza regulable.', 25000, 29750.00, 37815.13, 45000, 12815.13, 51.2605, TRUE, 1, 5, 80, 1, 'Unidad', 'activo', 'publicado'),
(39, 1, 2, 4, 2, 'FER-0039', 'Juego de Llaves Combinadas 8 Piezas', 'Juego métrico de llaves boca fija y estrella.', 'Set de ocho llaves combinadas para mantenimiento automotriz y ferretero.', 'Cantidad: 8 piezas; Sistema: métrico; Material: acero cromo vanadio.', 60000, 71400.00, 92436.97, 110000, 32436.97, 54.0616, TRUE, 1, 3, 50, 1, 'Unidad', 'activo', 'publicado'),
(40, 1, 2, 4, 2, 'FER-0040', 'Arco de Sierra para Metal 12 Pulgadas', 'Arco metálico con tensión ajustable para segueta de 12 pulgadas.', 'Arco de sierra manual para corte de tubos, perfiles y varillas metálicas.', 'Longitud hoja: 12 pulgadas; Tensión ajustable; Mango ergonómico.', 18000, 21420.00, 29411.76, 35000, 11411.76, 63.3987, TRUE, 1, 5, 80, 1, 'Unidad', 'activo', 'publicado'),
(41, 1, 4, 7, 6, 'FER-0041', 'Codo PVC Presión 1/2 Pulgada 90 Grados', 'Accesorio para cambios de dirección en redes hidráulicas.', 'Codo PVC presión de 90 grados para instalaciones de agua potable.', 'Diámetro: 1/2 pulgada; Ángulo: 90°; Material: PVC presión.', 2500, 2975.00, 4201.68, 5000, 1701.68, 68.0672, TRUE, 1, 20, 300, 1, 'Unidad', 'activo', 'publicado'),
(42, 1, 4, 7, 12, 'FER-0042', 'Llave Terminal Cromada 1/2 Pulgada', 'Grifería de cierre para lavamanos, sanitarios y puntos hidráulicos.', 'Llave terminal cromada de 1/2 pulgada para conexión domiciliaria.', 'Conexión: 1/2 pulgada; Acabado: cromado; Uso: hidráulico.', 22000, 26180.00, 37815.13, 45000, 15815.13, 71.8870, TRUE, 1, 5, 80, 1, 'Unidad', 'activo', 'publicado'),
(43, 1, 5, 9, 8, 'FER-0043', 'Interruptor Sencillo 10A Blanco', 'Interruptor residencial para control de iluminación.', 'Mecanismo sencillo de 10 amperios para instalaciones eléctricas residenciales.', 'Corriente: 10A; Tipo: sencillo; Color: blanco.', 7000, 8330.00, 11764.71, 14000, 4764.71, 68.0673, TRUE, 1, 10, 200, 1, 'Unidad', 'activo', 'publicado'),
(44, 1, 5, 9, 12, 'FER-0044', 'Extensión Eléctrica 10 m 15A', 'Extensión con clavija y toma aterrizada para uso doméstico y obra.', 'Extensión eléctrica flexible de 10 metros para herramientas y equipos.', 'Longitud: 10 m; Corriente: 15A; Con puesta a tierra.', 22000, 26180.00, 37815.13, 45000, 15815.13, 71.8870, TRUE, 1, 5, 80, 1, 'Unidad', 'activo', 'publicado'),
(45, 1, 5, 9, 8, 'FER-0045', 'Tomacorriente Industrial 2P+T 20A', 'Toma robusta para equipos eléctricos de mayor demanda.', 'Tomacorriente industrial con polo a tierra para talleres y obra.', 'Configuración: 2P+T; Corriente: 20A; Uso: industrial.', 30000, 35700.00, 50420.17, 60000, 20420.17, 68.0672, TRUE, 1, 5, 60, 1, 'Unidad', 'activo', 'publicado'),
(46, 1, 8, 14, 11, 'FER-0046', 'Casco de Seguridad Tipo I Clase E', 'Protección de cabeza para obra e instalaciones eléctricas.', 'Casco de seguridad industrial con suspensión ajustable y protección dieléctrica.', 'Tipo: I; Clase: E; Suspensión: ajustable; Uso: construcción e industria.', 18000, 21420.00, 29411.76, 35000, 11411.76, 63.3987, TRUE, 1, 10, 150, 1, 'Unidad', 'activo', 'publicado'),
(47, 1, 8, 14, 11, 'FER-0047', 'Respirador Reutilizable Media Cara', 'Respirador para trabajos con polvo, pintura y vapores según filtro instalado.', 'Media máscara reutilizable para protección respiratoria en ambientes de trabajo.', 'Tipo: media cara; Reutilizable; Filtros reemplazables.', 65000, 77350.00, 100840.34, 120000, 35840.34, 55.1390, TRUE, 1, 3, 50, 1, 'Unidad', 'activo', 'publicado'),
(48, 1, 8, 14, 12, 'FER-0048', 'Bota de Seguridad Punta de Acero', 'Bota industrial con puntera de acero y suela antideslizante.', 'Calzado de seguridad para construcción, bodega y trabajo industrial.', 'Puntera: acero; Suela: antideslizante; Material: cuero sintético.', 70000, 83300.00, 121848.74, 145000, 51848.74, 74.0696, TRUE, 1, 5, 100, 7, 'Par', 'activo', 'publicado')
ON CONFLICT (id_producto) DO UPDATE SET
    empresa_id=EXCLUDED.empresa_id,
    categoria_id=EXCLUDED.categoria_id,
    subcategoria_id=EXCLUDED.subcategoria_id,
    marca_id=EXCLUDED.marca_id,
    codigo_interno=EXCLUDED.codigo_interno,
    nombre=EXCLUDED.nombre,
    descripcion_corta=EXCLUDED.descripcion_corta,
    descripcion_larga=EXCLUDED.descripcion_larga,
    ficha_tecnica=EXCLUDED.ficha_tecnica,
    costo_base=EXCLUDED.costo_base,
    costo_impuesto=EXCLUDED.costo_impuesto,
    precio_base=EXCLUDED.precio_base,
    precio_impuesto=EXCLUDED.precio_impuesto,
    utilidad_valor=EXCLUDED.utilidad_valor,
    utilidad_porcentaje=EXCLUDED.utilidad_porcentaje,
    maneja_inventario=EXCLUDED.maneja_inventario,
    tipo_inventario_id=EXCLUDED.tipo_inventario_id,
    stock_minimo=EXCLUDED.stock_minimo,
    stock_maximo=EXCLUDED.stock_maximo,
    medida_id=EXCLUDED.medida_id,
    presentacion=EXCLUDED.presentacion,
    estado_producto=EXCLUDED.estado_producto,
    estado_publicacion=EXCLUDED.estado_publicacion,
    updated_at=now();

-- 17. IMPUESTOS DE COMPRA
INSERT INTO public.producto_impuesto_compra (producto_id, impuesto_id, valor_impuesto, estado)
SELECT p.id_producto, 1, ROUND(GREATEST(p.costo_impuesto - p.costo_base, 0), 2), 'activo'
FROM public.producto p WHERE p.empresa_id=1 AND p.id_producto BETWEEN 1 AND 48
ON CONFLICT (producto_id, impuesto_id) DO UPDATE SET valor_impuesto=EXCLUDED.valor_impuesto, estado=EXCLUDED.estado;

-- 18. IMPUESTOS DE VENTA
INSERT INTO public.producto_impuesto_venta (producto_id, impuesto_id, valor_impuesto, estado)
SELECT p.id_producto, 1, ROUND(GREATEST(p.precio_impuesto - p.precio_base, 0), 2), 'activo'
FROM public.producto p WHERE p.empresa_id=1 AND p.id_producto BETWEEN 1 AND 48
ON CONFLICT (producto_id, impuesto_id) DO UPDATE SET valor_impuesto=EXCLUDED.valor_impuesto, estado=EXCLUDED.estado;

-- 19. PRODUCTO <-> LISTAS DE PRECIOS
WITH calculo AS (
    SELECT p.id_producto AS producto_id, lp.id_lista_precio AS lista_precio_id,
        CASE lp.id_lista_precio WHEN 1 THEN p.precio_base WHEN 2 THEN ROUND(GREATEST(p.precio_base * 0.97, p.costo_base * 1.03), 2) ELSE ROUND(GREATEST(p.precio_base * 0.94, p.costo_base * 1.01), 2) END AS precio_base_lista
    FROM public.producto p CROSS JOIN public.lista_precio lp
    WHERE p.empresa_id=1 AND p.id_producto BETWEEN 1 AND 48 AND lp.empresa_id=1 AND lp.id_lista_precio BETWEEN 1 AND 3
)
INSERT INTO public.producto_lista_precio (producto_id, lista_precio_id, precio_base, utilidad_valor, utilidad_porcentaje, precio_venta, estado)
SELECT c.producto_id, c.lista_precio_id, c.precio_base_lista,
    ROUND(c.precio_base_lista - p.costo_base, 2),
    CASE WHEN p.costo_base=0 THEN 0 ELSE ROUND(((c.precio_base_lista - p.costo_base) / p.costo_base) * 100, 4) END,
    ROUND(c.precio_base_lista * 1.19, 2), 'activo'
FROM calculo c JOIN public.producto p ON p.id_producto=c.producto_id
ON CONFLICT (producto_id, lista_precio_id) DO UPDATE SET precio_base=EXCLUDED.precio_base, utilidad_valor=EXCLUDED.utilidad_valor, utilidad_porcentaje=EXCLUDED.utilidad_porcentaje, precio_venta=EXCLUDED.precio_venta, estado=EXCLUDED.estado, updated_at=now();

-- 20. PRECIOS OPERATIVOS
WITH calculo AS (
    SELECT p.id_producto AS producto_id, lp.id_lista_precio AS lista_precio_id,
        CASE lp.id_lista_precio WHEN 1 THEN p.precio_impuesto WHEN 2 THEN ROUND(GREATEST(p.precio_base * 0.97, p.costo_base * 1.03) * 1.19, 2) ELSE ROUND(GREATEST(p.precio_base * 0.94, p.costo_base * 1.01) * 1.19, 2) END AS precio,
        CASE lp.id_lista_precio WHEN 1 THEN 1 WHEN 2 THEN 10 ELSE 50 END AS cantidad_minima,
        CASE lp.id_lista_precio WHEN 1 THEN 9 WHEN 2 THEN 49 ELSE NULL END AS cantidad_maxima
    FROM public.producto p CROSS JOIN public.lista_precio lp
    WHERE p.empresa_id=1 AND p.id_producto BETWEEN 1 AND 48 AND lp.empresa_id=1 AND lp.id_lista_precio BETWEEN 1 AND 3
)
INSERT INTO public.precio (id_precio, empresa_id, producto_id, lista_precio_id, precio, cantidad_minima, cantidad_maxima, moneda, fecha_inicio, fecha_fin, activo)
SELECT ((producto_id - 1) * 3 + lista_precio_id), 1, producto_id, lista_precio_id, precio, cantidad_minima, cantidad_maxima, 'COP', now(), NULL, TRUE FROM calculo
ON CONFLICT (id_precio) DO UPDATE SET empresa_id=EXCLUDED.empresa_id, producto_id=EXCLUDED.producto_id, lista_precio_id=EXCLUDED.lista_precio_id, precio=EXCLUDED.precio, cantidad_minima=EXCLUDED.cantidad_minima, cantidad_maxima=EXCLUDED.cantidad_maxima, moneda=EXCLUDED.moneda, fecha_inicio=EXCLUDED.fecha_inicio, activo=EXCLUDED.activo, updated_at=now();

-- 21. RETENCIONES
INSERT INTO public.producto_retencion (producto_id, retencion_id, tipo, porcentaje, valor_fijo, cuenta_contable_id, estado) VALUES
(1,1,'PORCENTAJE',2.5000,NULL,NULL,'activo'), (3,1,'PORCENTAJE',2.5000,NULL,NULL,'activo'),
(9,1,'PORCENTAJE',2.5000,NULL,NULL,'activo'), (17,1,'PORCENTAJE',2.5000,NULL,NULL,'activo'),
(22,1,'PORCENTAJE',2.5000,NULL,NULL,'activo'), (48,1,'PORCENTAJE',2.5000,NULL,NULL,'activo')
ON CONFLICT (producto_id, retencion_id) DO UPDATE SET tipo=EXCLUDED.tipo, porcentaje=EXCLUDED.porcentaje, valor_fijo=EXCLUDED.valor_fijo, cuenta_contable_id=NULL, estado=EXCLUDED.estado;

-- 22. INVENTARIO BASE (productos sin variante)
WITH datos(empresa_id, producto_id, producto_variante_id, bodega_id, existencia, reservado) AS (VALUES
(1,2,NULL::BIGINT,NULL::BIGINT,8,0),(1,3,NULL::BIGINT,NULL::BIGINT,5,0),(1,4,NULL::BIGINT,NULL::BIGINT,30,0),
(1,5,NULL::BIGINT,NULL::BIGINT,45,0),(1,6,NULL::BIGINT,NULL::BIGINT,25,0),(1,7,NULL::BIGINT,NULL::BIGINT,60,0),
(1,8,NULL::BIGINT,NULL::BIGINT,20,0),(1,9,NULL::BIGINT,NULL::BIGINT,350,0),(1,10,NULL::BIGINT,NULL::BIGINT,180,0),
(1,11,NULL::BIGINT,NULL::BIGINT,220,0),(1,12,NULL::BIGINT,NULL::BIGINT,85,0),(1,13,NULL::BIGINT,NULL::BIGINT,50,0),
(1,14,NULL::BIGINT,NULL::BIGINT,90,0),(1,15,NULL::BIGINT,NULL::BIGINT,30,0),(1,16,NULL::BIGINT,NULL::BIGINT,200,0),
(1,17,NULL::BIGINT,NULL::BIGINT,15,0),(1,18,NULL::BIGINT,NULL::BIGINT,40,0),(1,19,NULL::BIGINT,NULL::BIGINT,80,0),
(1,20,NULL::BIGINT,NULL::BIGINT,120,0),(1,21,NULL::BIGINT,NULL::BIGINT,150,0),(1,22,NULL::BIGINT,NULL::BIGINT,25,0),
(1,23,NULL::BIGINT,NULL::BIGINT,18,0),(1,24,NULL::BIGINT,NULL::BIGINT,40,0),(1,25,NULL::BIGINT,NULL::BIGINT,60,0),
(1,26,NULL::BIGINT,NULL::BIGINT,35,0),(1,27,NULL::BIGINT,NULL::BIGINT,20,0),(1,28,NULL::BIGINT,NULL::BIGINT,15,0),
(1,29,NULL::BIGINT,NULL::BIGINT,10,0),(1,30,NULL::BIGINT,NULL::BIGINT,28,0),(1,32,NULL::BIGINT,NULL::BIGINT,85,0),
(1,33,NULL::BIGINT,NULL::BIGINT,100,0),(1,34,NULL::BIGINT,NULL::BIGINT,40,0),(1,35,NULL::BIGINT,NULL::BIGINT,300,0),
(1,36,NULL::BIGINT,NULL::BIGINT,80,0),(1,37,NULL::BIGINT,NULL::BIGINT,60,0),(1,38,NULL::BIGINT,NULL::BIGINT,35,0),
(1,39,NULL::BIGINT,NULL::BIGINT,20,0),(1,40,NULL::BIGINT,NULL::BIGINT,30,0),(1,41,NULL::BIGINT,NULL::BIGINT,120,0),
(1,42,NULL::BIGINT,NULL::BIGINT,40,0),(1,43,NULL::BIGINT,NULL::BIGINT,100,0),(1,44,NULL::BIGINT,NULL::BIGINT,30,0),
(1,45,NULL::BIGINT,NULL::BIGINT,25,0),(1,46,NULL::BIGINT,NULL::BIGINT,50,0),(1,47,NULL::BIGINT,NULL::BIGINT,20,0)
)
INSERT INTO public.inventario (empresa_id, producto_id, producto_variante_id, bodega_id, existencia, reservado)
SELECT d.* FROM datos d WHERE NOT EXISTS (
    SELECT 1 FROM public.inventario i WHERE i.empresa_id=d.empresa_id AND i.producto_id=d.producto_id
    AND i.producto_variante_id IS NOT DISTINCT FROM d.producto_variante_id AND i.bodega_id IS NOT DISTINCT FROM d.bodega_id
);
UPDATE public.inventario i SET existencia=d.existencia, reservado=d.reservado, updated_at=now()
FROM (VALUES
(1,2,NULL::BIGINT,NULL::BIGINT,8,0),(1,3,NULL::BIGINT,NULL::BIGINT,5,0),(1,4,NULL::BIGINT,NULL::BIGINT,30,0),
(1,5,NULL::BIGINT,NULL::BIGINT,45,0),(1,6,NULL::BIGINT,NULL::BIGINT,25,0),(1,7,NULL::BIGINT,NULL::BIGINT,60,0),
(1,8,NULL::BIGINT,NULL::BIGINT,20,0),(1,9,NULL::BIGINT,NULL::BIGINT,350,0),(1,10,NULL::BIGINT,NULL::BIGINT,180,0),
(1,11,NULL::BIGINT,NULL::BIGINT,220,0),(1,12,NULL::BIGINT,NULL::BIGINT,85,0),(1,13,NULL::BIGINT,NULL::BIGINT,50,0),
(1,14,NULL::BIGINT,NULL::BIGINT,90,0),(1,15,NULL::BIGINT,NULL::BIGINT,30,0),(1,16,NULL::BIGINT,NULL::BIGINT,200,0),
(1,17,NULL::BIGINT,NULL::BIGINT,15,0),(1,18,NULL::BIGINT,NULL::BIGINT,40,0),(1,19,NULL::BIGINT,NULL::BIGINT,80,0),
(1,20,NULL::BIGINT,NULL::BIGINT,120,0),(1,21,NULL::BIGINT,NULL::BIGINT,150,0),(1,22,NULL::BIGINT,NULL::BIGINT,25,0),
(1,23,NULL::BIGINT,NULL::BIGINT,18,0),(1,24,NULL::BIGINT,NULL::BIGINT,40,0),(1,25,NULL::BIGINT,NULL::BIGINT,60,0),
(1,26,NULL::BIGINT,NULL::BIGINT,35,0),(1,27,NULL::BIGINT,NULL::BIGINT,20,0),(1,28,NULL::BIGINT,NULL::BIGINT,15,0),
(1,29,NULL::BIGINT,NULL::BIGINT,10,0),(1,30,NULL::BIGINT,NULL::BIGINT,28,0),(1,32,NULL::BIGINT,NULL::BIGINT,85,0),
(1,33,NULL::BIGINT,NULL::BIGINT,100,0),(1,34,NULL::BIGINT,NULL::BIGINT,40,0),(1,35,NULL::BIGINT,NULL::BIGINT,300,0),
(1,36,NULL::BIGINT,NULL::BIGINT,80,0),(1,37,NULL::BIGINT,NULL::BIGINT,60,0),(1,38,NULL::BIGINT,NULL::BIGINT,35,0),
(1,39,NULL::BIGINT,NULL::BIGINT,20,0),(1,40,NULL::BIGINT,NULL::BIGINT,30,0),(1,41,NULL::BIGINT,NULL::BIGINT,120,0),
(1,42,NULL::BIGINT,NULL::BIGINT,40,0),(1,43,NULL::BIGINT,NULL::BIGINT,100,0),(1,44,NULL::BIGINT,NULL::BIGINT,30,0),
(1,45,NULL::BIGINT,NULL::BIGINT,25,0),(1,46,NULL::BIGINT,NULL::BIGINT,50,0),(1,47,NULL::BIGINT,NULL::BIGINT,20,0)
) AS d(empresa_id, producto_id, producto_variante_id, bodega_id, existencia, reservado)
WHERE i.empresa_id=d.empresa_id AND i.producto_id=d.producto_id
  AND i.producto_variante_id IS NOT DISTINCT FROM d.producto_variante_id AND i.bodega_id IS NOT DISTINCT FROM d.bodega_id;

-- 23. REFERENCIAS
INSERT INTO public.producto_referencia (producto_id, referencia, descripcion, estado)
SELECT p.id_producto, p.codigo_interno, p.nombre, 'activo' FROM public.producto p
WHERE p.empresa_id=1 AND p.id_producto BETWEEN 1 AND 48
  AND NOT EXISTS (SELECT 1 FROM public.producto_referencia pr WHERE pr.producto_id=p.id_producto AND pr.referencia=p.codigo_interno);

-- 24. CÓDIGOS DE BARRAS
INSERT INTO public.producto_codigo_barras (id_producto_codigo_barras, producto_id, codigo_barras, descripcion, principal, estado) VALUES
(1,1,'7701234000011','Código principal FER-0001',TRUE,'activo'),(2,2,'7701234000028','Código principal FER-0002',TRUE,'activo'),
(3,3,'7701234000035','Código principal FER-0003',TRUE,'activo'),(4,4,'7701234000042','Código principal FER-0004',TRUE,'activo'),
(5,5,'7701234000059','Código principal FER-0005',TRUE,'activo'),(6,6,'7701234000066','Código principal FER-0006',TRUE,'activo'),
(7,7,'7701234000073','Código principal FER-0007',TRUE,'activo'),(8,8,'7701234000080','Código principal FER-0008',TRUE,'activo'),
(9,9,'7701234000097','Código principal FER-0009',TRUE,'activo'),(10,10,'7701234000103','Código principal FER-0010',TRUE,'activo'),
(11,11,'7701234000110','Código principal FER-0011',TRUE,'activo'),(12,12,'7701234000127','Código principal FER-0012',TRUE,'activo'),
(13,13,'7701234000134','Código principal FER-0013',TRUE,'activo'),(14,14,'7701234000141','Código principal FER-0014',TRUE,'activo'),
(15,15,'7701234000158','Código principal FER-0015',TRUE,'activo'),(16,16,'7701234000165','Código principal FER-0016',TRUE,'activo'),
(17,17,'7701234000172','Código principal FER-0017',TRUE,'activo'),(18,18,'7701234000189','Código principal FER-0018',TRUE,'activo'),
(19,19,'7701234000196','Código principal FER-0019',TRUE,'activo'),(20,20,'7701234000202','Código principal FER-0020',TRUE,'activo'),
(21,21,'7701234000219','Código principal FER-0021',TRUE,'activo'),(22,22,'7701234000226','Código principal FER-0022',TRUE,'activo'),
(23,23,'7701234000233','Código principal FER-0023',TRUE,'activo'),(24,24,'7701234000240','Código principal FER-0024',TRUE,'activo'),
(25,25,'7701234000257','Código principal FER-0025',TRUE,'activo'),(26,26,'7701234000264','Código principal FER-0026',TRUE,'activo'),
(27,27,'7701234000271','Código principal FER-0027',TRUE,'activo'),(28,28,'7701234000288','Código principal FER-0028',TRUE,'activo'),
(29,29,'7701234000295','Código principal FER-0029',TRUE,'activo'),(30,30,'7701234000301','Código principal FER-0030',TRUE,'activo'),
(31,31,'7701234000318','Código principal FER-0031',TRUE,'activo'),(32,32,'7701234000325','Código principal FER-0032',TRUE,'activo'),
(33,33,'7701234000332','Código principal FER-0033',TRUE,'activo'),(34,34,'7701234000349','Código principal FER-0034',TRUE,'activo'),
(35,35,'7701234000356','Código principal FER-0035',TRUE,'activo'),(36,36,'7701234000363','Código principal FER-0036',TRUE,'activo'),
(37,37,'7701234000370','Código principal FER-0037',TRUE,'activo'),(38,38,'7701234000387','Código principal FER-0038',TRUE,'activo'),
(39,39,'7701234000394','Código principal FER-0039',TRUE,'activo'),(40,40,'7701234000400','Código principal FER-0040',TRUE,'activo'),
(41,41,'7701234000417','Código principal FER-0041',TRUE,'activo'),(42,42,'7701234000424','Código principal FER-0042',TRUE,'activo'),
(43,43,'7701234000431','Código principal FER-0043',TRUE,'activo'),(44,44,'7701234000448','Código principal FER-0044',TRUE,'activo'),
(45,45,'7701234000455','Código principal FER-0045',TRUE,'activo'),(46,46,'7701234000462','Código principal FER-0046',TRUE,'activo'),
(47,47,'7701234000479','Código principal FER-0047',TRUE,'activo'),(48,48,'7701234000486','Código principal FER-0048',TRUE,'activo')
ON CONFLICT (id_producto_codigo_barras) DO UPDATE SET producto_id=EXCLUDED.producto_id, codigo_barras=EXCLUDED.codigo_barras, descripcion=EXCLUDED.descripcion, principal=EXCLUDED.principal, estado=EXCLUDED.estado;

-- 25. PRODUCTO <-> PROVEEDOR
INSERT INTO public.producto_proveedor (producto_id, proveedor_id, referencia_proveedor, principal) VALUES
(1,101,'PROV-0001',TRUE),(2,101,'PROV-0002',TRUE),(3,101,'PROV-0003',TRUE),(4,101,'PROV-0004',TRUE),
(5,101,'PROV-0005',TRUE),(6,101,'PROV-0006',TRUE),(7,101,'PROV-0007',TRUE),(8,101,'PROV-0008',TRUE),
(9,102,'PROV-0009',TRUE),(10,102,'PROV-0010',TRUE),(11,102,'PROV-0011',TRUE),(12,102,'PROV-0012',TRUE),
(13,102,'PROV-0013',TRUE),(14,102,'PROV-0014',TRUE),(15,102,'PROV-0015',TRUE),(16,102,'PROV-0016',TRUE),
(17,102,'PROV-0017',TRUE),(18,103,'PROV-0018',TRUE),(19,103,'PROV-0019',TRUE),(20,103,'PROV-0020',TRUE),
(21,103,'PROV-0021',TRUE),(22,103,'PROV-0022',TRUE),(23,103,'PROV-0023',TRUE),(24,103,'PROV-0024',TRUE),
(25,103,'PROV-0025',TRUE),(26,103,'PROV-0026',TRUE),(27,103,'PROV-0027',TRUE),(28,103,'PROV-0028',TRUE),
(29,103,'PROV-0029',TRUE),(30,103,'PROV-0030',TRUE),(31,103,'PROV-0031',TRUE),(32,103,'PROV-0032',TRUE),
(33,103,'PROV-0033',TRUE),(34,103,'PROV-0034',TRUE),(35,103,'PROV-0035',TRUE),(36,103,'PROV-0036',TRUE),
(37,103,'PROV-0037',TRUE),(38,104,'PROV-0038',TRUE),(39,104,'PROV-0039',TRUE),(40,104,'PROV-0040',TRUE),
(41,104,'PROV-0041',TRUE),(42,104,'PROV-0042',TRUE),(43,104,'PROV-0043',TRUE),(44,104,'PROV-0044',TRUE),
(45,104,'PROV-0045',TRUE),(46,104,'PROV-0046',TRUE),(47,104,'PROV-0047',TRUE),(48,104,'PROV-0048',TRUE),
(1,102,'ALT-0001',FALSE),(3,102,'ALT-0003',FALSE),(9,103,'ALT-0009',FALSE),
(22,104,'ALT-0022',FALSE),(29,101,'ALT-0029',FALSE),(46,103,'ALT-0046',FALSE)
ON CONFLICT (producto_id, proveedor_id) DO UPDATE SET referencia_proveedor=EXCLUDED.referencia_proveedor, principal=EXCLUDED.principal, updated_at=now();

-- 26. PRODUCTO <-> ATRIBUTO
INSERT INTO public.producto_atributo (producto_id, atributo_id, obligatorio, orden, estado) VALUES
(1,1,TRUE,1,'activo'),(1,2,TRUE,2,'activo'),(8,3,FALSE,1,'activo'),
(22,4,FALSE,1,'activo'),(23,4,FALSE,1,'activo'),(31,5,TRUE,1,'activo'),(48,5,TRUE,1,'activo')
ON CONFLICT (producto_id, atributo_id) DO UPDATE SET obligatorio=EXCLUDED.obligatorio, orden=EXCLUDED.orden, estado=EXCLUDED.estado, updated_at=now();

-- 27. PRODUCTO_ATRIBUTO <-> COMPONENTES
INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
SELECT pa.id_producto_atributo, ac.id_atributo_componente, ac.orden, 'activo'
FROM public.producto_atributo pa JOIN public.atributo_componente ac ON ac.atributo_id=pa.atributo_id
WHERE pa.producto_id=1 AND pa.atributo_id=1 AND ac.id_atributo_componente IN (1,2)
ON CONFLICT (producto_atributo_id, atributo_componente_id) DO UPDATE SET orden=EXCLUDED.orden, estado=EXCLUDED.estado, updated_at=now();

INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
SELECT pa.id_producto_atributo, ac.id_atributo_componente, ac.orden, 'activo'
FROM public.producto_atributo pa JOIN public.atributo_componente ac ON ac.atributo_id=pa.atributo_id
WHERE pa.producto_id=1 AND pa.atributo_id=2 AND ac.id_atributo_componente IN (3,4)
ON CONFLICT (producto_atributo_id, atributo_componente_id) DO UPDATE SET orden=EXCLUDED.orden, estado=EXCLUDED.estado, updated_at=now();

INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
SELECT pa.id_producto_atributo, ac.id_atributo_componente, ac.orden, 'activo'
FROM public.producto_atributo pa JOIN public.atributo_componente ac ON ac.atributo_id=pa.atributo_id
WHERE pa.producto_id=22 AND pa.atributo_id=4 AND ac.id_atributo_componente IN (8)
ON CONFLICT (producto_atributo_id, atributo_componente_id) DO UPDATE SET orden=EXCLUDED.orden, estado=EXCLUDED.estado, updated_at=now();

INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
SELECT pa.id_producto_atributo, ac.id_atributo_componente, ac.orden, 'activo'
FROM public.producto_atributo pa JOIN public.atributo_componente ac ON ac.atributo_id=pa.atributo_id
WHERE pa.producto_id=23 AND pa.atributo_id=4 AND ac.id_atributo_componente IN (7)
ON CONFLICT (producto_atributo_id, atributo_componente_id) DO UPDATE SET orden=EXCLUDED.orden, estado=EXCLUDED.estado, updated_at=now();

INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
SELECT pa.id_producto_atributo, ac.id_atributo_componente, ac.orden, 'activo'
FROM public.producto_atributo pa JOIN public.atributo_componente ac ON ac.atributo_id=pa.atributo_id
WHERE pa.producto_id=31 AND pa.atributo_id=5 AND ac.id_atributo_componente IN (9,10,11)
ON CONFLICT (producto_atributo_id, atributo_componente_id) DO UPDATE SET orden=EXCLUDED.orden, estado=EXCLUDED.estado, updated_at=now();

INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
SELECT pa.id_producto_atributo, ac.id_atributo_componente, ac.orden, 'activo'
FROM public.producto_atributo pa JOIN public.atributo_componente ac ON ac.atributo_id=pa.atributo_id
WHERE pa.producto_id=48 AND pa.atributo_id=5 AND ac.id_atributo_componente IN (12,13,14,15,16)
ON CONFLICT (producto_atributo_id, atributo_componente_id) DO UPDATE SET orden=EXCLUDED.orden, estado=EXCLUDED.estado, updated_at=now();

-- 28. VARIANTES
INSERT INTO public.producto_variante (id_producto_variante, producto_id, sku, codigo_barras, referencia, precio, estado) VALUES
(1,1,'FER-0001-110-SOLO','7709876000017','FER-0001-110-S',285000,'activo'),
(2,1,'FER-0001-110-KIT','7709876000024','FER-0001-110-K',315000,'activo'),
(3,1,'FER-0001-220-SOLO','7709876000031','FER-0001-220-S',295000,'activo'),
(4,1,'FER-0001-220-KIT','7709876000048','FER-0001-220-K',325000,'activo'),
(5,31,'FER-0031-M','7709876000055','FER-0031-M',14000,'activo'),
(6,31,'FER-0031-L','7709876000062','FER-0031-L',14000,'activo'),
(7,31,'FER-0031-XL','7709876000079','FER-0031-XL',15000,'activo'),
(8,48,'FER-0048-39','7709876000086','FER-0048-39',145000,'activo'),
(9,48,'FER-0048-40','7709876000093','FER-0048-40',145000,'activo'),
(10,48,'FER-0048-41','7709876000109','FER-0048-41',145000,'activo'),
(11,48,'FER-0048-42','7709876000116','FER-0048-42',145000,'activo'),
(12,48,'FER-0048-43','7709876000123','FER-0048-43',145000,'activo')
ON CONFLICT (id_producto_variante) DO UPDATE SET producto_id=EXCLUDED.producto_id, sku=EXCLUDED.sku, codigo_barras=EXCLUDED.codigo_barras, referencia=EXCLUDED.referencia, precio=EXCLUDED.precio, estado=EXCLUDED.estado, updated_at=now();

-- 29. COMPONENTES DE VARIANTE
INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id) VALUES
(1,1),(1,3),(2,1),(2,4),(3,2),(3,3),(4,2),(4,4),(5,9),(6,10),(7,11),(8,12),(9,13),(10,14),(11,15),(12,16)
ON CONFLICT (producto_variante_id, atributo_componente_id) DO NOTHING;

-- 31. INVENTARIO POR VARIANTE
WITH datos(empresa_id, producto_id, producto_variante_id, bodega_id, existencia, reservado) AS (VALUES
(1,1,1,NULL::BIGINT,4,0),(1,1,2,NULL::BIGINT,3,0),(1,1,3,NULL::BIGINT,3,0),(1,1,4,NULL::BIGINT,2,0),
(1,31,5,NULL::BIGINT,25,0),(1,31,6,NULL::BIGINT,30,0),(1,31,7,NULL::BIGINT,15,0),
(1,48,8,NULL::BIGINT,8,0),(1,48,9,NULL::BIGINT,12,0),(1,48,10,NULL::BIGINT,15,0),(1,48,11,NULL::BIGINT,10,0),(1,48,12,NULL::BIGINT,6,0)
)
INSERT INTO public.inventario (empresa_id, producto_id, producto_variante_id, bodega_id, existencia, reservado)
SELECT d.* FROM datos d WHERE NOT EXISTS (
    SELECT 1 FROM public.inventario i WHERE i.empresa_id=d.empresa_id AND i.producto_id=d.producto_id
    AND i.producto_variante_id=d.producto_variante_id AND i.bodega_id IS NOT DISTINCT FROM d.bodega_id
);
UPDATE public.inventario i SET existencia=d.existencia, reservado=d.reservado, updated_at=now()
FROM (VALUES
(1,1,1,NULL::BIGINT,4,0),(1,1,2,NULL::BIGINT,3,0),(1,1,3,NULL::BIGINT,3,0),(1,1,4,NULL::BIGINT,2,0),
(1,31,5,NULL::BIGINT,25,0),(1,31,6,NULL::BIGINT,30,0),(1,31,7,NULL::BIGINT,15,0),
(1,48,8,NULL::BIGINT,8,0),(1,48,9,NULL::BIGINT,12,0),(1,48,10,NULL::BIGINT,15,0),(1,48,11,NULL::BIGINT,10,0),(1,48,12,NULL::BIGINT,6,0)
) AS d(empresa_id, producto_id, producto_variante_id, bodega_id, existencia, reservado)
WHERE i.empresa_id=d.empresa_id AND i.producto_id=d.producto_id
  AND i.producto_variante_id=d.producto_variante_id AND i.bodega_id IS NOT DISTINCT FROM d.bodega_id;

-- 32. IMÁGENES CON URLS REALES Y PÚBLICAS (COMPATIBLES CON META Y WHATSAPP)
INSERT INTO public.producto_imagen (
    id_producto_imagen, producto_id, url, nombre, orden, principal, estado
) VALUES
(1, 1, 'https://iili.io/nYj72us.jpg', 'Taladro Percutor Amarillo DeWalt 650W', 1, TRUE, 'activo'),
(2, 2, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80', 'Esmeriladora Angular 4-1/2 820W', 1, TRUE, 'activo'),
(3, 3, 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80', 'Sierra Circular 7-1/4 1400W', 1, TRUE, 'activo'),
(4, 4, 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=80', 'Martillo de Uña Curva 16 oz', 1, TRUE, 'activo'),
(5, 5, 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=80', 'Juego de Destornilladores Pro 6 Pcs', 1, TRUE, 'activo'),
(6, 6, 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80', 'Alicate Universal 8 Pulgadas', 1, TRUE, 'activo'),
(7, 7, 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=800&auto=format&fit=crop&q=80', 'Flexómetro Cinta Métrica 8m', 1, TRUE, 'activo'),
(8, 8, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80', 'Pala Redonda Cuello Soldado', 1, TRUE, 'activo'),
(9, 9, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', 'Cemento Gris Uso General 50kg', 1, TRUE, 'activo'),
(10, 10, 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80', 'Varilla Corrugada 1/2 Pulgada x 6m', 1, TRUE, 'activo'),
(11, 11, 'https://images.unsplash.com/photo-1516216628859-9bcceabb84ca?w=800&auto=format&fit=crop&q=80', 'Varilla Corrugada 3/8 Pulgada x 6m', 1, TRUE, 'activo'),
(12, 12, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80', 'Alambre Negro Recocido Calibre 18', 1, TRUE, 'activo'),
(13, 13, 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&auto=format&fit=crop&q=80', 'Tubo PVC Sanitario 3 Pulgadas x 6m', 1, TRUE, 'activo'),
(14, 14, 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop&q=80', 'Tubo PVC Presión 1/2 Pulgada x 6m', 1, TRUE, 'activo'),
(15, 15, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80', 'Soldadura Líquida PVC Transparente 1/4 Galón', 1, TRUE, 'activo'),
(16, 16, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80', 'Cinta Teflón 1/2 Pulgada x 10m', 1, TRUE, 'activo'),
(17, 17, 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop&q=80', 'Cable Cobre THHN Calibre 12 AWG 100m', 1, TRUE, 'activo'),
(18, 18, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80', 'Breaker Enchufable Monopolar 20A', 1, TRUE, 'activo'),
(19, 19, 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&auto=format&fit=crop&q=80', 'Tomacorriente Doble con Polo a Tierra 15A', 1, TRUE, 'activo'),
(20, 20, 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80', 'Cinta Aislante Negra Vinilo 20m', 1, TRUE, 'activo'),
(21, 21, 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=800&auto=format&fit=crop&q=80', 'Bombillo LED Luz Blanca 12W E27', 1, TRUE, 'activo'),
(22, 22, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80', 'Pintura Vinilo Tipo 1 Blanco Cuñete 5 Gal', 1, TRUE, 'activo'),
(23, 23, 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=80', 'Esmalte Sintético Anticorrosivo Negro Galón', 1, TRUE, 'activo'),
(24, 24, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80', 'Rodillo Antigoteo Felpa 9 Pulgadas', 1, TRUE, 'activo'),
(25, 25, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80', 'Brocha de Cerdas Naturales 3 Pulgadas', 1, TRUE, 'activo'),
(26, 26, 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=80', 'Chazo Plástico con Tornillo Goloso 1/4', 1, TRUE, 'activo'),
(27, 27, 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=800&auto=format&fit=crop&q=80', 'Tornillo Drywall Punta Aguda 6x1 (Caja x 1000)', 1, TRUE, 'activo'),
(28, 28, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80', 'Juego de Brocas Mixtas Muro y Metal 10 Pcs', 1, TRUE, 'activo'),
(29, 29, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80', 'Cerradura de Sobreponer Derecha Yale', 1, TRUE, 'activo'),
(30, 30, 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80', 'Candado de Latón Macizo 50mm con 3 Llaves', 1, TRUE, 'activo'),
(31, 31, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80', 'Guantes de Vaqueta Tipo Ingeniero Par', 1, TRUE, 'activo'),
(32, 32, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80', 'Gafas de Seguridad Transparentes Anti-empañante', 1, TRUE, 'activo'),
(33, 33, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80', 'Disco de Corte para Metal 4-1/2 x 1 mm', 1, TRUE, 'activo'),
(34, 34, 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80', 'Disco Diamantado Segmentado 4-1/2 Pulgadas', 1, TRUE, 'activo'),
(35, 35, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80', 'Lija de Agua Grano 220', 1, TRUE, 'activo'),
(36, 36, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80', 'Silicona Neutra Transparente 280 ml', 1, TRUE, 'activo'),
(37, 37, 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop&q=80', 'Adhesivo Epóxico Dos Componentes 50 ml', 1, TRUE, 'activo'),
(38, 38, 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80', 'Llave Ajustable 10 Pulgadas', 1, TRUE, 'activo'),
(39, 39, 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=80', 'Juego de Llaves Combinadas 8 Piezas', 1, TRUE, 'activo'),
(40, 40, 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80', 'Arco de Sierra para Metal 12 Pulgadas', 1, TRUE, 'activo'),
(41, 41, 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&auto=format&fit=crop&q=80', 'Codo PVC Presión 1/2 Pulgada 90 Grados', 1, TRUE, 'activo'),
(42, 42, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80', 'Llave Terminal Cromada 1/2 Pulgada', 1, TRUE, 'activo'),
(43, 43, 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&auto=format&fit=crop&q=80', 'Interruptor Sencillo 10A Blanco', 1, TRUE, 'activo'),
(44, 44, 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop&q=80', 'Extensión Eléctrica 10 m 15A', 1, TRUE, 'activo'),
(45, 45, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80', 'Tomacorriente Industrial 2P+T 20A', 1, TRUE, 'activo'),
(46, 46, 'https://images.unsplash.com/photo-1578873375972-e1d556c4d7d3?w=800&auto=format&fit=crop&q=80', 'Casco de Seguridad Tipo I Clase E', 1, TRUE, 'activo'),
(47, 47, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80', 'Respirador Reutilizable Media Cara', 1, TRUE, 'activo'),
(48, 48, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', 'Bota de Seguridad Punta de Acero', 1, TRUE, 'activo'),
(49, 1, 'https://iili.io/nYj7fn4.jpg', 'Taladro Percutor Negro DeWalt 650W', 2, FALSE, 'activo')
ON CONFLICT (id_producto_imagen) DO UPDATE SET
    producto_id = EXCLUDED.producto_id,
    url = EXCLUDED.url,
    nombre = EXCLUDED.nombre,
    orden = EXCLUDED.orden,
    principal = EXCLUDED.principal,
    estado = EXCLUDED.estado;

-- 33. SEO / IA
INSERT INTO public.producto_seo_ia (
    producto_id, titulo_seo, descripcion_seo, palabras_clave, etiquetas,
    sinonimos, texto_busqueda, caracteristicas, usos, publico_objetivo,
    slug, indexable, contenido_ia
)
SELECT p.id_producto, p.nombre, p.descripcion_corta,
    p.nombre || ', ferretería, construcción',
    ARRAY['ferreteria','construccion','catalogo'],
    p.nombre,
    p.nombre || ' ' || COALESCE(p.descripcion_corta,'') || ' ' || COALESCE(p.ficha_tecnica,''),
    p.ficha_tecnica, p.descripcion_larga,
    'Profesionales de construcción, técnicos, contratistas y consumidores',
    LOWER(p.codigo_interno), TRUE, p.descripcion_larga
FROM public.producto p WHERE p.empresa_id=1 AND p.id_producto BETWEEN 1 AND 48
ON CONFLICT (producto_id) DO UPDATE SET
    titulo_seo=EXCLUDED.titulo_seo, descripcion_seo=EXCLUDED.descripcion_seo,
    palabras_clave=EXCLUDED.palabras_clave, etiquetas=EXCLUDED.etiquetas,
    sinonimos=EXCLUDED.sinonimos, texto_busqueda=EXCLUDED.texto_busqueda,
    caracteristicas=EXCLUDED.caracteristicas, usos=EXCLUDED.usos,
    publico_objetivo=EXCLUDED.publico_objetivo, slug=EXCLUDED.slug,
    indexable=EXCLUDED.indexable, contenido_ia=EXCLUDED.contenido_ia, updated_at=now();

-- 40. AJUSTE DE SECUENCIAS
DO $$
DECLARE r RECORD; v_max BIGINT;
BEGIN
    FOR r IN
        SELECT n.nspname AS schema_name, c.relname AS table_name, a.attname AS column_name,
            pg_get_serial_sequence(format('%I.%I',n.nspname,c.relname),a.attname) AS sequence_name
        FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        JOIN pg_attribute a ON a.attrelid=c.oid
        WHERE n.nspname='public' AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped
          AND pg_get_serial_sequence(format('%I.%I',n.nspname,c.relname),a.attname) IS NOT NULL
    LOOP
        EXECUTE format('SELECT COALESCE(MAX(%I),0) FROM %I.%I',r.column_name,r.schema_name,r.table_name) INTO v_max;
        IF v_max=0 THEN EXECUTE format('SELECT setval(%L,1,false)',r.sequence_name);
        ELSE EXECUTE format('SELECT setval(%L,%s,true)',r.sequence_name,v_max); END IF;
    END LOOP;
END; $$;
