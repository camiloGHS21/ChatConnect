-- ============================================================
-- CHATCONNECT - ESQUEMA COMPLETO AJUSTADO AL DOC 02
-- PostgreSQL 16 / Supabase
--
-- CRITERIOS DE ESTA VERSION
-- 1) Los nombres de las tablas del módulo siguen el nombre del DOC 02
--    en singular: producto, categoria, subcategoria, marca, secuencia,
--    impuesto, producto_impuesto_compra, producto_impuesto_venta, etc.
-- 2) No existen alias técnicos "id" generados.
-- 3) Las PK usan id_<entidad>, siguiendo el comentario del documento.
-- 4) En las tablas del módulo de productos se conservan únicamente campos
--    definidos explícitamente por el DOC 02 o estrictamente necesarios para
--    materializar relaciones/reglas que el mismo documento exige.
--    No se inventan tablas puente no nombradas por el documento.
-- 5) producto.secuencia_id NO existe.
-- 6) producto.presentacion es manual (TEXT).
-- 7) producto_lista_precio NO contiene impuesto_venta_id.
--    Los impuestos de venta se resuelven por producto_impuesto_venta;
--    NO se crea lista_precio_impuesto_venta.
-- 8) producto_proveedor.proveedor_id referencia tercero.
--    La tabla cliente NO existe: clientes y proveedores se administran
--    únicamente mediante tercero y tipo_tercero.
-- 9) cuenta_contable_id queda NULL por ahora.
-- 10) No se crean columnas técnicas como categoria.activo, marca.activo,
--     producto.activo, alias id, tsv_rag o similares.
-- 11) Los campos de costo/precio con impuesto se nombran en singular:
--     costo_impuesto y precio_impuesto.
--
-- NOTA:
-- El DOC 02 no enumera todos los campos físicos de EMPRESA, TERCERO ni de varias
-- tablas operativas de WhatsApp/pedido. TERCERO unifica clientes y proveedores.
-- No se crea una tabla cliente separada.
-- ============================================================

ROLLBACK;
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 0. LIMPIEZA
-- ============================================================
-- Primero se eliminan, si existen, las tablas de la versión anterior que
-- quedaron pluralizadas. Estas NO se vuelven a crear; el esquema final usa
-- los nombres del documento en singular.
DROP TABLE IF EXISTS public.auditorias CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.errores_integracion CASCADE;
DROP TABLE IF EXISTS public.eventos_webhook CASCADE;
DROP TABLE IF EXISTS public.procesamientos_ia CASCADE;
DROP TABLE IF EXISTS public.pedidos_estados CASCADE;
DROP TABLE IF EXISTS public.pedidos_detalles CASCADE;
DROP TABLE IF EXISTS public.pedidos CASCADE;
DROP TABLE IF EXISTS public.carritos_detalles CASCADE;
DROP TABLE IF EXISTS public.carritos CASCADE;
DROP TABLE IF EXISTS public.mensajes CASCADE;
DROP TABLE IF EXISTS public.conversaciones CASCADE;
DROP TABLE IF EXISTS public.canales CASCADE;
DROP TABLE IF EXISTS public.inventarios CASCADE;
DROP TABLE IF EXISTS public.precios CASCADE;
DROP TABLE IF EXISTS public.productos_seo_ia CASCADE;
DROP TABLE IF EXISTS public.productos_imagenes CASCADE;
DROP TABLE IF EXISTS public.productos_proveedores CASCADE;
DROP TABLE IF EXISTS public.variantes_componentes CASCADE;
DROP TABLE IF EXISTS public.productos_variantes CASCADE;
DROP TABLE IF EXISTS public.productos_atributos_componentes CASCADE;
DROP TABLE IF EXISTS public.productos_atributos CASCADE;
DROP TABLE IF EXISTS public.atributos_componentes CASCADE;
DROP TABLE IF EXISTS public.atributos CASCADE;
DROP TABLE IF EXISTS public.productos_codigos_barras CASCADE;
DROP TABLE IF EXISTS public.productos_referencias CASCADE;
DROP TABLE IF EXISTS public.productos_retenciones CASCADE;
DROP TABLE IF EXISTS public.listas_precios_impuestos_venta CASCADE;
DROP TABLE IF EXISTS public.productos_listas_precios CASCADE;
DROP TABLE IF EXISTS public.productos_impuestos_venta CASCADE;
DROP TABLE IF EXISTS public.productos_impuestos_compra CASCADE;
DROP TABLE IF EXISTS public.productos CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE; -- limpieza heredada; NO se recrea
DROP TABLE IF EXISTS public.terceros CASCADE;
DROP TABLE IF EXISTS public.medidas CASCADE;
DROP TABLE IF EXISTS public.tipos_inventario CASCADE;
DROP TABLE IF EXISTS public.listas_precios CASCADE;
DROP TABLE IF EXISTS public.retenciones CASCADE;
DROP TABLE IF EXISTS public.impuestos CASCADE;
DROP TABLE IF EXISTS public.secuencias CASCADE;
DROP TABLE IF EXISTS public.marcas CASCADE;
DROP TABLE IF EXISTS public.subcategorias CASCADE;
DROP TABLE IF EXISTS public.categorias CASCADE;
DROP TABLE IF EXISTS public.empresas CASCADE;

-- Nombres finales según el DOC 02 (singular)
DROP TABLE IF EXISTS public.auditoria CASCADE;
DROP TABLE IF EXISTS public.usuario CASCADE;
DROP TABLE IF EXISTS public.error_integracion CASCADE;
DROP TABLE IF EXISTS public.evento_webhook CASCADE;
DROP TABLE IF EXISTS public.procesamiento_ia CASCADE;
DROP TABLE IF EXISTS public.pedido_estado CASCADE;
DROP TABLE IF EXISTS public.pedido_detalle_impuesto CASCADE;
DROP TABLE IF EXISTS public.pedido_detalle CASCADE;
DROP TABLE IF EXISTS public.pedido CASCADE;
DROP TABLE IF EXISTS public.carrito_detalle CASCADE;
DROP TABLE IF EXISTS public.carrito CASCADE;
DROP TABLE IF EXISTS public.mensaje CASCADE;
DROP TABLE IF EXISTS public.conversacion CASCADE;
DROP TABLE IF EXISTS public.canal CASCADE;
DROP TABLE IF EXISTS public.inventario CASCADE;
DROP TABLE IF EXISTS public.precio CASCADE;
DROP TABLE IF EXISTS public.producto_seo_ia CASCADE;
DROP TABLE IF EXISTS public.producto_imagen CASCADE;
DROP TABLE IF EXISTS public.producto_proveedor CASCADE;
DROP TABLE IF EXISTS public.variante_componente CASCADE;
DROP TABLE IF EXISTS public.producto_variante CASCADE;
DROP TABLE IF EXISTS public.producto_atributo_componente CASCADE;
DROP TABLE IF EXISTS public.producto_atributo CASCADE;
DROP TABLE IF EXISTS public.atributo_componente CASCADE;
DROP TABLE IF EXISTS public.atributo CASCADE;
DROP TABLE IF EXISTS public.producto_codigo_barras CASCADE;
DROP TABLE IF EXISTS public.producto_referencia CASCADE;
DROP TABLE IF EXISTS public.producto_retencion CASCADE;
DROP TABLE IF EXISTS public.lista_precio_impuesto_venta CASCADE; -- limpieza de versión anterior; NO se recrea
DROP TABLE IF EXISTS public.producto_lista_precio CASCADE;
DROP TABLE IF EXISTS public.producto_impuesto_venta CASCADE;
DROP TABLE IF EXISTS public.producto_impuesto_compra CASCADE;
DROP TABLE IF EXISTS public.producto CASCADE;
DROP TABLE IF EXISTS public.cliente CASCADE; -- limpieza heredada; NO se recrea
DROP TABLE IF EXISTS public.tercero CASCADE;
DROP TABLE IF EXISTS public.medida CASCADE;
DROP TABLE IF EXISTS public.tipo_inventario CASCADE;
DROP TABLE IF EXISTS public.lista_precio CASCADE;
DROP TABLE IF EXISTS public.retencion CASCADE;
DROP TABLE IF EXISTS public.impuesto CASCADE;
DROP TABLE IF EXISTS public.secuencia CASCADE;
DROP TABLE IF EXISTS public.marca CASCADE;
DROP TABLE IF EXISTS public.subcategoria CASCADE;
DROP TABLE IF EXISTS public.categoria CASCADE;
DROP TABLE IF EXISTS public.empresa CASCADE;

-- Limpieza adicional de nombres heredados
DROP TABLE IF EXISTS public.auditoria CASCADE;
DROP TABLE IF EXISTS public.procesamiento_ia CASCADE;
DROP TABLE IF EXISTS public.pedido_estados CASCADE;
DROP TABLE IF EXISTS public.pedido_detalles CASCADE;
DROP TABLE IF EXISTS public.carrito_detalles CASCADE;
DROP TABLE IF EXISTS public.producto_seo_ia CASCADE;
DROP TABLE IF EXISTS public.producto_imagen CASCADE;
DROP TABLE IF EXISTS public.producto_proveedor CASCADE;
DROP TABLE IF EXISTS public.variante_componente CASCADE;
DROP TABLE IF EXISTS public.producto_variante CASCADE;
DROP TABLE IF EXISTS public.producto_atributo_componente CASCADE;
DROP TABLE IF EXISTS public.producto_atributo CASCADE;
DROP TABLE IF EXISTS public.atributo_componentes CASCADE;
DROP TABLE IF EXISTS public.producto_codigo_barras CASCADE;
DROP TABLE IF EXISTS public.producto_referencia CASCADE;
DROP TABLE IF EXISTS public.producto_retencion CASCADE;
DROP TABLE IF EXISTS public.producto_lista_precio CASCADE;
DROP TABLE IF EXISTS public.producto_impuesto_venta CASCADE;
DROP TABLE IF EXISTS public.producto_impuesto_compra CASCADE;
DROP TABLE IF EXISTS public.proveedores CASCADE;
DROP TABLE IF EXISTS public.estados_producto CASCADE;

-- ============================================================
-- 1. EMPRESAS
-- Fuera del listado físico de campos del DOC 02; se conserva la entidad base.
-- ============================================================
CREATE TABLE public.empresa (
    id_empresa BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    razon_social VARCHAR(200),
    nombre_comercial VARCHAR(200) NOT NULL,
    nit VARCHAR(50),
    telefono VARCHAR(50),
    whatsapp VARCHAR(30),
    email VARCHAR(150),
    direccion TEXT,
    pais VARCHAR(100) DEFAULT 'Colombia',
    departamento VARCHAR(100),
    ciudad VARCHAR(100),
    sector VARCHAR(100),
    categoria_producto_obligatoria BOOLEAN NOT NULL DEFAULT true,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT empresa_uuid_unique UNIQUE (uuid)
);

-- ============================================================
-- 2. CATEGORIAS
-- DOC 02: id, empresa_id, nombre, imagen, icono, estado,
-- created_at, updated_at.
-- NO existe columna tecnica "activo".
-- ============================================================
CREATE TABLE public.categoria (
    id_categoria BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    imagen TEXT,
    icono TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT categoria_empresa_nombre_unique UNIQUE (empresa_id, nombre),
    CONSTRAINT categoria_id_empresa_unique UNIQUE (id_categoria, empresa_id),
    CONSTRAINT categoria_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 3. SUBCATEGORIAS
-- DOC 02: id, empresa_id, categoria_id, nombre, imagen, icono,
-- estado, created_at, updated_at.
-- ============================================================
CREATE TABLE public.subcategoria (
    id_subcategoria BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    imagen TEXT,
    icono TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT subcategoria_categoria_nombre_unique
        UNIQUE (categoria_id, nombre),
    CONSTRAINT subcategoria_id_empresa_categoria_unique
        UNIQUE (id_subcategoria, empresa_id, categoria_id),

    CONSTRAINT subcategoria_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT subcategoria_categoria_empresa_fk
        FOREIGN KEY (categoria_id, empresa_id)
        REFERENCES public.categoria(id_categoria, empresa_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 4. MARCAS
-- DOC 02: id, empresa_id, nombre, estado, created_at, updated_at.
-- NO existe columna tecnica "activo".
-- ============================================================
CREATE TABLE public.marca (
    id_marca BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT marca_empresa_nombre_unique UNIQUE (empresa_id, nombre),
    CONSTRAINT marca_id_empresa_unique UNIQUE (id_marca, empresa_id),
    CONSTRAINT marca_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 5. SECUENCIAS
-- DOC 02: id, empresa_id, modulo, prefijo, consecutivo_actual,
-- longitud, estado.
-- ============================================================
CREATE TABLE public.secuencia (
    id_secuencia BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    prefijo VARCHAR(50),
    consecutivo_actual BIGINT NOT NULL DEFAULT 0,
    longitud INTEGER NOT NULL DEFAULT 6,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),

    CONSTRAINT secuencia_empresa_modulo_unique UNIQUE (empresa_id, modulo),
    CONSTRAINT secuencia_consecutivo_check CHECK (consecutivo_actual >= 0),
    CONSTRAINT secuencia_longitud_check CHECK (longitud > 0),
    CONSTRAINT secuencia_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 6. IMPUESTOS
-- DOC 02: id, empresa_id, codigo, nombre, porcentaje, valor, tipo,
-- estado, cuenta_contable_id, created_at, updated_at.
-- ============================================================
CREATE TABLE public.impuesto (
    id_impuesto BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    codigo VARCHAR(50),
    nombre VARCHAR(100) NOT NULL,
    porcentaje NUMERIC(9,4),
    valor NUMERIC(14,2),
    tipo VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    cuenta_contable_id BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT impuesto_id_empresa_unique UNIQUE (id_impuesto, empresa_id),
    CONSTRAINT impuesto_empresa_nombre_unique UNIQUE (empresa_id, nombre),
    CONSTRAINT impuesto_valores_check CHECK (
        (porcentaje IS NULL OR porcentaje >= 0)
        AND (valor IS NULL OR valor >= 0)
    ),
    CONSTRAINT impuesto_cuenta_contable_null_check
        CHECK (cuenta_contable_id IS NULL),
    CONSTRAINT impuesto_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 7. RETENCIONES
-- El DOC 02 exige la entidad maestra, pero no enumera sus campos.
-- Se conserva el conjunto mínimo para poder referenciarla.
-- Los valores concretos quedan en producto_retencion, como sí define DOC 02.
-- ============================================================
CREATE TABLE public.retencion (
    id_retencion BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),

    CONSTRAINT retencion_id_empresa_unique UNIQUE (id_retencion, empresa_id),
    CONSTRAINT retencion_empresa_nombre_unique UNIQUE (empresa_id, nombre),
    CONSTRAINT retencion_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 8. LISTAS DE PRECIOS
-- El DOC 02 exige la entidad lista_precio y da ejemplos, pero no enumera
-- sus campos. Se usa el mínimo necesario: id, empresa, nombre y estado.
-- ============================================================
CREATE TABLE public.lista_precio (
    id_lista_precio BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),

    CONSTRAINT lista_precio_id_empresa_unique UNIQUE (id_lista_precio, empresa_id),
    CONSTRAINT lista_precio_empresa_nombre_unique UNIQUE (empresa_id, nombre),
    CONSTRAINT lista_precio_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 9. TIPOS DE INVENTARIO
-- DOC 02: id, empresa_id, nombre, descripcion, estado.
-- ============================================================
CREATE TABLE public.tipo_inventario (
    id_tipo_inventario BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),

    CONSTRAINT tipo_inventario_id_empresa_unique UNIQUE (id_tipo_inventario, empresa_id),
    CONSTRAINT tipo_inventario_empresa_nombre_unique UNIQUE (empresa_id, nombre),
    CONSTRAINT tipo_inventario_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 10. MEDIDAS
-- DOC 02: id, empresa_id, codigo, nombre, estado.
-- ============================================================
CREATE TABLE public.medida (
    id_medida BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),

    CONSTRAINT medida_id_empresa_unique UNIQUE (id_medida, empresa_id),
    CONSTRAINT medida_empresa_codigo_unique UNIQUE (empresa_id, codigo),
    CONSTRAINT medida_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);


-- ============================================================
-- 11.1 DEPARTAMENTOS Y CIUDADES (Catálogo Geográfico Oficial)
-- Relación 1:N entre departamento y ciudad.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.departamento (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ciudad (
    id BIGSERIAL PRIMARY KEY,
    id_departamento BIGINT NOT NULL REFERENCES public.departamento(id) ON UPDATE CASCADE ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ciudad_depto_codigo_unique UNIQUE (id_departamento, codigo)
);

-- ============================================================
-- 12. TERCEROS
-- Entidad única para clientes, proveedores o ambos.
-- DOC 02 indica: proveedor_id debe tomarse de tercero y cliente cambiar por tercero.
-- ============================================================
CREATE TABLE public.tercero (
    id_tercero BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    tipo_persona VARCHAR(30) NOT NULL DEFAULT 'natural',
    tipo_tercero VARCHAR(30) NOT NULL DEFAULT 'cliente'
        CHECK (tipo_tercero IN ('cliente','proveedor','ambos')),
    tipo_documento VARCHAR(30),
    numero_documento VARCHAR(50),
    digito_verificacion VARCHAR(10),
    nombre VARCHAR(150),
    apellido VARCHAR(150),
    razon_social VARCHAR(200),
    email VARCHAR(150),
    telefono VARCHAR(50),
    whatsapp VARCHAR(30),
    id_departamento BIGINT REFERENCES public.departamento(id) ON UPDATE CASCADE ON DELETE SET NULL,
    id_ciudad BIGINT REFERENCES public.ciudad(id) ON UPDATE CASCADE ON DELETE SET NULL,
    departamento VARCHAR(100),
    ciudad VARCHAR(100),
    direccion TEXT,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT tercero_id_empresa_unique UNIQUE (id_tercero, empresa_id),
    CONSTRAINT tercero_empresa_whatsapp_unique UNIQUE (empresa_id, whatsapp),
    CONSTRAINT tercero_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- CLIENTE UNIFICADO EN TERCERO
-- ============================================================
-- No se crea public.cliente. Los contactos comerciales se almacenan en
-- public.tercero y se clasifican con tipo_tercero = cliente/proveedor/ambos.

-- ============================================================
-- 13. PRODUCTOS
-- DOC 02: NO secuencia_id. Presentacion manual.
-- Se incluyen costo/precio/utilidad porque el documento los define
-- explícitamente en sus secciones 15, 16 y 17.
-- ============================================================
CREATE TABLE public.producto (
    id_producto BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    categoria_id BIGINT,
    subcategoria_id BIGINT,
    marca_id BIGINT,
    codigo_interno VARCHAR(100) NOT NULL,
    nombre VARCHAR(250) NOT NULL,
    descripcion_corta TEXT,
    descripcion_larga TEXT,
    ficha_tecnica TEXT,

    costo_base NUMERIC(14,2) NOT NULL DEFAULT 0,
    costo_impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    precio_base NUMERIC(14,2) NOT NULL DEFAULT 0,
    precio_impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    utilidad_valor NUMERIC(14,2) NOT NULL DEFAULT 0,
    utilidad_porcentaje NUMERIC(14,4) NOT NULL DEFAULT 0,

    maneja_inventario BOOLEAN NOT NULL DEFAULT false,
    tipo_inventario_id BIGINT,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    stock_maximo INTEGER NOT NULL DEFAULT 0,
    medida_id BIGINT,
    presentacion TEXT,
    estado_producto VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado_producto IN ('activo','inactivo')),
    estado_publicacion VARCHAR(30) NOT NULL DEFAULT 'no_publicado'
        CHECK (estado_publicacion IN ('publicado','no_publicado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_empresa_codigo_unique UNIQUE (empresa_id, codigo_interno),
    CONSTRAINT producto_id_empresa_unique UNIQUE (id_producto, empresa_id),
    CONSTRAINT producto_stock_check
        CHECK (stock_minimo >= 0 AND stock_maximo >= stock_minimo),
    CONSTRAINT producto_costos_check
        CHECK (costo_base >= 0 AND costo_impuesto >= 0),
    CONSTRAINT producto_precio_check
        CHECK (precio_base >= 0 AND precio_impuesto >= 0),

    CONSTRAINT producto_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT producto_categoria_empresa_fk
        FOREIGN KEY (categoria_id, empresa_id)
        REFERENCES public.categoria(id_categoria, empresa_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT producto_subcategoria_fk
        FOREIGN KEY (subcategoria_id)
        REFERENCES public.subcategoria(id_subcategoria)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT producto_marca_empresa_fk
        FOREIGN KEY (marca_id, empresa_id)
        REFERENCES public.marca(id_marca, empresa_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT producto_tipo_inventario_empresa_fk
        FOREIGN KEY (tipo_inventario_id, empresa_id)
        REFERENCES public.tipo_inventario(id_tipo_inventario, empresa_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT producto_medida_empresa_fk
        FOREIGN KEY (medida_id, empresa_id)
        REFERENCES public.medida(id_medida, empresa_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 14. PRODUCTOS_IMPUESTOS_COMPRA
-- DOC 02: id, producto_id, impuesto_id, valor_impuesto, estado, created_at.
-- ============================================================
CREATE TABLE public.producto_impuesto_compra (
    id_producto_impuesto_compra BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    impuesto_id BIGINT NOT NULL,
    valor_impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_impuesto_compra_unique
        UNIQUE (producto_id, impuesto_id),
    CONSTRAINT producto_impuesto_compra_valor_check
        CHECK (valor_impuesto >= 0),
    CONSTRAINT producto_impuesto_compra_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT producto_impuesto_compra_impuesto_fk
        FOREIGN KEY (impuesto_id)
        REFERENCES public.impuesto(id_impuesto)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 15. PRODUCTOS_IMPUESTOS_VENTA
-- DOC 02: id, producto_id, impuesto_id, valor_impuesto, estado, created_at.
-- ============================================================
CREATE TABLE public.producto_impuesto_venta (
    id_producto_impuesto_venta BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    impuesto_id BIGINT NOT NULL,
    valor_impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_impuesto_venta_unique
        UNIQUE (producto_id, impuesto_id),
    CONSTRAINT producto_impuesto_venta_valor_check
        CHECK (valor_impuesto >= 0),
    CONSTRAINT producto_impuesto_venta_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT producto_impuesto_venta_impuesto_fk
        FOREIGN KEY (impuesto_id)
        REFERENCES public.impuesto(id_impuesto)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 16. PRODUCTOS_LISTAS_PRECIOS
-- DOC 02: id, producto_id, lista_precio_id, precio_base,
-- utilidad_valor, utilidad_porcentaje, precio_venta, estado,
-- created_at, updated_at.
-- impuesto_venta_id NO VA.
-- ============================================================
CREATE TABLE public.producto_lista_precio (
    id_producto_lista_precio BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    lista_precio_id BIGINT NOT NULL,
    precio_base NUMERIC(14,2) NOT NULL DEFAULT 0,
    utilidad_valor NUMERIC(14,2) NOT NULL DEFAULT 0,
    utilidad_porcentaje NUMERIC(14,4) NOT NULL DEFAULT 0,
    precio_venta NUMERIC(14,2) NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_lista_precio_unique
        UNIQUE (producto_id, lista_precio_id),
    CONSTRAINT producto_lista_precio_valores_check CHECK (
        precio_base >= 0
        AND precio_venta >= 0
    ),
    CONSTRAINT producto_lista_precio_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT producto_lista_precio_lista_fk
        FOREIGN KEY (lista_precio_id)
        REFERENCES public.lista_precio(id_lista_precio)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- RELACIÓN DE IMPUESTOS DE LISTA
-- ============================================================
-- No se crea una tabla adicional. El impuesto de venta aplicable al
-- producto se obtiene mediante producto_impuesto_venta, mientras
-- producto_lista_precio relaciona PRODUCTO con LISTA_PRECIO.

-- ============================================================
-- 18. PRECIOS
-- Tabla operativa de ChatConnect/n8n; fuera del listado físico del DOC 02.
-- Sin alias "id".
-- ============================================================
CREATE TABLE public.precio (
    id_precio BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    lista_precio_id BIGINT NOT NULL,
    precio NUMERIC(14,2) NOT NULL DEFAULT 0,
    cantidad_minima INTEGER NOT NULL DEFAULT 1,
    cantidad_maxima INTEGER,
    moneda VARCHAR(10) NOT NULL DEFAULT 'COP',
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT precio_precio_check CHECK (precio >= 0),
    CONSTRAINT precio_cantidad_min_check CHECK (cantidad_minima > 0),
    CONSTRAINT precio_rango_check
        CHECK (cantidad_maxima IS NULL OR cantidad_maxima >= cantidad_minima),

    CONSTRAINT precio_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT precio_producto_empresa_fk
        FOREIGN KEY (producto_id, empresa_id)
        REFERENCES public.producto(id_producto, empresa_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT precio_lista_precio_empresa_fk
        FOREIGN KEY (lista_precio_id, empresa_id)
        REFERENCES public.lista_precio(id_lista_precio, empresa_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 19. PRODUCTOS_RETENCIONES
-- DOC 02: id, producto_id, retencion_id, tipo, porcentaje,
-- valor_fijo, cuenta_contable_id, estado.
-- ============================================================
CREATE TABLE public.producto_retencion (
    id_producto_retencion BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    retencion_id BIGINT NOT NULL,
    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN ('PORCENTAJE','VALOR_FIJO')),
    porcentaje NUMERIC(9,4),
    valor_fijo NUMERIC(14,2),
    cuenta_contable_id BIGINT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),

    CONSTRAINT producto_retencion_unique
        UNIQUE (producto_id, retencion_id),
    CONSTRAINT producto_retencion_cuenta_contable_null_check
        CHECK (cuenta_contable_id IS NULL),
    CONSTRAINT producto_retencion_valor_check CHECK (
        (tipo = 'PORCENTAJE'
            AND porcentaje IS NOT NULL
            AND porcentaje >= 0
            AND valor_fijo IS NULL)
        OR
        (tipo = 'VALOR_FIJO'
            AND valor_fijo IS NOT NULL
            AND valor_fijo >= 0
            AND porcentaje IS NULL)
    ),
    CONSTRAINT producto_retencion_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT producto_retencion_retencion_fk
        FOREIGN KEY (retencion_id)
        REFERENCES public.retencion(id_retencion)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 20. PRODUCTOS_REFERENCIAS
-- DOC 02: id, producto_id, referencia, descripcion, estado, created_at.
-- ============================================================
CREATE TABLE public.producto_referencia (
    id_producto_referencia BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    referencia VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_referencia_unique UNIQUE (producto_id, referencia),
    CONSTRAINT producto_referencia_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 21. PRODUCTOS_CODIGOS_BARRAS
-- DOC 02: id, producto_id, codigo_barras, descripcion, principal,
-- estado, created_at.
-- NO se agregan empresa_id, tipo, updated_at ni producto_variante_id.
-- La unicidad por empresa se valida mediante trigger usando producto.empresa_id.
-- ============================================================
CREATE TABLE public.producto_codigo_barras (
    id_producto_codigo_barras BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    codigo_barras VARCHAR(100) NOT NULL,
    descripcion TEXT,
    principal BOOLEAN NOT NULL DEFAULT false,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_codigo_barras_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_producto_codigo_barras_principal
ON public.producto_codigo_barras(producto_id)
WHERE principal = true AND estado = 'activo';

-- ============================================================
-- 22. ATRIBUTOS
-- DOC 02: id, empresa_id, nombre, codigo, descripcion,
-- permite_multiples, genera_variante, obligatorio, estado,
-- created_at, updated_at.
-- ============================================================
CREATE TABLE public.atributo (
    id_atributo BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    permite_multiples BOOLEAN NOT NULL DEFAULT true,
    genera_variante BOOLEAN NOT NULL DEFAULT false,
    obligatorio BOOLEAN NOT NULL DEFAULT false,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT atributo_id_empresa_unique UNIQUE (id_atributo, empresa_id),
    CONSTRAINT atributo_empresa_nombre_unique UNIQUE (empresa_id, nombre),
    CONSTRAINT atributo_empresa_codigo_unique UNIQUE (empresa_id, codigo),
    CONSTRAINT atributo_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 23. ATRIBUTOS_COMPONENTES
-- DOC 02: id, empresa_id, atributo_id, nombre, codigo, valor,
-- descripcion, orden, estado, created_at, updated_at.
-- ============================================================
CREATE TABLE public.atributo_componente (
    id_atributo_componente BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    atributo_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    valor VARCHAR(150),
    descripcion TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT atributo_componente_id_atributo_unique
        UNIQUE (id_atributo_componente, atributo_id),
    CONSTRAINT atributo_componente_atributo_codigo_unique
        UNIQUE (atributo_id, codigo),
    CONSTRAINT atributo_componente_atributo_empresa_fk
        FOREIGN KEY (atributo_id, empresa_id)
        REFERENCES public.atributo(id_atributo, empresa_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 24. PRODUCTOS_ATRIBUTOS
-- DOC 02: id, producto_id, atributo_id, obligatorio, orden,
-- estado, created_at, updated_at.
-- ============================================================
CREATE TABLE public.producto_atributo (
    id_producto_atributo BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    atributo_id BIGINT NOT NULL,
    obligatorio BOOLEAN NOT NULL DEFAULT false,
    orden INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_atributo_unique
        UNIQUE (producto_id, atributo_id),
    CONSTRAINT producto_atributo_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT producto_atributo_atributo_fk
        FOREIGN KEY (atributo_id)
        REFERENCES public.atributo(id_atributo)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 25. PRODUCTOS_ATRIBUTOS_COMPONENTES
-- DOC 02: id, producto_atributo_id, atributo_componente_id,
-- orden, estado, created_at, updated_at.
-- ============================================================
CREATE TABLE public.producto_atributo_componente (
    id_producto_atributo_componente BIGSERIAL PRIMARY KEY,
    producto_atributo_id BIGINT NOT NULL,
    atributo_componente_id BIGINT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_atributo_componente_unique
        UNIQUE (producto_atributo_id, atributo_componente_id),
    CONSTRAINT producto_atributo_componente_producto_atributo_fk
        FOREIGN KEY (producto_atributo_id)
        REFERENCES public.producto_atributo(id_producto_atributo)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT producto_atributo_componente_componente_fk
        FOREIGN KEY (atributo_componente_id)
        REFERENCES public.atributo_componente(id_atributo_componente)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 26. PRODUCTOS_VARIANTES
-- El DOC 02 exige PRODUCTO_VARIANTE y que pueda tener SKU/código,
-- código de barras, precio/referencia e inventario independiente.
-- No enumera una tabla física de campos; se usa el mínimo necesario.
-- ============================================================
CREATE TABLE public.producto_variante (
    id_producto_variante BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    sku VARCHAR(150),
    codigo_barras VARCHAR(100),
    referencia VARCHAR(150),
    precio NUMERIC(14,2),
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_variante_producto_sku_unique
        UNIQUE (producto_id, sku),
    CONSTRAINT producto_variante_producto_codigo_barras_unique
        UNIQUE (producto_id, codigo_barras),
    CONSTRAINT producto_variante_precio_check
        CHECK (precio IS NULL OR precio >= 0),
    CONSTRAINT producto_variante_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 27. VARIANTES_COMPONENTES
-- Entidad requerida por el modelo consolidado.
-- ============================================================
CREATE TABLE public.variante_componente (
    id_variante_componente BIGSERIAL PRIMARY KEY,
    producto_variante_id BIGINT NOT NULL,
    atributo_componente_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT variante_componente_unique
        UNIQUE (producto_variante_id, atributo_componente_id),
    CONSTRAINT variante_componente_variante_fk
        FOREIGN KEY (producto_variante_id)
        REFERENCES public.producto_variante(id_producto_variante)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT variante_componente_componente_fk
        FOREIGN KEY (atributo_componente_id)
        REFERENCES public.atributo_componente(id_atributo_componente)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 28. PRODUCTOS_PROVEEDORES
-- DOC 02: id, producto_id, proveedor_id (desde tercero),
-- referencia_proveedor, principal, created_at, updated_at.
-- ============================================================
CREATE TABLE public.producto_proveedor (
    id_producto_proveedor BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    proveedor_id BIGINT NOT NULL,
    referencia_proveedor VARCHAR(150),
    principal BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_proveedor_unique
        UNIQUE (producto_id, proveedor_id),
    CONSTRAINT producto_proveedor_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT producto_proveedor_tercero_fk
        FOREIGN KEY (proveedor_id)
        REFERENCES public.tercero(id_tercero)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_producto_proveedor_principal
ON public.producto_proveedor(producto_id)
WHERE principal = true;

-- ============================================================
-- 29. PRODUCTOS_IMAGENES
-- DOC 02: id, producto_id, url, nombre, orden, principal,
-- estado, created_at.
-- ============================================================
CREATE TABLE public.producto_imagen (
    id_producto_imagen BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    url TEXT NOT NULL,
    nombre VARCHAR(200),
    orden INTEGER NOT NULL DEFAULT 0,
    principal BOOLEAN NOT NULL DEFAULT false,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_imagen_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_producto_imagen_principal
ON public.producto_imagen(producto_id)
WHERE principal = true AND estado = 'activo';

-- ============================================================
-- 30. PRODUCTOS_SEO_IA
-- DOC 02: campos sugeridos listados explícitamente.
-- ============================================================
CREATE TABLE public.producto_seo_ia (
    id_producto_seo_ia BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    titulo_seo TEXT,
    descripcion_seo TEXT,
    palabras_clave TEXT,
    etiquetas TEXT[],
    sinonimos TEXT,
    texto_busqueda TEXT,
    caracteristicas TEXT,
    usos TEXT,
    publico_objetivo TEXT,
    slug VARCHAR(250),
    indexable BOOLEAN NOT NULL DEFAULT true,
    contenido_ia TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT producto_seo_ia_producto_unique UNIQUE (producto_id),
    CONSTRAINT producto_seo_ia_slug_unique UNIQUE (slug),
    CONSTRAINT producto_seo_ia_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 31. INVENTARIOS
-- El DOC 02 exige control de inventario e inventario independiente por
-- variante, pero no enumera una tabla física. Se conserva la estructura
-- operativa mínima necesaria. No se crea alias "id" ni columna generada
-- "disponible".
-- ============================================================
CREATE TABLE public.inventario (
    id_inventario BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    producto_variante_id BIGINT,
    bodega_id BIGINT,
    existencia INTEGER NOT NULL DEFAULT 0,
    reservado INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT inventario_existencia_check CHECK (existencia >= 0),
    CONSTRAINT inventario_reservado_check CHECK (reservado >= 0),
    CONSTRAINT inventario_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT inventario_producto_empresa_fk
        FOREIGN KEY (producto_id, empresa_id)
        REFERENCES public.producto(id_producto, empresa_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT inventario_variante_fk
        FOREIGN KEY (producto_variante_id)
        REFERENCES public.producto_variante(id_producto_variante)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_inventario_producto_variante_bodega
ON public.inventario(
    empresa_id,
    producto_id,
    COALESCE(producto_variante_id, 0),
    COALESCE(bodega_id, 0)
);

-- ============================================================
-- 32. CANALES
-- Operativo ChatConnect / Meta.
-- ============================================================
CREATE TABLE public.canal (
    id_canal BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    proveedor VARCHAR(50) NOT NULL DEFAULT 'meta',
    phone_number VARCHAR(30),
    phone_number_id VARCHAR(100) NOT NULL,
    waba_id VARCHAR(100),
    business_account_id VARCHAR(100),
    app_id VARCHAR(100),
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    configuracion JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT canal_phone_number_id_unique UNIQUE (phone_number_id),
    CONSTRAINT canal_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 33. CONVERSACIONES
-- ============================================================
CREATE TABLE public.conversacion (
    id_conversacion BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    tercero_id BIGINT NOT NULL,
    canal_id BIGINT NOT NULL,
    external_conversation_id VARCHAR(150),
    estado VARCHAR(40) NOT NULL DEFAULT 'nueva',
    modo VARCHAR(30) NOT NULL DEFAULT 'ia'
        CHECK (modo IN ('ia','humano')),
    agente_humano VARCHAR(150),
    contexto JSONB NOT NULL DEFAULT '{}'::jsonb,
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_ultima_interaccion TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT conversacion_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT conversacion_tercero_empresa_fk
        FOREIGN KEY (tercero_id, empresa_id)
        REFERENCES public.tercero(id_tercero, empresa_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT conversacion_canal_fk
        FOREIGN KEY (canal_id)
        REFERENCES public.canal(id_canal)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 34. MENSAJES
-- ============================================================
CREATE TABLE public.mensaje (
    id_mensaje BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    conversacion_id BIGINT NOT NULL,
    tercero_id BIGINT,
    external_message_id VARCHAR(200) NOT NULL,
    direccion VARCHAR(20) NOT NULL
        CHECK (direccion IN ('inbound','outbound')),
    tipo VARCHAR(30) NOT NULL,
    contenido TEXT,
    media_url TEXT,
    media_mime_type VARCHAR(100),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT mensaje_external_message_id_unique UNIQUE (external_message_id),
    CONSTRAINT mensaje_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT mensaje_conversacion_fk
        FOREIGN KEY (conversacion_id)
        REFERENCES public.conversacion(id_conversacion)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT mensaje_tercero_empresa_fk
        FOREIGN KEY (tercero_id, empresa_id)
        REFERENCES public.tercero(id_tercero, empresa_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ============================================================
-- 35. CARRITOS
-- ============================================================
CREATE TABLE public.carrito (
    id_carrito BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    tercero_id BIGINT NOT NULL,
    conversacion_id BIGINT NOT NULL,
    estado VARCHAR(40) NOT NULL DEFAULT 'activo',
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
    descuento NUMERIC(14,2) NOT NULL DEFAULT 0,
    impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    envio NUMERIC(14,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT carrito_totales_check CHECK (
        subtotal >= 0 AND descuento >= 0 AND impuesto >= 0
        AND envio >= 0 AND total >= 0
    ),
    CONSTRAINT carrito_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT carrito_tercero_empresa_fk
        FOREIGN KEY (tercero_id, empresa_id)
        REFERENCES public.tercero(id_tercero, empresa_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT carrito_conversacion_fk
        FOREIGN KEY (conversacion_id)
        REFERENCES public.conversacion(id_conversacion)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 36. CARRITOS_DETALLES
-- ============================================================
CREATE TABLE public.carrito_detalle (
    id_carrito_detalle BIGSERIAL PRIMARY KEY,
    carrito_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(14,2) NOT NULL,
    descuento NUMERIC(14,2) NOT NULL DEFAULT 0,
    impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) NOT NULL,
    nota TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT carrito_detalle_cantidad_check CHECK (cantidad > 0),
    CONSTRAINT carrito_detalle_valores_check CHECK (
        precio_unitario >= 0 AND descuento >= 0
        AND impuesto >= 0 AND total >= 0
    ),
    CONSTRAINT carrito_detalle_carrito_fk
        FOREIGN KEY (carrito_id)
        REFERENCES public.carrito(id_carrito)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT carrito_detalle_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 37. PEDIDOS
-- ============================================================
CREATE TABLE public.pedido (
    id_pedido BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    tercero_id BIGINT NOT NULL,
    conversacion_id BIGINT,
    numero_pedido VARCHAR(50) NOT NULL,
    tipo_entrega VARCHAR(30),
    direccion_entrega TEXT,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    punto_venta_id BIGINT,
    fecha_entrega DATE,
    hora_entrega TIME,
    fecha_recogida DATE,
    hora_recogida TIME,
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
    descuento NUMERIC(14,2) NOT NULL DEFAULT 0,
    impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    envio NUMERIC(14,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    estado VARCHAR(40) NOT NULL DEFAULT 'pendiente',
    nota TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pedido_numero_pedido_unique UNIQUE (numero_pedido),
    CONSTRAINT pedido_totales_check CHECK (
        subtotal >= 0 AND descuento >= 0 AND impuesto >= 0
        AND envio >= 0 AND total >= 0
    ),
    CONSTRAINT pedido_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pedido_tercero_empresa_fk
        FOREIGN KEY (tercero_id, empresa_id)
        REFERENCES public.tercero(id_tercero, empresa_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pedido_conversacion_fk
        FOREIGN KEY (conversacion_id)
        REFERENCES public.conversacion(id_conversacion)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ============================================================
-- 38. PEDIDOS_DETALLES
-- ============================================================
CREATE TABLE public.pedido_detalle (
    id_pedido_detalle BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(14,2) NOT NULL,
    descuento NUMERIC(14,2) NOT NULL DEFAULT 0,
    impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) NOT NULL,
    nota TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pedido_detalle_cantidad_check CHECK (cantidad > 0),
    CONSTRAINT pedido_detalle_valores_check CHECK (
        precio_unitario >= 0 AND descuento >= 0
        AND impuesto >= 0 AND total >= 0
    ),
    CONSTRAINT pedido_detalle_pedido_fk
        FOREIGN KEY (pedido_id)
        REFERENCES public.pedido(id_pedido)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pedido_detalle_producto_fk
        FOREIGN KEY (producto_id)
        REFERENCES public.producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 38.1. PEDIDO_DETALLE_IMPUESTO
-- ============================================================
CREATE TABLE public.pedido_detalle_impuesto (
    id_pedido_detalle_impuesto BIGSERIAL PRIMARY KEY,
    pedido_detalle_id BIGINT NOT NULL,
    impuesto_id BIGINT NOT NULL,
    nombre_impuesto VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'PORCENTAJE',
    porcentaje NUMERIC(9,4) NULL,
    valor_fijo NUMERIC(14,2) NULL,
    base_impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    valor_impuesto NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pedido_detalle_impuesto_valores_check CHECK (
        base_impuesto >= 0 AND valor_impuesto >= 0
    ),
    CONSTRAINT pedido_detalle_impuesto_pedido_detalle_fk
        FOREIGN KEY (pedido_detalle_id)
        REFERENCES public.pedido_detalle(id_pedido_detalle)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pedido_detalle_impuesto_impuesto_fk
        FOREIGN KEY (impuesto_id)
        REFERENCES public.impuesto(id_impuesto)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- 39. PEDIDOS_ESTADOS
-- ============================================================
CREATE TABLE public.pedido_estado (
    id_pedido_estado BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    estado VARCHAR(40) NOT NULL,
    comentario TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pedido_estado_pedido_fk
        FOREIGN KEY (pedido_id)
        REFERENCES public.pedido(id_pedido)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 40. PROCESAMIENTOS_IA
-- ============================================================
CREATE TABLE public.procesamiento_ia (
    id_procesamiento_ia BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    conversacion_id BIGINT,
    mensaje_id BIGINT,
    modelo VARCHAR(100),
    intent VARCHAR(100),
    input TEXT,
    output JSONB,
    tokens_input INTEGER,
    tokens_output INTEGER,
    latencia INTEGER,
    estado VARCHAR(30) NOT NULL DEFAULT 'ok',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT procesamiento_ia_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT procesamiento_ia_conversacion_fk
        FOREIGN KEY (conversacion_id)
        REFERENCES public.conversacion(id_conversacion)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT procesamiento_ia_mensaje_fk
        FOREIGN KEY (mensaje_id)
        REFERENCES public.mensaje(id_mensaje)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ============================================================
-- 41. EVENTOS_WEBHOOK
-- ============================================================
CREATE TABLE public.evento_webhook (
    id_evento_webhook BIGSERIAL PRIMARY KEY,
    proveedor VARCHAR(50) NOT NULL DEFAULT 'meta',
    evento VARCHAR(100),
    external_id VARCHAR(250),
    payload JSONB NOT NULL,
    procesado BOOLEAN NOT NULL DEFAULT false,
    fecha_recepcion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_procesamiento TIMESTAMPTZ,
    error TEXT,

    CONSTRAINT evento_webhook_external_id_unique UNIQUE (external_id)
);

-- ============================================================
-- 42. ERRORES_INTEGRACION
-- ============================================================
CREATE TABLE public.error_integracion (
    id_error_integracion BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT,
    workflow VARCHAR(150),
    tipo VARCHAR(100),
    mensaje TEXT,
    detalle JSONB,
    resuelto BOOLEAN NOT NULL DEFAULT false,
    intentos INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT error_integracion_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ============================================================
-- 43. USUARIOS
-- ============================================================
CREATE TABLE public.usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    ultimo_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT usuario_empresa_email_unique UNIQUE (empresa_id, email),
    CONSTRAINT usuario_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 44. AUDITORIAS
-- DOC 02 exige: usuario, empresa, fecha, operacion,
-- registro afectado, datos anteriores y datos nuevos.
-- ============================================================
CREATE TABLE public.auditoria (
    id_auditoria BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    usuario TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
    operacion VARCHAR(100) NOT NULL,
    registro_afectado TEXT NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,

    CONSTRAINT auditoria_empresa_fk
        FOREIGN KEY (empresa_id)
        REFERENCES public.empresa(id_empresa)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================
-- 45. FUNCIONES Y REGLAS DEL DOC 02
-- ============================================================

-- ------------------------------------------------------------
-- 45.1 Código interno automático y atómico
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generar_codigo_producto(p_empresa_id BIGINT)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    v_prefijo VARCHAR(50);
    v_longitud INTEGER;
    v_consecutivo BIGINT;
BEGIN
    UPDATE public.secuencia
       SET consecutivo_actual = consecutivo_actual + 1
     WHERE empresa_id = p_empresa_id
       AND UPPER(modulo) IN ('PRODUCTO','PRODUCTOS')
       AND estado = 'activo'
     RETURNING prefijo, longitud, consecutivo_actual
          INTO v_prefijo, v_longitud, v_consecutivo;

    IF v_consecutivo IS NULL THEN
        RAISE EXCEPTION
            'No existe secuencia activa para PRODUCTO(S) en la empresa %',
            p_empresa_id;
    END IF;

    RETURN COALESCE(v_prefijo,'')
        || LPAD(v_consecutivo::TEXT, v_longitud, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.asignar_codigo_interno_producto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.codigo_interno IS NULL OR BTRIM(NEW.codigo_interno) = '' THEN
        NEW.codigo_interno :=
            public.generar_codigo_producto(NEW.empresa_id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_asignar_codigo_interno_producto
BEFORE INSERT ON public.producto
FOR EACH ROW
EXECUTE FUNCTION public.asignar_codigo_interno_producto();

-- ------------------------------------------------------------
-- 45.2 Validación de producto y subcategoría
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_producto_multiempresa()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_categoria_obligatoria BOOLEAN;
BEGIN
    SELECT categoria_producto_obligatoria
      INTO v_categoria_obligatoria
      FROM public.empresa
     WHERE id_empresa = NEW.empresa_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La empresa % no existe', NEW.empresa_id;
    END IF;

    IF v_categoria_obligatoria AND NEW.categoria_id IS NULL THEN
        RAISE EXCEPTION
            'La categoría es obligatoria para la empresa %', NEW.empresa_id;
    END IF;

    IF NEW.subcategoria_id IS NOT NULL THEN
        IF NEW.categoria_id IS NULL THEN
            RAISE EXCEPTION 'No se puede asignar subcategoría sin categoría';
        END IF;

        IF NOT EXISTS (
            SELECT 1
              FROM public.subcategoria s
             WHERE s.id_subcategoria = NEW.subcategoria_id
               AND s.categoria_id = NEW.categoria_id
               AND s.empresa_id = NEW.empresa_id
        ) THEN
            RAISE EXCEPTION
                'La subcategoría no pertenece a la categoría/empresa';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_producto_multiempresa
BEFORE INSERT OR UPDATE OF
    empresa_id, categoria_id, subcategoria_id, marca_id,
    tipo_inventario_id, medida_id
ON public.producto
FOR EACH ROW
EXECUTE FUNCTION public.validar_producto_multiempresa();

-- ------------------------------------------------------------
-- 45.3 Utilidad según fórmula principal del DOC 02
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calcular_utilidad_producto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.utilidad_valor := NEW.precio_base - NEW.costo_base;

    IF NEW.costo_base IS NULL OR NEW.costo_base = 0 THEN
        NEW.utilidad_porcentaje := 0;
    ELSE
        NEW.utilidad_porcentaje :=
            ((NEW.precio_base - NEW.costo_base) / NEW.costo_base) * 100;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calcular_utilidad_producto
BEFORE INSERT OR UPDATE OF precio_base, costo_base
ON public.producto
FOR EACH ROW
EXECUTE FUNCTION public.calcular_utilidad_producto();

-- ------------------------------------------------------------
-- 45.4 Impuesto y producto deben pertenecer a la misma empresa
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_empresa_producto_impuesto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_empresa_producto BIGINT;
    v_empresa_impuesto BIGINT;
BEGIN
    SELECT empresa_id INTO v_empresa_producto
    FROM public.producto
    WHERE id_producto = NEW.producto_id;

    SELECT empresa_id INTO v_empresa_impuesto
    FROM public.impuesto
    WHERE id_impuesto = NEW.impuesto_id;

    IF v_empresa_producto IS NULL
       OR v_empresa_impuesto IS NULL
       OR v_empresa_producto <> v_empresa_impuesto THEN
        RAISE EXCEPTION
            'Producto e impuesto deben pertenecer a la misma empresa';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_producto_impuesto_compra
BEFORE INSERT OR UPDATE ON public.producto_impuesto_compra
FOR EACH ROW
EXECUTE FUNCTION public.validar_empresa_producto_impuesto();

CREATE TRIGGER trg_validar_producto_impuesto_venta
BEFORE INSERT OR UPDATE ON public.producto_impuesto_venta
FOR EACH ROW
EXECUTE FUNCTION public.validar_empresa_producto_impuesto();

-- ------------------------------------------------------------
-- 45.5 Producto y lista de precio de la misma empresa
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_empresa_producto_lista_precio()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_empresa_producto BIGINT;
    v_empresa_lista BIGINT;
BEGIN
    SELECT empresa_id INTO v_empresa_producto
    FROM public.producto
    WHERE id_producto = NEW.producto_id;

    SELECT empresa_id INTO v_empresa_lista
    FROM public.lista_precio
    WHERE id_lista_precio = NEW.lista_precio_id;

    IF v_empresa_producto IS NULL
       OR v_empresa_lista IS NULL
       OR v_empresa_producto <> v_empresa_lista THEN
        RAISE EXCEPTION
            'Producto y lista de precio deben pertenecer a la misma empresa';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_producto_lista_precio
BEFORE INSERT OR UPDATE ON public.producto_lista_precio
FOR EACH ROW
EXECUTE FUNCTION public.validar_empresa_producto_lista_precio();


-- ------------------------------------------------------------
-- 45.7 Producto y retención de la misma empresa
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_empresa_producto_retencion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_empresa_producto BIGINT;
    v_empresa_retencion BIGINT;
BEGIN
    SELECT empresa_id INTO v_empresa_producto
    FROM public.producto
    WHERE id_producto = NEW.producto_id;

    SELECT empresa_id INTO v_empresa_retencion
    FROM public.retencion
    WHERE id_retencion = NEW.retencion_id;

    IF v_empresa_producto IS NULL
       OR v_empresa_retencion IS NULL
       OR v_empresa_producto <> v_empresa_retencion THEN
        RAISE EXCEPTION
            'Producto y retención deben pertenecer a la misma empresa';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_producto_retencion
BEFORE INSERT OR UPDATE ON public.producto_retencion
FOR EACH ROW
EXECUTE FUNCTION public.validar_empresa_producto_retencion();

-- ------------------------------------------------------------
-- 45.8 Código de barras único dentro de la empresa
-- Sin agregar empresa_id a producto_codigo_barras.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_codigo_barras_empresa()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_empresa_id BIGINT;
BEGIN
    SELECT empresa_id
      INTO v_empresa_id
      FROM public.producto
     WHERE id_producto = NEW.producto_id;

    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'Producto inexistente';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM public.producto_codigo_barras pcb
          JOIN public.producto p
            ON p.id_producto = pcb.producto_id
         WHERE p.empresa_id = v_empresa_id
           AND pcb.codigo_barras = NEW.codigo_barras
           AND pcb.id_producto_codigo_barras
               <> COALESCE(NEW.id_producto_codigo_barras, -1)
    )
    OR EXISTS (
        SELECT 1
          FROM public.producto_variante pv
          JOIN public.producto p
            ON p.id_producto = pv.producto_id
         WHERE p.empresa_id = v_empresa_id
           AND pv.codigo_barras = NEW.codigo_barras
    ) THEN
        RAISE EXCEPTION
            'El código de barras % ya existe en la empresa %',
            NEW.codigo_barras, v_empresa_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_codigo_barras_empresa
BEFORE INSERT OR UPDATE OF producto_id, codigo_barras
ON public.producto_codigo_barras
FOR EACH ROW
EXECUTE FUNCTION public.validar_codigo_barras_empresa();

-- ------------------------------------------------------------
-- 45.9 Producto y atributo de la misma empresa
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_empresa_producto_atributo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_empresa_producto BIGINT;
    v_empresa_atributo BIGINT;
BEGIN
    SELECT empresa_id INTO v_empresa_producto
    FROM public.producto
    WHERE id_producto = NEW.producto_id;

    SELECT empresa_id INTO v_empresa_atributo
    FROM public.atributo
    WHERE id_atributo = NEW.atributo_id;

    IF v_empresa_producto IS NULL
       OR v_empresa_atributo IS NULL
       OR v_empresa_producto <> v_empresa_atributo THEN
        RAISE EXCEPTION
            'Producto y atributo deben pertenecer a la misma empresa';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_producto_atributo_empresa
BEFORE INSERT OR UPDATE ON public.producto_atributo
FOR EACH ROW
EXECUTE FUNCTION public.validar_empresa_producto_atributo();

-- ------------------------------------------------------------
-- 45.10 Regla crítica atributo-componente
-- PRODUCTO_ATRIBUTO.atributo_id = ATRIBUTO_COMPONENTE.atributo_id
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_producto_atributo_componente()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_atributo_producto BIGINT;
    v_atributo_componente BIGINT;
BEGIN
    SELECT atributo_id
      INTO v_atributo_producto
      FROM public.producto_atributo
     WHERE id_producto_atributo = NEW.producto_atributo_id;

    SELECT atributo_id
      INTO v_atributo_componente
      FROM public.atributo_componente
     WHERE id_atributo_componente = NEW.atributo_componente_id;

    IF v_atributo_producto IS NULL OR v_atributo_componente IS NULL THEN
        RAISE EXCEPTION 'Producto-atributo o componente inexistente';
    END IF;

    IF v_atributo_producto <> v_atributo_componente THEN
        RAISE EXCEPTION
            'El componente no pertenece al atributo asignado al producto';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_producto_atributo_componente
BEFORE INSERT OR UPDATE ON public.producto_atributo_componente
FOR EACH ROW
EXECUTE FUNCTION public.validar_producto_atributo_componente();

-- ------------------------------------------------------------
-- 45.11 Proveedor debe ser TERCERO proveedor/ambos de la misma empresa
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_empresa_producto_proveedor()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_empresa_producto BIGINT;
    v_empresa_proveedor BIGINT;
    v_tipo_tercero VARCHAR(30);
BEGIN
    SELECT empresa_id INTO v_empresa_producto
    FROM public.producto
    WHERE id_producto = NEW.producto_id;

    SELECT empresa_id, tipo_tercero
      INTO v_empresa_proveedor, v_tipo_tercero
      FROM public.tercero
     WHERE id_tercero = NEW.proveedor_id;

    IF v_empresa_producto IS NULL
       OR v_empresa_proveedor IS NULL
       OR v_empresa_producto <> v_empresa_proveedor THEN
        RAISE EXCEPTION
            'Producto y proveedor deben pertenecer a la misma empresa';
    END IF;

    IF v_tipo_tercero NOT IN ('proveedor','ambos') THEN
        RAISE EXCEPTION
            'El tercero seleccionado no está configurado como proveedor';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_producto_proveedor
BEFORE INSERT OR UPDATE ON public.producto_proveedor
FOR EACH ROW
EXECUTE FUNCTION public.validar_empresa_producto_proveedor();

-- ------------------------------------------------------------
-- 45.12 Código de barras de variante único dentro de la empresa
-- RN-23: una variante puede tener código/SKU y código de barras propio.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_codigo_barras_variante_empresa()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_empresa_id BIGINT;
BEGIN
    IF NEW.codigo_barras IS NULL OR BTRIM(NEW.codigo_barras) = '' THEN
        RETURN NEW;
    END IF;

    SELECT p.empresa_id
      INTO v_empresa_id
      FROM public.producto p
     WHERE p.id_producto = NEW.producto_id;

    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'Producto inexistente para la variante';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM public.producto_codigo_barras pcb
          JOIN public.producto p
            ON p.id_producto = pcb.producto_id
         WHERE p.empresa_id = v_empresa_id
           AND pcb.codigo_barras = NEW.codigo_barras
    )
    OR EXISTS (
        SELECT 1
          FROM public.producto_variante pv
          JOIN public.producto p
            ON p.id_producto = pv.producto_id
         WHERE p.empresa_id = v_empresa_id
           AND pv.codigo_barras = NEW.codigo_barras
           AND pv.id_producto_variante
               <> COALESCE(NEW.id_producto_variante, -1)
    ) THEN
        RAISE EXCEPTION
            'El código de barras de variante % ya existe en la empresa %',
            NEW.codigo_barras, v_empresa_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_codigo_barras_variante_empresa
BEFORE INSERT OR UPDATE OF producto_id, codigo_barras
ON public.producto_variante
FOR EACH ROW
EXECUTE FUNCTION public.validar_codigo_barras_variante_empresa();

-- ------------------------------------------------------------
-- 45.13 Variantes: solo componentes configurados para generar variante
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_componente_variante()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_producto_id BIGINT;
    v_atributo_id BIGINT;
BEGIN
    SELECT producto_id
      INTO v_producto_id
      FROM public.producto_variante
     WHERE id_producto_variante = NEW.producto_variante_id;

    SELECT atributo_id
      INTO v_atributo_id
      FROM public.atributo_componente
     WHERE id_atributo_componente = NEW.atributo_componente_id;

    IF v_producto_id IS NULL OR v_atributo_id IS NULL THEN
        RAISE EXCEPTION 'Variante o componente inexistente';
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM public.producto_atributo pa
          JOIN public.atributo a
            ON a.id_atributo = pa.atributo_id
           AND a.genera_variante = true
           AND a.estado = 'activo'
          JOIN public.producto_atributo_componente pac
            ON pac.producto_atributo_id = pa.id_producto_atributo
           AND pac.atributo_componente_id = NEW.atributo_componente_id
           AND pac.estado = 'activo'
         WHERE pa.producto_id = v_producto_id
           AND pa.atributo_id = v_atributo_id
           AND pa.estado = 'activo'
    ) THEN
        RAISE EXCEPTION
            'El componente no está habilitado para generar variantes de este producto';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM public.variante_componente vc
          JOIN public.atributo_componente ac
            ON ac.id_atributo_componente = vc.atributo_componente_id
         WHERE vc.producto_variante_id = NEW.producto_variante_id
           AND ac.atributo_id = v_atributo_id
           AND vc.id_variante_componente
               <> COALESCE(NEW.id_variante_componente, -1)
    ) THEN
        RAISE EXCEPTION
            'Una variante no puede tener dos componentes del mismo atributo';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_variante_componente
BEFORE INSERT OR UPDATE ON public.variante_componente
FOR EACH ROW
EXECUTE FUNCTION public.validar_componente_variante();

-- ------------------------------------------------------------
-- 45.14 Inventario de variante debe pertenecer al mismo producto
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_inventario_variante_producto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.producto_variante_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
          FROM public.producto_variante pv
         WHERE pv.id_producto_variante = NEW.producto_variante_id
           AND pv.producto_id = NEW.producto_id
    ) THEN
        RAISE EXCEPTION
            'La variante no pertenece al producto indicado en inventario';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_inventario_variante_producto
BEFORE INSERT OR UPDATE OF producto_id, producto_variante_id
ON public.inventario
FOR EACH ROW
EXECUTE FUNCTION public.validar_inventario_variante_producto();

-- ------------------------------------------------------------
-- 45.15 Sumatoria automática de impuestos en pedido_detalle
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.actualizar_impuesto_pedido_detalle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_detalle_id BIGINT;
    v_total_impuestos NUMERIC(14,2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_detalle_id := OLD.pedido_detalle_id;
    ELSE
        v_detalle_id := NEW.pedido_detalle_id;
    END IF;

    SELECT COALESCE(SUM(valor_impuesto), 0)
      INTO v_total_impuestos
      FROM public.pedido_detalle_impuesto
     WHERE pedido_detalle_id = v_detalle_id;

    UPDATE public.pedido_detalle
       SET impuesto = v_total_impuestos,
           total = (cantidad * precio_unitario) - descuento + v_total_impuestos
     WHERE id_pedido_detalle = v_detalle_id;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_actualizar_impuesto_pedido_detalle
AFTER INSERT OR UPDATE OR DELETE ON public.pedido_detalle_impuesto
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_impuesto_pedido_detalle();

-- ------------------------------------------------------------
-- 45.16 Validar pertenencia de impuesto y pedido a la misma empresa
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_empresa_pedido_detalle_impuesto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_empresa_pedido BIGINT;
    v_empresa_impuesto BIGINT;
BEGIN
    SELECT p.empresa_id INTO v_empresa_pedido
      FROM public.pedido_detalle pd
      JOIN public.pedido p ON p.id_pedido = pd.pedido_id
     WHERE pd.id_pedido_detalle = NEW.pedido_detalle_id;

    SELECT empresa_id INTO v_empresa_impuesto
      FROM public.impuesto
     WHERE id_impuesto = NEW.impuesto_id;

    IF v_empresa_pedido IS NOT NULL AND v_empresa_impuesto IS NOT NULL
       AND v_empresa_pedido <> v_empresa_impuesto THEN
        RAISE EXCEPTION 'El impuesto y el pedido deben pertenecer a la misma empresa';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_pedido_detalle_impuesto_empresa
BEFORE INSERT OR UPDATE ON public.pedido_detalle_impuesto
FOR EACH ROW
EXECUTE FUNCTION public.validar_empresa_pedido_detalle_impuesto();

-- ============================================================
-- 46. INDICES RECOMENDADOS POR EL DOC 02
-- ============================================================
CREATE INDEX idx_producto_empresa
    ON public.producto(empresa_id);
CREATE INDEX idx_producto_codigo_interno
    ON public.producto(codigo_interno);
CREATE INDEX idx_producto_nombre
    ON public.producto(nombre);
CREATE INDEX idx_producto_categoria
    ON public.producto(categoria_id);
CREATE INDEX idx_producto_subcategoria
    ON public.producto(subcategoria_id);
CREATE INDEX idx_producto_marca
    ON public.producto(marca_id);
CREATE INDEX idx_producto_estado
    ON public.producto(estado_producto);

CREATE INDEX idx_producto_atributo_producto
    ON public.producto_atributo(producto_id);
CREATE INDEX idx_producto_atributo_atributo
    ON public.producto_atributo(atributo_id);
CREATE INDEX idx_atributo_componente_atributo
    ON public.atributo_componente(atributo_id);
CREATE INDEX idx_producto_atributo_componente_pa
    ON public.producto_atributo_componente(producto_atributo_id);
CREATE INDEX idx_producto_atributo_componente_ac
    ON public.producto_atributo_componente(atributo_componente_id);
CREATE INDEX idx_producto_codigo_barras_codigo
    ON public.producto_codigo_barras(codigo_barras);
CREATE INDEX idx_producto_referencia_referencia
    ON public.producto_referencia(referencia);

CREATE INDEX idx_producto_variante_producto
    ON public.producto_variante(producto_id);
CREATE INDEX idx_variante_componente_variante
    ON public.variante_componente(producto_variante_id);
CREATE INDEX idx_inventario_producto
    ON public.inventario(producto_id);
CREATE INDEX idx_inventario_variante
    ON public.inventario(producto_variante_id);

CREATE INDEX idx_pedido_detalle_impuesto_detalle
    ON public.pedido_detalle_impuesto(pedido_detalle_id);
CREATE INDEX idx_pedido_detalle_impuesto_impuesto
    ON public.pedido_detalle_impuesto(impuesto_id);

-- ============================================================
-- 47. AUDITORIA
-- ============================================================
CREATE OR REPLACE FUNCTION public.registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row JSONB;
    v_old JSONB;
    v_new JSONB;
    v_empresa_id BIGINT;
    v_producto_id BIGINT;
    v_operacion VARCHAR(100);
    v_registro TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_row := to_jsonb(OLD);
        v_old := to_jsonb(OLD);
        v_new := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        v_row := to_jsonb(NEW);
        v_old := NULL;
        v_new := to_jsonb(NEW);
    ELSE
        v_row := to_jsonb(NEW);
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    END IF;

    v_empresa_id := NULLIF(v_row ->> 'empresa_id','')::BIGINT;

    IF v_empresa_id IS NULL THEN
        v_producto_id := NULLIF(v_row ->> 'producto_id','')::BIGINT;

        IF v_producto_id IS NULL
           AND (v_row ? 'producto_atributo_id') THEN
            SELECT pa.producto_id
              INTO v_producto_id
              FROM public.producto_atributo pa
             WHERE pa.id_producto_atributo =
                   NULLIF(v_row ->> 'producto_atributo_id','')::BIGINT;
        END IF;

        IF v_producto_id IS NULL
           AND (v_row ? 'producto_variante_id') THEN
            SELECT pv.producto_id
              INTO v_producto_id
              FROM public.producto_variante pv
             WHERE pv.id_producto_variante =
                   NULLIF(v_row ->> 'producto_variante_id','')::BIGINT;
        END IF;

        IF v_producto_id IS NOT NULL THEN
            SELECT p.empresa_id
              INTO v_empresa_id
              FROM public.producto p
             WHERE p.id_producto = v_producto_id;
        END IF;
    END IF;

    IF v_empresa_id IS NULL AND (v_row ? 'lista_precio_id') THEN
        SELECT lp.empresa_id
          INTO v_empresa_id
          FROM public.lista_precio lp
         WHERE lp.id_lista_precio =
               NULLIF(v_row ->> 'lista_precio_id','')::BIGINT;
    END IF;

    IF v_empresa_id IS NULL THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    v_operacion :=
        CASE
            WHEN TG_TABLE_NAME = 'producto' AND TG_OP = 'INSERT'
                THEN 'PRODUCTO_CREADO'
            WHEN TG_TABLE_NAME = 'producto' AND TG_OP = 'UPDATE'
                 AND (v_old ->> 'estado_producto') IS DISTINCT FROM (v_new ->> 'estado_producto')
                 AND (v_new ->> 'estado_producto') = 'activo'
                THEN 'PRODUCTO_ACTIVADO'
            WHEN TG_TABLE_NAME = 'producto' AND TG_OP = 'UPDATE'
                 AND (v_old ->> 'estado_producto') IS DISTINCT FROM (v_new ->> 'estado_producto')
                 AND (v_new ->> 'estado_producto') = 'inactivo'
                THEN 'PRODUCTO_INACTIVADO'
            WHEN TG_TABLE_NAME = 'producto' AND TG_OP = 'UPDATE'
                 AND (v_old ->> 'estado_publicacion') IS DISTINCT FROM (v_new ->> 'estado_publicacion')
                 AND (v_new ->> 'estado_publicacion') = 'publicado'
                THEN 'PRODUCTO_PUBLICADO'
            WHEN TG_TABLE_NAME = 'producto' AND TG_OP = 'UPDATE'
                 AND (v_old ->> 'estado_publicacion') IS DISTINCT FROM (v_new ->> 'estado_publicacion')
                 AND (v_new ->> 'estado_publicacion') = 'no_publicado'
                THEN 'PRODUCTO_DESPUBLICADO'
            WHEN TG_TABLE_NAME = 'producto' AND TG_OP = 'UPDATE'
                 AND ((v_old ->> 'precio_base'), (v_old ->> 'precio_impuesto'))
                     IS DISTINCT FROM
                     ((v_new ->> 'precio_base'), (v_new ->> 'precio_impuesto'))
                THEN 'PRECIO_MODIFICADO'
            WHEN TG_TABLE_NAME = 'producto' AND TG_OP = 'UPDATE'
                 AND ((v_old ->> 'costo_base'), (v_old ->> 'costo_impuesto'))
                     IS DISTINCT FROM
                     ((v_new ->> 'costo_base'), (v_new ->> 'costo_impuesto'))
                THEN 'COSTO_MODIFICADO'
            WHEN TG_TABLE_NAME = 'producto'
                THEN 'PRODUCTO_MODIFICADO'
            WHEN TG_TABLE_NAME IN (
                    'producto_impuesto_compra',
                    'producto_impuesto_venta'
                 )
                THEN 'IMPUESTO_MODIFICADO'
            WHEN TG_TABLE_NAME = 'inventario'
                THEN 'INVENTARIO_MODIFICADO'
            WHEN TG_TABLE_NAME = 'producto_atributo'
                 AND TG_OP = 'INSERT'
                THEN 'ATRIBUTO_ASIGNADO'
            WHEN TG_TABLE_NAME = 'producto_atributo_componente'
                 AND TG_OP = 'INSERT'
                THEN 'COMPONENTE_ASIGNADO'
            WHEN TG_TABLE_NAME = 'producto_atributo_componente'
                 AND TG_OP = 'DELETE'
                THEN 'COMPONENTE_RETIRADO'
            WHEN TG_TABLE_NAME = 'producto_referencia'
                 AND TG_OP = 'INSERT'
                THEN 'REFERENCIA_AGREGADA'
            WHEN TG_TABLE_NAME = 'producto_codigo_barras'
                 AND TG_OP = 'INSERT'
                THEN 'CODIGO_BARRAS_AGREGADO'
            WHEN TG_TABLE_NAME = 'producto_proveedor'
                 AND TG_OP = 'INSERT'
                THEN 'PROVEEDOR_ASIGNADO'
            WHEN TG_TABLE_NAME = 'producto_imagen'
                 AND TG_OP = 'INSERT'
                THEN 'IMAGEN_AGREGADA'
            WHEN TG_TABLE_NAME = 'producto_variante'
                 AND TG_OP = 'INSERT'
                THEN 'VARIANTE_CREADA'
            WHEN TG_TABLE_NAME = 'producto_variante'
                THEN 'VARIANTE_MODIFICADA'
            ELSE UPPER(TG_TABLE_NAME || '_' || TG_OP)
        END;

    SELECT key || '=' || value
      INTO v_registro
      FROM jsonb_each_text(v_row)
     WHERE key ~ '^id_'
     ORDER BY key
     LIMIT 1;

    INSERT INTO public.auditoria (
        empresa_id,
        usuario,
        fecha,
        operacion,
        registro_afectado,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        v_empresa_id,
        COALESCE(NULLIF(current_setting('app.current_usuario', true), ''), current_user),
        now(),
        v_operacion,
        COALESCE(v_registro, TG_TABLE_NAME),
        v_old,
        v_new
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

CREATE TRIGGER trg_aud_producto
AFTER INSERT OR UPDATE OR DELETE ON public.producto
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_impuesto_compra
AFTER INSERT OR UPDATE OR DELETE ON public.producto_impuesto_compra
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_impuesto_venta
AFTER INSERT OR UPDATE OR DELETE ON public.producto_impuesto_venta
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_lista_precio
AFTER INSERT OR UPDATE OR DELETE ON public.producto_lista_precio
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_retencion
AFTER INSERT OR UPDATE OR DELETE ON public.producto_retencion
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_referencia
AFTER INSERT OR UPDATE OR DELETE ON public.producto_referencia
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_codigo_barras
AFTER INSERT OR UPDATE OR DELETE ON public.producto_codigo_barras
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_atributo
AFTER INSERT OR UPDATE OR DELETE ON public.producto_atributo
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_atributo_componente
AFTER INSERT OR UPDATE OR DELETE ON public.producto_atributo_componente
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_variante
AFTER INSERT OR UPDATE OR DELETE ON public.producto_variante
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_proveedor
AFTER INSERT OR UPDATE OR DELETE ON public.producto_proveedor
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_producto_imagen
AFTER INSERT OR UPDATE OR DELETE ON public.producto_imagen
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

CREATE TRIGGER trg_aud_inventario
AFTER INSERT OR UPDATE OR DELETE ON public.inventario
FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria();

-- ============================================================
-- 48. RLS / AISLAMIENTO MULTIEMPRESA
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_empresa_id()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
    SELECT NULLIF(current_setting('app.current_empresa_id', true), '')::BIGINT
$$;

ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secuencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impuesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retencion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_precio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tercero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atributo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atributo_componente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procesamiento_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_integracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY empresa_por_empresa ON public.empresa
USING (id_empresa = public.current_empresa_id())
WITH CHECK (id_empresa = public.current_empresa_id());

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'categoria','subcategoria','marca','secuencia','impuesto',
        'retencion','lista_precio','tipo_inventario','medida'
        ,'tercero','producto','atributo',
        'atributo_componente','precio','inventario','canal',
        'conversacion','mensaje','carrito','pedido',
        'procesamiento_ia','error_integracion','usuario','auditoria'
    ]
    LOOP
        EXECUTE format(
            'CREATE POLICY %I ON public.%I
             USING (empresa_id = public.current_empresa_id())
             WITH CHECK (empresa_id = public.current_empresa_id())',
            t || '_por_empresa',
            t
        );
    END LOOP;
END;
$$;

-- RLS para relaciones de producto sin empresa_id físico.
ALTER TABLE public.producto_impuesto_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_impuesto_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_lista_precio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_retencion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_referencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_codigo_barras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_atributo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_atributo_componente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_variante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variante_componente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_imagen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_seo_ia ENABLE ROW LEVEL SECURITY;
CREATE POLICY producto_impuesto_compra_por_empresa
ON public.producto_impuesto_compra
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_impuesto_venta_por_empresa
ON public.producto_impuesto_venta
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_lista_precio_por_empresa
ON public.producto_lista_precio
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_retencion_por_empresa
ON public.producto_retencion
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_referencia_por_empresa
ON public.producto_referencia
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_codigo_barras_por_empresa
ON public.producto_codigo_barras
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_atributo_por_empresa
ON public.producto_atributo
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_atributo_componente_por_empresa
ON public.producto_atributo_componente
USING (EXISTS (
    SELECT 1
    FROM public.producto_atributo pa
    JOIN public.producto p
      ON p.id_producto = pa.producto_id
    WHERE pa.id_producto_atributo = producto_atributo_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1
    FROM public.producto_atributo pa
    JOIN public.producto p
      ON p.id_producto = pa.producto_id
    WHERE pa.id_producto_atributo = producto_atributo_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_variante_por_empresa
ON public.producto_variante
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY variante_componente_por_empresa
ON public.variante_componente
USING (EXISTS (
    SELECT 1
    FROM public.producto_variante pv
    JOIN public.producto p
      ON p.id_producto = pv.producto_id
    WHERE pv.id_producto_variante = producto_variante_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1
    FROM public.producto_variante pv
    JOIN public.producto p
      ON p.id_producto = pv.producto_id
    WHERE pv.id_producto_variante = producto_variante_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_proveedor_por_empresa
ON public.producto_proveedor
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_imagen_por_empresa
ON public.producto_imagen
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY producto_seo_ia_por_empresa
ON public.producto_seo_ia
USING (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = producto_id
      AND p.empresa_id = public.current_empresa_id()
));

-- RLS para pedido_detalle y pedido_detalle_impuesto
ALTER TABLE public.pedido_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_detalle_impuesto ENABLE ROW LEVEL SECURITY;

CREATE POLICY pedido_detalle_por_empresa
ON public.pedido_detalle
USING (EXISTS (
    SELECT 1 FROM public.pedido p
    WHERE p.id_pedido = pedido_id
      AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.pedido p
    WHERE p.id_pedido = pedido_id
      AND p.empresa_id = public.current_empresa_id()
));

CREATE POLICY pedido_detalle_impuesto_por_empresa
ON public.pedido_detalle_impuesto
USING (EXISTS (
    SELECT 1 
      FROM public.pedido_detalle pd
      JOIN public.pedido p ON p.id_pedido = pd.pedido_id
     WHERE pd.id_pedido_detalle = pedido_detalle_id
       AND p.empresa_id = public.current_empresa_id()
))
WITH CHECK (EXISTS (
    SELECT 1 
      FROM public.pedido_detalle pd
      JOIN public.pedido p ON p.id_pedido = pd.pedido_id
     WHERE pd.id_pedido_detalle = pedido_detalle_id
       AND p.empresa_id = public.current_empresa_id()
));


-- ============================================================
-- 49. COMENTARIOS FINALES
-- ============================================================
COMMENT ON TABLE public.categoria IS
'Campos del DOC 02. Sin alias id y sin columna técnica activo.';
COMMENT ON TABLE public.tercero IS
'Entidad única para clientes y proveedores. Sustituye la tabla cliente; tipo_tercero identifica cliente, proveedor o ambos.';
COMMENT ON TABLE public.producto IS
'Entidad producto del DOC 02. Sin secuencia_id, sin alias id y con presentación manual.';
COMMENT ON TABLE public.producto_lista_precio IS
'Relación producto-lista del DOC 02. No contiene impuesto_venta_id.';
COMMENT ON TABLE public.producto_proveedor IS
'Proveedor_id referencia tercero según comentario del DOC 02.';
COMMENT ON TABLE public.producto_variante IS
'Variantes requeridas por RN-21/RN-23; campos mínimos porque el DOC 02 no enumera columnas físicas.';

COMMIT;
