# Reglas de Proyecto - ChatConnect CRM & ERP

## 1. Arquitectura Backend NestJS (Controller ──► Repository Directo, SIN Capa Service)
Todo módulo nuevo o modificado en `backend-chat-connect` debe seguir la misma arquitectura directa y estructurada de `src/login`:
- **Flujo Directo**: `Controller ──► Repository (TypeORM) ──► PostgreSQL`.
- **Prohibido el uso de Servicios (`*.service.ts` o carpetas `services/`)**: Queda prohibido crear capas intermedias redundantes de servicio. La lógica de negocio, consultas y transacciones residen directamente en el **Repositorio**.
- **Controladores** en `src/<modulo>/controllers/<modulo>.controller.ts`: gestionan HTTP/REST e inyectan **directamente** el Repositorio en su constructor.
- **Modelos / Entidades TypeORM** en `src/<modulo>/models/<modulo>.model.ts`: decorados con `@Entity('<tabla>', { schema: 'public' })`.
- **Capa de Repositorio** en `src/<modulo>/repositories/<modulo>.repository.ts`: usando `@InjectRepository(...)` y `Repository<Model>`.
- **Módulos** en `src/<modulo>/<modulo>.module.ts`: registran `TypeOrmModule.forFeature([Modelos...])`, el controlador en `controllers`, y proveen y exportan el Repositorio en `providers` y `exports`.

## 2. Base de Datos PostgreSQL como Única Fuente de Verdad
- Todos los catálogos comerciales (categorías, subcategorías, marcas, impuestos, retenciones, listas de precios, proveedores, tipos de inventario, medidas, atributos, componentes) residen en PostgreSQL (`chatbotDatabase`).
- Queda terminantemente prohibido el uso de arrays mock estáticos (como constantes en archivos JS) o `localStorage` simulado.
- La creación de entidades (productos, categorías, etc.) debe persistir directamente en PostgreSQL y retornar registros reales.

## 3. Regla Estricta de Límites de Líneas y Modularización (Backend y Frontend)
- **Límite Máximo Inquebrantable**: Ningún archivo en el proyecto (sea `.ts`, `.js`, `.jsx`, `.tsx`, etc.) puede superar las **500 líneas**.
- **Tamaño Recomendado para la IA**: Se recomienda enfáticamente mantener los archivos por debajo de las **300 líneas** (rango ideal: 80 - 300 líneas). Esto permite que los modelos de lenguaje lean, comprendan y editen el código con máxima precisión y sin degradación de contexto.
- **Frontend**:
  - Las vistas principales (`page.jsx`) deben ser orquestadores concisos (idealmente < 120 líneas).
  - Toda UI compleja debe descomponerse en subcomponentes especializados dentro de carpetas `components/`.
  - La lógica de estado, filtros y efectos debe encapsularse en custom hooks dedicados (`use[Modulo].js`).
- **Backend**:
  - Queda prohibido crear archivos monolíticos con miles de líneas.
  - Cuando un repositorio crezca por manejar múltiples submódulos o integraciones externas (ej. catálogos, sincronización con Meta/WhatsApp Graph API, mutaciones complejas, consultas pesadas), debe dividirse en repositorios especializados o sub-repositorios dentro de `repositories/` (ej. `catalogo.repository.ts`, `producto-query.repository.ts`, `meta-catalog.repository.ts`, `chat-whatsapp.repository.ts`), coordinados mediante un repositorio orquestador o fachada que preserve el flujo directo `Controller ──► Repository ──► PostgreSQL`.
  - Los modelos/entidades TypeORM deben organizarse en archivos independientes dentro de `models/` si superan la longitud recomendada.
