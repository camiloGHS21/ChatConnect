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

## 3. Límite de Líneas en Frontend
- Ningún archivo `.jsx` puede superar las **160 líneas**.

