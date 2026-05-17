-- Crear tabla authors (si no existe)
CREATE TABLE IF NOT EXISTS authors (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  bio        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla posts (si no existe)
CREATE TABLE IF NOT EXISTS posts (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  content    TEXT NOT NULL,
  author_id  INTEGER NOT NULL,
  published  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- Seed: solo insertar si no existen
INSERT INTO authors (name, email, bio)
SELECT 'Ana García', 'ana@example.com', 'Desarrolladora full-stack apasionada por Node.js'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE email = 'ana@example.com');

INSERT INTO authors (name, email, bio)
SELECT 'Carlos Ruiz', 'carlos@example.com', 'Escritor técnico especializado en bases de datos'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE email = 'carlos@example.com');

INSERT INTO authors (name, email, bio)
SELECT 'María López', 'maria@example.com', 'Ingeniera de software con foco en APIs REST'
WHERE NOT EXISTS (SELECT 1 FROM authors WHERE email = 'maria@example.com');

INSERT INTO posts (title, content, author_id, published)
SELECT 'Introducción a Node.js', 'Node.js es un runtime de JavaScript construido sobre el motor V8 de Chrome.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = 'Introducción a Node.js');

INSERT INTO posts (title, content, author_id, published)
SELECT 'PostgreSQL vs MySQL', 'Ambas bases de datos tienen ventajas según el caso de uso.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = 'PostgreSQL vs MySQL');

INSERT INTO posts (title, content, author_id, published)
SELECT 'APIs RESTful', 'REST es un estilo arquitectónico para diseñar servicios web.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = 'APIs RESTful');

INSERT INTO posts (title, content, author_id, published)
SELECT 'Manejo de errores en Express', 'El manejo apropiado de errores mejora la experiencia del usuario.', 3, false
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = 'Manejo de errores en Express');

INSERT INTO posts (title, content, author_id, published)
SELECT 'Async/Await explicado', 'Las promesas simplifican el código asíncrono en JavaScript.', 1, false
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE title = 'Async/Await explicado');