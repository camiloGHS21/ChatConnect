# Catálogo parcial de retenciones — corte 2026-11-10

## Integración

`ProductoModule` registra `RetencionModel` en `TypeOrmModule.forFeature` y
`RetencionRepository` como provider/export. `ProductoController` inyecta directamente
el repositorio para el PATCH de estado, sin crear servicios.

Los repositorios de **ambos GET de catálogos** inicializan las retenciones en cada
carga (no una sola vez al arrancar). El selector de productos utiliza:

```ts
await this.retencionRepository.asegurarPorDefecto(empresaId);
const retenciones = await this.retencionRepository.listar(empresaId, true);
```

Para configuración/administración, usar `listar(empresaId)` o `listar(empresaId, false)`.
Esto incluye inactivas, referencias y legacy sin tarifa. `listar` asegura solo el
esquema: no sustituye la llamada a `asegurarPorDefecto` en cada GET.

`actualizarEstado(id, estado, empresaId)` acepta exclusivamente `activo`/`inactivo`,
actualiza por id **y empresa**, retorna `{ id: number, estado }` y responde
`NotFoundException` si no existe en esa empresa. No borra ni altera otros campos.

## Persistencia, concurrencia y permisos

- La tabla `public.retencion` y las relaciones `public.producto_retencion` y
  `public.producto` deben existir; el esquema SQL solo añade columnas e índice.
- `retenciones-schema.sql` se aplica una vez por DataSource/proceso, compartiendo
  la promesa en curso. Si lectura, DDL o commit fallan, se descarta esa promesa
  y una llamada posterior reintenta. Los fallos se propagan, no se ocultan.
- DDL en transacción con advisory lock global; semilla en otra transacción con
  advisory lock por empresa. Los locks son transaccionales de PostgreSQL y
  coordinan también procesos distintos que usen las mismas claves.
- La semilla se ejecuta en **cada** `asegurarPorDefecto`, no se cachea por empresa.
  Es un `INSERT ... ON CONFLICT DO NOTHING`: el código estable por empresa evita
  reinsertar una fila renombrada, y la restricción existente por nombre evita
  colisiones con nombres personalizados. No hace UPDATE ni borra filas.
- Si un registro existente ocupa nombre o código de una semilla, se conserva
  íntegro, sin completar su tarifa. No se reconcilian nombres legacy parecidos:
  no es seguro inferir que corresponden al mismo supuesto jurídico.
- Mantener el código estable al editar un registro sembrado. Si se cambian
  **ambos** código y nombre, deja de poder reconocerse su identidad anterior.
- La aplicación necesita permisos ALTER/CREATE INDEX/COMMENT la primera vez.
  No hay dependencia de servicios web DIAN en runtime.
- Se cargan ambos archivos con `new URL('../seeds/…', import.meta.url)` y `readFile`.
  El `nest-cli.json` existente ya copia `**/*.sql`; conservar la estructura
  `dist/producto/seeds` junto a `dist/producto/repositories` en el despliegue.
- Desactivar sincronización automática de TypeORM para producción; esta migración
  es aditiva y no agrega timestamps ni relaciones nuevas a la entidad.

## Contrato de lectura y límites fiscales

`listar` devuelve `id`, `empresa_id`, `nombre`, `estado`, `codigo`, `grupo`, `tipo`,
`porcentaje`, `base_calculo`, `base_minima_uvt`, `condicion`, `norma`, `fuente_url`,
`seleccionable`, `verificado_en`, `total_productos`, en snake_case. IDs, porcentajes,
UVT y conteos se convierten a números; se preserva NULL (no se convierte en cero).
`verificado_en` es fecha ISO sin hora. Se cuentan productos DISTINCT de la misma
empresa; incluye asociaciones existentes aunque estén inactivas para mostrar uso.

`soloActivas=true` exige simultáneamente estado activo, seleccionable y porcentaje
no NULL. Los registros legacy conservan tarifa NULL y quedan fuera de ese selector,
aunque el nuevo booleano tenga default TRUE. `OTRO`/`ESPECIAL` son valores de
clasificación desconocida, no una inferencia fiscal de los nombres legacy.

- `base_minima_uvt` es un **umbral**, no la base monetaria de liquidación.
  Cero indica sin mínimo; NULL, no determinado/variable. Leer `condicion` para
  distinguir >= de > (agro y café: obligatorio al **exceder** 70 UVT).
- `PAGO` refiere al pago/abono fiscalmente sujeto, no automáticamente al precio
  bruto del producto; revisar impuestos excluidos y reglas de cada concepto.
- `IVA` es porcentaje del IVA causado, **nunca del precio**. El 10% requiere
  resolución DIAN ejecutoriada; 100% requiere el supuesto de los nums. 3 u 8.
- `AIU`: verificar umbral contra la operación y luego aplicar la tarifa al AIU
  (no inferior al 10% del contrato) solo si cumple ET 462-1. Concepto 16207/2026
  reconsideró la doctrina anterior de aplicar renta sobre el total del pago.
- Nómina, exterior, CIIU, transporte aéreo/marítimo especial y reteICA se conservan
  como referencias `seleccionable=false`, `porcentaje=NULL`, `tipo=REFERENCIA`.
  Activarlas por estado no las convierte en opciones de porcentaje.
- No implementa un motor de cálculo, verificación de condiciones, conversión a
  pesos, convenios internacionales ni configuración de municipios. El consumidor
  no debe ignorar `base_calculo` y `condicion` al asignar una retención a productos.
- No es exhaustivo ni aplica todas las tarifas a todas las empresas/operaciones.

## Vigencia verificada y límites de evidencia

El Decreto 572/2025 aplicó inicialmente desde 2025-06-01. Los arts. 2 a 8 fueron
suspendidos por auto 2026-05-07; Comunicado DIAN 070 ordenó régimen anterior desde
2026-05-08. El auto 2026-06-02 levantó la suspensión, modulando efectos operativos
al primer día del mes siguiente a ejecutoria. **No se verificó la constancia de
ejecutoria ni se implementó el histórico de ese intervalo**. Las anotaciones del
DUR consolidado y la doctrina posterior (15000/2026 y 16207/2026) respaldan el
régimen restablecido usado en la semilla al corte. No se certifica el expediente
judicial completo ni una sentencia definitiva sobre la legalidad del decreto.

Las fuentes principales quedan persistidas por fila. Enlaces oficiales consultados:

- [DUR 1625 consolidado y notas](https://normograma.dian.gov.co/dian/compilacion/docs/decreto_1625_2016.htm).
- [Anotaciones desplegables del DUR](https://normograma.dian.gov.co/dian/compilacion/docs/js/decreto_1625_2016.js).
- [Auto 30229 de 2026-06-02](https://normograma.dian.gov.co/dian/compilacion/docs/11001-03-27-000-2025-00055-00(30229)_20260602.htm).
- [Comunicado 070/2026](https://www.dian.gov.co/Prensa/Paginas/NG-Comunicado-de-Prensa-070-2026.aspx).
- [Oficio 15000/2026: régimen restablecido](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_15000_2026.htm).
- [Concepto 16207/2026: AIU](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_16207_2026.htm).
- [Concepto 12329/2025: arrendamientos, pasajeros y hospedaje](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_12329_2025.htm).
- [Concepto 12998/2026: límites en fletes e intermediación](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_12998_2026.htm).
- [Oficio 32759/2018, respuesta 3: combustible](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_32759_2018.htm). No se usaron sus tarifas históricas del exterior.
- [ET consolidado](https://normograma.dian.gov.co/dian/compilacion/docs/estatuto_tributario.htm).
- [Ley 1819, arts. 342–344: ICA territorial](https://normograma.dian.gov.co/dian/compilacion/docs/ley_1819_2016.htm#343).

## Validación reproducible

```sh
npm exec --no -- vitest run src/producto/repositories/retencion.repository.spec.ts src/producto/seeds/retenciones-sql.spec.ts
```

Los unit tests leen los SQL reales y verifican metadata, filtros, límites, aislamiento,
locks, cache/reintentos y propagación de errores con dobles de TypeORM.

También se comprobó el repositorio compilado contra PostgreSQL configurado: carga
idempotente, lectura de 27 opciones seleccionables y 6 referencias, preservación de
los dos registros legacy, rechazo de cambios de otra empresa y de estados inválidos.
La prueba de desactivación se realizó dentro de una transacción revertida con ROLLBACK;
se comprobó después que todos los estados permanecieran intactos. No se crearon
productos de prueba ni se ejecutaron sincronizaciones externas.

Antes de desplegar en otro entorno, probar en una BD desechable dos cargas concurrentes,
personalizaciones/renombres y colisiones de código/nombre. Los unit tests por sí solos
no certifican bloqueos reales de PostgreSQL ni la aplicación fiscal de cada operación.
