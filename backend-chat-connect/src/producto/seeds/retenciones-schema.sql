-- Migración aditiva sobre la tabla existente; no clasifica ni tasa registros legacy.
-- El repositorio la ejecuta en transacción y con advisory lock global de esquema.
ALTER TABLE public.retencion
    ADD COLUMN IF NOT EXISTS codigo VARCHAR(80),
    ADD COLUMN IF NOT EXISTS grupo VARCHAR(10) NOT NULL DEFAULT 'OTRO',
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) NOT NULL DEFAULT 'PORCENTAJE',
    ADD COLUMN IF NOT EXISTS porcentaje NUMERIC(9,4),
    ADD COLUMN IF NOT EXISTS base_calculo VARCHAR(10) NOT NULL DEFAULT 'ESPECIAL',
    ADD COLUMN IF NOT EXISTS base_minima_uvt NUMERIC(14,4),
    ADD COLUMN IF NOT EXISTS condicion TEXT,
    ADD COLUMN IF NOT EXISTS norma TEXT,
    ADD COLUMN IF NOT EXISTS fuente_url TEXT,
    ADD COLUMN IF NOT EXISTS seleccionable BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS verificado_en DATE;

-- Permite múltiples códigos NULL legacy, pero conserva identidad incluso al renombrar.
CREATE UNIQUE INDEX IF NOT EXISTS retencion_empresa_codigo_unique
    ON public.retencion (empresa_id, codigo) WHERE codigo IS NOT NULL;

COMMENT ON COLUMN public.retencion.porcentaje IS
    'NULL: tarifa no informada o regla no plana; nunca interpretar NULL como cero.';
COMMENT ON COLUMN public.retencion.base_minima_uvt IS
    'Umbral, no base de liquidación. 0: sin mínimo; NULL: no determinado o variable. Ver condicion para >=, > y excepciones.';
COMMENT ON COLUMN public.retencion.base_calculo IS
    'PAGO, IVA, AIU o ESPECIAL. No aplicar automáticamente sobre el precio del producto.';
COMMENT ON COLUMN public.retencion.verificado_en IS
    'Fecha de revisión de fuentes; no es inicio de vigencia ni certificación judicial.';
