# Contrato frontend: configuración de retenciones

## Consulta

`productoService.getConfiguraciones(empresaId = 1)` utiliza:

`GET /productos/configuraciones/catalogos?empresa_id=1`

La respuesta conserva los demás catálogos y añade `retenciones` como array de registros:

| Campo | Contrato esperado |
| --- | --- |
| `id` | Identificador del registro |
| `nombre`, `codigo` | Texto identificador |
| `grupo`, `tipo` | Texto; los grupos del filtro se derivan exclusivamente de la API |
| `porcentaje` | `number` o `null`; no enviar decimales como strings |
| `base_calculo` | `PAGO`, `IVA`, `AIU` o `ESPECIAL` |
| `base_minima_uvt` | `number` o `null`; un nulo no significa cero |
| `condicion`, `norma` | Texto informativo de aplicabilidad y fundamento |
| `fuente_url` | URL de fuente oficial; solo se enlazan esquemas HTTP/HTTPS |
| `seleccionable` | Booleano |
| `verificado_en` | Fecha ISO o nulo; la UI muestra la fecha en UTC |
| `estado` | `activo` o `inactivo` |
| `total_productos` | Cantidad de productos asociados |

Un array vacío muestra un estado sin registros. La ausencia de `retenciones` también
se trata como catálogo vacío para permitir el despliegue gradual; nunca se rellena
con catálogos locales. Los fallos de consulta se notifican con el aviso de carga de
configuración existente.

## Cambio de estado

`productoService.actualizarRetencion(id, { estado }, empresaId = 1)` utiliza:

`PATCH /productos/configuraciones/retenciones/:id?empresa_id=1`

El único campo enviado desde esta UI es `estado`: `activo` o `inactivo`.
La respuesta puede contener el registro actualizado (se utiliza su `estado`) o un
acuse exitoso sin ese campo (se utiliza el estado solicitado). El backend debe
responder exitosamente solo después de persistir el cambio.

La actualización de la fila se realiza después de la confirmación HTTP. Mientras
se guarda se bloquean los toggles para evitar solicitudes duplicadas. En caso de
error, se mantiene el estado previo y se permite reintentar. Se muestra
`response.data.message` (string o array de strings), o un mensaje genérico.

## Interpretación y límites

- `PAGO`: porcentaje del pago; `IVA`: **porcentaje del IVA**, no del pago;
  `AIU`: porcentaje sobre AIU.
- `ESPECIAL` o porcentaje nulo: sin tasa plana; consultar norma.
- Base mínima nula: **Consultar norma**. Solo un cero explícito se presenta como `0 UVT`.
- La columna de disponibilidad muestra **Seleccionable** exclusivamente cuando
  `seleccionable === true && porcentaje != null`. El estado se presenta por separado
  y controla la habilitación del registro; no se infiere disponibilidad de la tasa
  ni del estado por sí solos.
- Es un catálogo de referencia para bienes y servicios, no una lista de todas las
  retenciones nacionales. Nómina, exterior, autorretención CIIU y ReteICA requieren
  reglas especiales: sin tasa plana ni liquidación automática.
- La UI no calcula retenciones, no modifica tasas ni mantiene catálogos en
  `localStorage`. La API es la única fuente de registros y grupos.

## Navegación y pruebas

Ruta canónica: `/configuracion/precios/retenciones`.
Alias resuelto mediante `TAB_TO_MENU`: `/configuracion/retenciones`.
Se reutilizan las rutas dinámicas existentes de configuración, sin modificar `App.jsx`.

Pruebas propias:

`node --test src/pages/configuracion/retencionesConfig.test.js`

El backend y el componente de asignación de retenciones al producto quedan fuera
de esta implementación.
