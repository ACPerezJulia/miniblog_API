# MiniBlog API

API REST backend para gestión de autores y publicaciones, construida con Node.js, Express y PostgreSQL.  
Proyecto Integrador Módulo 2 — Soy Henry Full Stack.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Configuración local paso a paso](#configuración-local-paso-a-paso)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos: setup y seed](#base-de-datos-setup-y-seed)
- [Endpoints disponibles](#endpoints-disponibles)
- [Validaciones y errores](#validaciones-y-errores)
- [Ejecutar tests](#ejecutar-tests)
- [Documentación OpenAPI](#documentación-openapi)
- [Deploy en Railway](#deploy-en-railway)
- [Registro de uso de IA](#registro-de-uso-de-ia)

---

## Tecnologías

| Tecnología         | Uso                        |
| ------------------ | -------------------------- |
| Node.js v20+       | Runtime JavaScript         |
| Express 5          | Framework HTTP             |
| PostgreSQL 15+     | Base de datos relacional   |
| pg (node-postgres) | Cliente SQL para Node      |
| Vitest             | Testing unitario           |
| Supertest          | Testing de endpoints HTTP  |
| dotenv             | Variables de entorno       |
| swagger-ui-express | Interfaz visual de la API  |
| js-yaml            | Parseo del archivo OpenAPI |

---

## Estructura del proyecto

```
miniblog_API/
├── src/
│   ├── routes/
│   │   ├── authors.routes.js     # Rutas /authors
│   │   └── posts.routes.js       # Rutas /posts
│   ├── services/
│   │   ├── authors.service.js    # Lógica SQL de authors
│   │   └── posts.service.js      # Lógica SQL de posts
│   ├── db/
│   │   └── config.js             # Conexión pg Pool
│   └── middlewares/
│       ├── errorHandler.js       # Middleware global de errores
│       ├── asyncHandler.js       # Wrapper para handlers async
│       └── validate.js           # Validaciones de campos
├── tests/
│   ├── setup.js                  # Carga dotenv antes de los tests
│   ├── unit/
│   │   └── validate.test.js      # Tests unitarios de validators
│   └── integration/
│       ├── authors.test.js       # Tests de endpoints /authors
│       └── posts.test.js         # Tests de endpoints /posts
├── docs/
│   └── openapi.yaml              # Documentación OpenAPI
├── sql/
│   └── setup.sql                 # Script creación de tablas + seed
├── app.js                        # Factory createApp({ pool })
├── server.js                     # Arranque del servidor
├── errors.js                     # Helpers de error (notFound, badRequest, etc.)
├── vitest.config.js              # Configuración de Vitest
├── .env.example                  # Template de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

---

## Requisitos previos

Antes de empezar, asegurate de tener instalado:

- [Node.js v20+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/download/) corriendo localmente
- [Git](https://git-scm.com/)
- Un cliente HTTP como [Thunder Client](https://www.thunderclient.com/) (VSCode) o [Postman](https://www.postman.com/)

---

## Configuración local paso a paso

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/ACPerezJulia/miniblog_API.git
cd miniblog_API
```

### Paso 2 — Instalar dependencias

```bash
npm install
```

### Paso 3 — Configurar variables de entorno

Copiá el archivo de ejemplo y completá tus datos:

```bash
cp .env.example .env
```

Luego abrí `.env` y completá los valores (ver sección [Variables de entorno](#variables-de-entorno)).

### Paso 4 — Crear la base de datos en PostgreSQL

Abrí pgAdmin, conectate al servidor y ejecutá en el Query Tool:

```sql
CREATE DATABASE miniblog;
```

### Paso 5 — Ejecutar el script de setup y seed

Abrí pgAdmin, conectate a la base `miniblog` y ejecutá el contenido de `sql/setup.sql` desde el Query Tool.

> ⚠️ En Windows se recomienda usar pgAdmin para evitar problemas de encoding con caracteres especiales (acentos, ñ).

Deberías ver una salida similar a:

```
CREATE TABLE
CREATE TABLE
INSERT 0 1
INSERT 0 1
...
```

### Paso 6 — Iniciar el servidor

```bash
npm run dev
```

El servidor arrancará en `http://localhost:3000`.

---

## Variables de entorno

El archivo `.env.example` incluye todas las variables necesarias:

```env
# Server
PORT=3000

# Database — opción A: URL completa (recomendada para Railway)
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/miniblog

# Database — opción B: variables separadas (para desarrollo local)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=miniblog
```

> ⚠️ **Nunca subas el archivo `.env` con credenciales reales a GitHub.** El `.gitignore` ya lo excluye. Solo subir `.env.example`.

---

## Base de datos: setup y seed

El archivo `sql/setup.sql` crea las tablas de forma idempotente (se puede ejecutar múltiples veces sin perder datos) y carga datos de ejemplo si no existen.

### Schema

**Tabla `authors`**

| Columna    | Tipo         | Restricción     |
| ---------- | ------------ | --------------- |
| id         | SERIAL       | PRIMARY KEY     |
| name       | VARCHAR(100) | NOT NULL        |
| email      | VARCHAR(150) | UNIQUE NOT NULL |
| bio        | TEXT         | —               |
| created_at | TIMESTAMPTZ  | DEFAULT NOW()   |

**Tabla `posts`**

| Columna    | Tipo         | Restricción                                  |
| ---------- | ------------ | -------------------------------------------- |
| id         | SERIAL       | PRIMARY KEY                                  |
| title      | VARCHAR(200) | NOT NULL                                     |
| content    | TEXT         | NOT NULL                                     |
| author_id  | INTEGER      | NOT NULL, FK → authors(id) ON DELETE CASCADE |
| published  | BOOLEAN      | DEFAULT FALSE                                |
| created_at | TIMESTAMPTZ  | DEFAULT NOW()                                |

### Relación

Un **author** puede tener muchos **posts** (relación 1:N). Si se elimina un autor, todos sus posts se eliminan automáticamente por el `ON DELETE CASCADE`.

---

## Endpoints disponibles

Base URL local: `http://localhost:3000`  
Base URL producción: `https://miniblogapi-production.up.railway.app`

### Autores

| Método | Ruta           | Descripción              | Status exitoso |
| ------ | -------------- | ------------------------ | -------------- |
| GET    | `/authors`     | Listar todos los autores | 200            |
| GET    | `/authors/:id` | Obtener un autor por ID  | 200            |
| POST   | `/authors`     | Crear un nuevo autor     | 201            |
| PUT    | `/authors/:id` | Actualizar un autor      | 200            |
| DELETE | `/authors/:id` | Eliminar un autor        | 204            |

### Posts

| Método | Ruta                      | Descripción                           | Status exitoso |
| ------ | ------------------------- | ------------------------------------- | -------------- |
| GET    | `/posts`                  | Listar todos los posts                | 200            |
| GET    | `/posts/:id`              | Obtener un post por ID                | 200            |
| GET    | `/posts/author/:authorId` | Posts de un autor con datos del autor | 200            |
| POST   | `/posts`                  | Crear un nuevo post                   | 201            |
| PUT    | `/posts/:id`              | Actualizar un post                    | 200            |
| DELETE | `/posts/:id`              | Eliminar un post                      | 204            |

### Ejemplos de uso

**Listar autores:**

```bash
curl http://localhost:3000/authors
```

**Crear un autor:**

```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Ana García", "email": "ana@example.com", "bio": "Desarrolladora backend"}'
```

**Crear un post:**

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi primer post", "content": "Contenido del post", "author_id": 1}'
```

**Eliminar un autor:**

```bash
curl -X DELETE http://localhost:3000/authors/1
```

---

## Validaciones y errores

La API valida los datos de entrada y responde con códigos HTTP apropiados:

| Situación                    | Status | Respuesta                                    |
| ---------------------------- | ------ | -------------------------------------------- |
| Recurso creado correctamente | 201    | Objeto creado                                |
| Campo obligatorio vacío      | 400    | `{ "error": "El campo X es obligatorio" }`   |
| Email ya registrado          | 409    | `{ "error": "El email ya está registrado" }` |
| Recurso no encontrado        | 404    | `{ "error": "Autor/Post no encontrado" }`    |
| Error interno del servidor   | 500    | `{ "error": "Error interno del servidor" }`  |

---

## Ejecutar tests

Los tests están escritos con **Vitest** y **Supertest**, organizados en dos carpetas:

- `tests/unit/` — tests unitarios de funciones puras (validators)
- `tests/integration/` — tests de endpoints HTTP

### Correr todos los tests

```bash
npm test
```

### Correr en modo watch (útil durante desarrollo)

```bash
npm run test:watch
```

### Ver reporte de cobertura

```bash
npm run test:coverage
```

### Tests incluidos

| Archivo                       | Test                                          |
| ----------------------------- | --------------------------------------------- |
| `unit/validate.test.js`       | validateAuthor llama next() si datos válidos  |
| `unit/validate.test.js`       | validateAuthor devuelve 400 si falta name     |
| `unit/validate.test.js`       | validateAuthor devuelve 400 si falta email    |
| `unit/validate.test.js`       | validateAuthor devuelve 400 si name es vacío  |
| `unit/validate.test.js`       | validatePost llama next() si datos válidos    |
| `unit/validate.test.js`       | validatePost devuelve 400 si falta title      |
| `unit/validate.test.js`       | validatePost devuelve 400 si falta author_id  |
| `integration/authors.test.js` | GET /authors devuelve lista con status 200    |
| `integration/authors.test.js` | GET /authors/:id devuelve autor existente     |
| `integration/authors.test.js` | GET /authors/:id devuelve 404 si no existe    |
| `integration/authors.test.js` | POST /authors crea autor y devuelve 201       |
| `integration/authors.test.js` | POST /authors devuelve 400 si falta name      |
| `integration/authors.test.js` | POST /authors devuelve 409 si email duplicado |
| `integration/posts.test.js`   | GET /posts devuelve lista con status 200      |
| `integration/posts.test.js`   | POST /posts crea post y devuelve 201          |
| `integration/posts.test.js`   | DELETE /posts/:id devuelve 404 si no existe   |

---

## Documentación OpenAPI

La documentación completa de la API se encuentra en `docs/openapi.yaml`.

### Ver la documentación con Swagger UI

**Opción 1 — Con el servidor corriendo:**

```bash
npm run dev
```

Luego abrí en el navegador:

```
http://localhost:3000/api-docs
```

**Opción 2 — Usando el editor online:**

1. Ir a [editor.swagger.io](https://editor.swagger.io/)
2. Pegar el contenido de `docs/openapi.yaml`

---

## Deploy en Railway

### Requisitos

- Cuenta en [Railway](https://railway.app/)
- Repositorio en GitHub (público)
- `.env` **nunca** subido al repositorio

### Pasos para el deploy

#### 1. Subir el proyecto a GitHub

```bash
git add .
git commit -m "feat: initial commit - MiniBlog API"
git push origin main
```

Verificar que `.env` **no aparezca** en el commit.

#### 2. Crear proyecto en Railway

1. Ir a [railway.app](https://railway.app/) e iniciar sesión
2. Click en **"New Project"**
3. Seleccionar **"Deploy from GitHub repo"**
4. Elegir el repositorio `miniblog_API`

#### 3. Agregar la base de datos PostgreSQL

1. En el proyecto de Railway, click en **"+ New"**
2. Seleccionar **"Database" → "PostgreSQL"**
3. Railway crea la base automáticamente y provee las credenciales

#### 4. Ejecutar el script de setup en Railway

Desde la sección **Data** de la base en Railway, pegá el contenido de `sql/setup.sql` y ejecutalo.

#### 5. Configurar variables de entorno

En la pestaña **"Variables"** del servicio web, agregá:

| Variable       | Valor                                                      |
| -------------- | ---------------------------------------------------------- |
| `DATABASE_URL` | Copiar desde PostgreSQL de Railway → pestaña **"Connect"** |
| `PORT`         | `3000`                                                     |

#### 6. Verificar el deploy

Una vez desplegado, Railway asigna una URL pública del tipo:

```
https://miniblogapi-production.up.railway.app
```

Probá accediendo a:

```
https://miniblogapi-production.up.railway.app/authors
```

### Troubleshooting común en Railway

| Problema                | Causa probable                    | Solución                                                     |
| ----------------------- | --------------------------------- | ------------------------------------------------------------ |
| App crashea al arrancar | Falta `DATABASE_URL` en Variables | Agregar la variable en Railway                               |
| `ECONNREFUSED`          | La app no puede conectar a la DB  | Verificar que `DATABASE_URL` apunta al PostgreSQL de Railway |
| Puerto no responde      | Puerto hardcodeado en el código   | Usar `process.env.PORT`                                      |
| Build falla             | `node_modules` en el repo         | Verificar `.gitignore`                                       |

---

## Registro de uso de IA

Durante el desarrollo de este proyecto utilicé Claude (Anthropic) como asistente.

### Partes con asistencia de IA

| Área                     | Descripción del uso                                                           |
| ------------------------ | ----------------------------------------------------------------------------- |
| Estructura del proyecto  | Se consultó la organización de carpetas y archivos                            |
| Configuración de pg.Pool | Se consultó el setup con soporte para `DATABASE_URL` y variables separadas    |
| Middleware de errores    | Se solicitó un ejemplo de middleware centralizado con `asyncHandler`          |
| Queries SQL              | Se revisó la sintaxis de queries parametrizadas con `$1, $2` en node-postgres |
| Tests con Vitest         | Se consultó cómo organizar tests unitarios e de integración                   |
| OpenAPI                  | Se generó la estructura base del archivo `openapi.yaml`                       |
| README                   | Se generó la documentación del proyecto                                       |

### Partes desarrolladas de forma autónoma

- Comprensión y revisión de cada archivo antes de implementarlo
- Decisiones de estructura y nombres de archivos
- Resolución de errores de encoding en PostgreSQL
- Configuración del entorno local (pgAdmin, Git Bash, PATH)
- Adaptación del proyecto a ES Modules con Vitest

> La IA fue usada como guía y punto de partida. Cada fragmento de código fue comprendido y probado manualmente antes de integrarlo al proyecto.

---

## Autora

**Analía C. Pérez Juliá**  
GitHub: [@ACPerezJulia](https://github.com/ACPerezJulia)  
Proyecto Integrador M2 — Soy Henry Full Stack  
2026

---

## Licencia

ISC
