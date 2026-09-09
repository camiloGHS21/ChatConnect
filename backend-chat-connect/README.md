# 🚀 ChatConnect CRM — Backend API

Backend empresarial para **ChatConnect CRM**, desarrollado con el framework progresivo [NestJS](https://nestjs.com/) sobre el motor de alto rendimiento [Fastify](https://fastify.dev/), conectado a **PostgreSQL** y protegido con estrictos estándares de seguridad informática.

---

## 📑 Tabla de Contenidos

- [1. Descripción General](#1-descripción-general)
- [2. Pila Tecnológica](#2-pila-tecnológica)
- [3. Arquitectura y Estructura del Proyecto](#3-arquitectura-y-estructura-del-proyecto)
- [4. Capas de Seguridad y Hardening](#4-capas-de-seguridad-y-hardening)
  - [4.1 Motor Fastify](#41-motor-fastify)
  - [4.2 Rate Limiting (Protección anti Fuerza Bruta)](#42-rate-limiting-protección-anti-fuerza-bruta)
  - [4.3 Protección contra CSRF y Cookies Firmadas](#43-protección-contra-csrf-y-cookies-firmadas)
  - [4.4 Helmet (Cabeceras HTTP de Seguridad)](#44-helmet-cabeceras-http-de-seguridad)
  - [4.5 Autenticación Segura (Bcrypt + JWT)](#45-autenticación-segura-bcrypt--jwt)
  - [4.6 Prevención de Inyecciones SQL y Sanitización](#46-prevención-de-inyecciones-sql-y-sanitización)
- [5. Variables de Entorno](#5-variables-de-entorno)
- [6. Catálogo de Endpoints (API Reference)](#6-catálogo-de-endpoints-api-reference)
- [7. Modelo de Datos (PostgreSQL)](#7-modelo-de-datos-postgresql)
- [8. Guía de Instalación y Despliegue](#8-guía-de-instalación-y-despliegue)
- [9. Cómo Crear un Nuevo Módulo](#9-cómo-crear-un-nuevo-módulo)
- [10. Scripts Disponibles](#10-scripts-disponibles)

---

## 1. Descripción General

Este servicio backend proporciona la capa de autenticación, control de acceso, gestión de sesiones y persistencia relacional para la plataforma ChatConnect CRM. Su diseño prioriza:

1. **Rendimiento extremo:** Basado en el adaptador `FastifyAdapter` de NestJS para atender un elevado volumen de peticiones concurrentes con baja latencia y consumo óptimo de memoria.
2. **Seguridad proactiva:** Protección contra ataques comunes (fuerza bruta, CSRF, Cross-Origin Scripting, inyecciones SQL, Clickjacking, MIME-sniffing).
3. **Aislamiento de secretos:** Las credenciales de base de datos y llaves de cifrado residen exclusivamente en el entorno del servidor y nunca se exponen al cliente web ni en respuestas HTTP.

---

## 2. Pila Tecnológica

| Componente | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Framework Base** | NestJS | v11.0.x (TypeScript) |
| **Motor HTTP** | Fastify (`@nestjs/platform-fastify`) | v5.x |
| **Cabeceras HTTP** | Helmet (`@fastify/helmet`) | v13.x |
| **Protección CSRF** | Fastify CSRF (`@fastify/csrf-protection`) | v7.x |
| **Manejo de Cookies** | Fastify Cookie (`@fastify/cookie`) | v11.x |
| **Rate Limiting** | NestJS Throttler (`@nestjs/throttler`) | v6.x |
| **Base de Datos** | PostgreSQL nativo (`pg` Pool) | v8.x |
| **Cifrado de Claves** | BcryptJS (`bcryptjs`) | Factor de coste 10 (Salt rounds) |
| **Tokens de Acceso** | JSON Web Tokens (`jsonwebtoken`) | HMAC-SHA256 (24h) |
| **Gestor de Paquetes**| Bun / npm / pnpm | Node.js >= 18 |

---

## 3. Arquitectura y Estructura del Proyecto

El proyecto sigue la arquitectura modular oficial de NestJS con separación estricta de responsabilidades (Controladores, Servicios, DTOs y Modelos):

```text
backend-chat-connect/
├── .env                           # Variables de entorno activas (privado, ignorado en Git)
├── .env.example                   # Plantilla documentada de variables de entorno
├── package.json                   # Dependencias y scripts de ejecución
├── tsconfig.json                  # Configuración del compilador TypeScript
├── dist/                          # Código compilado para producción
└── src/
    ├── main.ts                    # Punto de entrada (Bootstrap, Fastify, Helmet, CSRF, CORS)
    │
    ├── database/                  # Módulo Global de Base de Datos
    │   ├── database.module.ts     # Declaración de módulo @Global()
    │   └── database.service.ts    # Pool de PostgreSQL, consultas parametrizadas y ciclo de vida
    │
    └── login/                     # Módulo de Autenticación y Usuarios
        ├── login.module.ts        # Configuración de ThrottlerModule y providers
        ├── controllers/
        │   └── login.controller.ts# Endpoints: POST /login, GET /login/csrf-token, GET /login
        ├── services/
        │   └── login.service.ts   # Lógica: hashing Bcrypt, tokens JWT, queries a PostgreSQL
        ├── dto/
        │   ├── create-login.dto.ts# DTO de validación para inicio de sesión
        │   └── update-login.dto.ts# DTO para actualización parcial
        └── models/
            └── login.model.ts     # Interfaces y clases (EmpresaModel, UsuarioModel, LoginResponse)
```

---

## 4. Capas de Seguridad y Hardening

### 4.1 Motor Fastify
Se utiliza `@nestjs/platform-fastify` mediante `FastifyAdapter`:
- Reduce el overhead por solicitud comparado con Express.
- Enlace configurado en `app.listen(port, '0.0.0.0')` para compatibilidad universal con Docker, VPS Linux y Windows.

### 4.2 Rate Limiting (Protección anti Fuerza Bruta)
Implementado con `@nestjs/throttler` y activado globalmente con `APP_GUARD`:
- **Límite global:** 30 peticiones por minuto por dirección IP.
- **Límite reforzado en `POST /login`:** Máximo **5 intentos por minuto** (`@Throttle({ default: { limit: 5, ttl: 60000 } })`).
- Si un atacante supera la cuota, el servidor responde automáticamente con código HTTP **`429 Too Many Requests`**.

### 4.3 Protección contra CSRF y Cookies Firmadas
Implementado con `@fastify/csrf-protection` y `@fastify/cookie`:
- Las cookies de sesión y tokens de verificación viajan firmados con `COOKIE_SECRET`.
- Se suministra el endpoint `GET /login/csrf-token` que genera un token seguro y establece la cookie `_csrf` con flags:
  - `path: '/'`
  - `sameSite: 'lax'`
  - `secure: true` (automático en producción).
- Las peticiones mutables deben incluir el valor en la cabecera `x-csrf-token`.

### 4.4 Helmet (Cabeceras HTTP de Seguridad)
Implementado con `@fastify/helmet`:
- Inyecta cabeceras `X-DNS-Prefetch-Control`, `X-Frame-Options` (contra Clickjacking), `Strict-Transport-Security` (HSTS), `X-Download-Options`, `X-Content-Type-Options: nosniff`.
- Configurado con `crossOriginResourcePolicy: { policy: 'cross-origin' }` para permitir al frontend cargar recursos estáticos y assets de forma segura.

### 4.5 Autenticación Segura (Bcrypt + JWT)
- **Bcrypt (Cost 10):** Las contraseñas se almacenan mediante hashes criptográficos irreversibles.
- **Auto-migración transparente:** Si un usuario existente poseía una contraseña sin encriptar en PostgreSQL, el servicio la autentica y automáticamente genera su hash seguro de Bcrypt, actualizando el registro en la base de datos de manera invisible.
- **Tokens JWT:** Generados con algoritmo HMAC-SHA256 y expiración configurable (`JWT_EXPIRES_IN=24h`). No contienen datos confidenciales (únicamente `sub`, `email`, `empresa_id` y `rol`).

### 4.6 Prevención de Inyecciones SQL y Sanitización
- Todas las consultas en `DatabaseService` se ejecutan mediante consultas parametrizadas con marcadores de posición (`$1, $2, ...`).
- Los endpoints no filtran trazas de error (stack traces), nombres de tablas, columnas o IPs del servidor en respuestas hacia el navegador.

---

## 5. Variables de Entorno

Cree un archivo `.env` en la raíz de `backend-chat-connect` basándose en `.env.example`:

| Variable | Tipo | Obligatoria | Descripción / Ejemplo |
| :--- | :---: | :---: | :--- |
| `PORT` | `number` | No | Puerto de escucha del backend (por defecto: `3000`). |
| `NODE_ENV` | `string` | No | Entorno de ejecución (`development` o `production`). |
| `DB_HOST` | `string` | **Sí** | Dirección IP o dominio del servidor PostgreSQL. |
| `DB_PORT` | `number` | No | Puerto de PostgreSQL (por defecto: `5432`). |
| `DB_NAME` | `string` | **Sí** | Nombre de la base de datos (ej. `chatbotDatabase`). |
| `DB_USER` | `string` | **Sí** | Usuario con permisos de lectura/escritura en PostgreSQL. |
| `DB_PASSWORD` | `string` | **Sí** | Contraseña de acceso a la base de datos. |
| `JWT_SECRET` | `string` | **Sí** | Cadena criptográfica aleatoria para firmar tokens JWT. |
| `JWT_EXPIRES_IN`| `string` | No | Tiempo de validez del JWT (ej. `24h`, `7d`). |
| `COOKIE_SECRET` | `string` | No | Clave secreta para firmar cookies de CSRF. Si no se define, usa `JWT_SECRET`. |
| `CORS_ORIGIN` | `string` | No | Orígenes permitidos separados por comas (ej. `http://localhost:5173`). |

---

## 6. Catálogo de Endpoints (API Reference)

### 1. `POST /login`
Autentica las credenciales de un usuario y devuelve su sesión activa.

- **Limitación de tasa:** 5 peticiones / minuto por IP.
- **Cabeceras:** `Content-Type: application/json`
- **Cuerpo de la petición (Body):**
  ```json
  {
    "email": "usuario@empresa.com",
    "password": "MiPasswordSeguro123"
  }
  ```
- **Respuesta exitosa (`200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Carlos",
      "apellido": "Gómez",
      "email": "usuario@empresa.com",
      "empresa_id": 1,
      "rol": "administrador"
    },
    "empresa": {
      "id": 1,
      "nombre": "Intredete",
      "razon_social": "Intredete S.A.S",
      "whatsapp": "+573001234567"
    }
  }
  ```
- **Códigos de error:**
  - `400 Bad Request`: Faltan campos requeridos (`email` o `password`).
  - `401 Unauthorized`: Credenciales inválidas o usuario con `estado !== 'activo'`.
  - `429 Too Many Requests`: Se excedió el límite de 5 intentos por minuto.

---

### 2. `GET /login/csrf-token`
Genera y emite un token de protección contra falsificación de peticiones.

- **Respuesta exitosa (`200 OK`):**
  ```json
  {
    "csrfToken": "4fa83...token-generado...91c"
  }
  ```
- **Efecto secundario:** Inyecta en el cliente la cookie HTTP segura `_csrf`.

---

### 3. `GET /login`
Health check público del microservicio de autenticación.

- **Respuesta exitosa (`200 OK`):**
  ```json
  {
    "status": "ok",
    "service": "chatconnect-auth",
    "timestamp": "2026-09-08T20:25:00.000Z"
  }
  ```

---

## 7. Modelo de Datos (PostgreSQL)

El servicio consulta de manera nativa las siguientes tablas de PostgreSQL:

### Tabla: `public.usuarios`
| Campo | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL / INT` | PRIMARY KEY | Identificador único |
| `empresa_id` | `INT` | FOREIGN KEY -> empresas(id) | Organización a la que pertenece |
| `nombre` | `VARCHAR` | NOT NULL | Nombre del usuario |
| `apellido` | `VARCHAR` | NULLABLE | Apellido del usuario |
| `email` | `VARCHAR` | NOT NULL, UNIQUE, INDEX | Correo de acceso al sistema |
| `password_hash`| `VARCHAR` | NOT NULL | Hash Bcrypt ($2a$, $2b$) |
| `rol` | `VARCHAR` | NOT NULL | 'administrador', 'asesor', etc. |
| `estado` | `VARCHAR` | NOT NULL | 'activo', 'inactivo' |
| `ultimo_login` | `TIMESTAMP` | NULLABLE | Registro del último acceso |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Fecha de registro |
| `updated_at` | `TIMESTAMP` | DEFAULT NOW() | Fecha de actualización |

### Tabla: `public.empresas`
| Campo | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL / INT` | PRIMARY KEY | Identificador único de empresa |
| `nombre_comercial` | `VARCHAR` | NOT NULL | Nombre comercial |
| `razon_social` | `VARCHAR` | NULLABLE | Razón social legal |
| `whatsapp` | `VARCHAR` | NULLABLE | Número telefónico de WhatsApp |
| `nit` | `VARCHAR` | NULLABLE | Documento fiscal |
| `estado` | `VARCHAR` | NOT NULL | 'activo', 'inactivo' |

---

## 8. Guía de Instalación y Despliegue

### Requisitos Previos
- Node.js versión 18 o superior (o [Bun](https://bun.sh/) versión 1.1+)
- Acceso de red a un servidor PostgreSQL con las credenciales correspondientes

### Pasos de Instalación

1. **Instalar dependencias:**
   ```bash
   # Utilizando Bun (recomendado)
   bun install

   # O utilizando npm
   npm install
   ```

2. **Configurar el entorno:**
   ```bash
   cp .env.example .env
   # Edite el archivo .env con los datos reales de su PostgreSQL y secretos
   ```

3. **Ejecución en modo desarrollo (con recarga en caliente):**
   ```bash
   bun run start:dev
   # O con npm:
   npm run start:dev
   ```

4. **Compilación y ejecución para producción:**
   ```bash
   # Compilar a JavaScript optimizado en /dist
   npm run build

   # Iniciar el servidor compilado
   node dist/main.js
   ```

---

## 9. Cómo Crear un Nuevo Módulo

Para extender el backend siguiendo la misma arquitectura MVC y de seguridad:

1. **Crear la estructura del módulo:**
   ```bash
   src/
   └── clientes/
       ├── clientes.module.ts
       ├── controllers/
       │   └── clientes.controller.ts
       ├── services/
       │   └── clientes.service.ts
       ├── dto/
       │   ├── create-cliente.dto.ts
       │   └── update-cliente.dto.ts
       └── models/
           └── cliente.model.ts
   ```

2. **Consumir la base de datos:**
   El `DatabaseService` es global (`@Global()`). Simplemente inyéctelo en el constructor de su servicio:
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { DatabaseService } from '../../database/database.service.js';

   @Injectable()
   export class ClientesService {
     constructor(private readonly db: DatabaseService) {}

     async listarClientes(empresaId: number) {
       const res = await this.db.query(
         'SELECT * FROM public.contactos WHERE empresa_id = $1',
         [empresaId],
       );
       return res.rows;
     }
   }
   ```

3. **Registrar el módulo en `src/main.ts`** o importarlo dentro del módulo principal.

---

## 10. Scripts Disponibles

| Comando | Acción |
| :--- | :--- |
| `bun run start` / `npm run start` | Inicia la aplicación con NestJS |
| `bun run start:dev` / `npm run start:dev` | Inicia el servidor en modo desarrollo con recarga automática |
| `bun run build` / `npm run build` | Compila el proyecto TypeScript hacia el directorio `/dist` |
| `bun run start:prod` / `npm run start:prod` | Ejecuta la aplicación compilada en producción (`dist/main.js`) |
| `npm run test` | Ejecuta los tests unitarios con Vitest |
| `npm run test:e2e` | Ejecuta las pruebas de integración End-to-End |

---

## 🛡️ Licencia y Propiedad

Desarrollado para **Intredete / ChatConnect**. Todos los derechos reservados.
