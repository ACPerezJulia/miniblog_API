import { describe, test, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import pool from "../../src/db/config.js";

const app = createApp({ pool });
const PREFIX = `test-posts-${Date.now()}`;

describe("Posts API", () => {
  let testAuthor;
  let testPost;

  beforeAll(async () => {
    const authorResult = await pool.query(
      "INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *",
      [`${PREFIX}-autor`, `${PREFIX}@example.com`, "Bio de test"],
    );
    testAuthor = authorResult.rows[0];

    const postResult = await pool.query(
      "INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4) RETURNING *",
      [`${PREFIX}-post`, "Contenido de test", testAuthor.id, true],
    );
    testPost = postResult.rows[0];
  });

  afterAll(async () => {
    await pool.query("DELETE FROM posts WHERE title LIKE $1", [`${PREFIX}%`]);
    await pool.query("DELETE FROM authors WHERE email LIKE $1", [`${PREFIX}%`]);
    await pool.end();
  });

  test("GET /posts - devuelve lista paginada de posts", async () => {
    const res = await request(app).get("/posts");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("page", 1);
    expect(res.body).toHaveProperty("limit", 10);
  });

  test("GET /posts - respeta el parámetro limit", async () => {
    const res = await request(app).get("/posts?limit=1");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.limit).toBe(1);
  });

  test("GET /posts/:id - devuelve el post de test", async () => {
    const res = await request(app).get(`/posts/${testPost.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", testPost.id);
    expect(res.body).toHaveProperty("title");
  });

  test("GET /posts/:id - devuelve 404 si no existe", async () => {
    const res = await request(app).get("/posts/9999999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /posts - crea un post correctamente", async () => {
    const res = await request(app)
      .post("/posts")
      .send({
        title: `${PREFIX}-nuevo`,
        content: "Contenido de test",
        author_id: testAuthor.id,
        published: false,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe(`${PREFIX}-nuevo`);
  });

  test("POST /posts - devuelve 400 si falta el título", async () => {
    const res = await request(app)
      .post("/posts")
      .send({ content: "Contenido", author_id: testAuthor.id });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /posts - devuelve 400 si author_id no es un entero positivo", async () => {
    const res = await request(app)
      .post("/posts")
      .send({ title: "Título", content: "Contenido", author_id: -1 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("DELETE /posts/:id - devuelve 404 si no existe", async () => {
    const res = await request(app).delete("/posts/9999999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /posts/author/:authorId - devuelve posts del autor", async () => {
    const res = await request(app).get(`/posts/author/${testAuthor.id}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("author_id", testAuthor.id);
  });

  test("GET /posts/author/:authorId - devuelve [] si el autor existe sin posts", async () => {
    const { rows } = await pool.query(
      "INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *",
      [`${PREFIX}-sinposts`, `${PREFIX}-sinposts@example.com`, "Sin posts"],
    );
    const res = await request(app).get(`/posts/author/${rows[0].id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("GET /posts/author/:authorId - devuelve 404 si el autor no existe", async () => {
    const res = await request(app).get("/posts/author/9999999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("PUT /posts/:id - actualiza un post y devuelve 200", async () => {
    const res = await request(app)
      .put(`/posts/${testPost.id}`)
      .send({
        title: `${PREFIX}-actualizado`,
        content: "Contenido actualizado",
        author_id: testAuthor.id,
        published: true,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", testPost.id);
    expect(res.body.title).toBe(`${PREFIX}-actualizado`);
  });

  test("DELETE /posts/:id - elimina un post y devuelve 204", async () => {
    const { rows } = await pool.query(
      "INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4) RETURNING *",
      [`${PREFIX}-eliminar`, "Para eliminar", testAuthor.id, false],
    );
    const res = await request(app).delete(`/posts/${rows[0].id}`);
    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});
  });
});
