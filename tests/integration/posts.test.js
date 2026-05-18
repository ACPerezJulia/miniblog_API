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

  test("GET /posts - devuelve lista de posts", async () => {
    const res = await request(app).get("/posts");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
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
});
