import { describe, test, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import pool from "../../src/db/config.js";

const app = createApp({ pool });
const PREFIX = `test-authors-${Date.now()}`;

describe("Autores API", () => {
  let testAuthor;

  beforeAll(async () => {
    const result = await pool.query(
      "INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *",
      [`${PREFIX}-autor`, `${PREFIX}@example.com`, "Bio de test"],
    );
    testAuthor = result.rows[0];
  });

  afterAll(async () => {
    await pool.query("DELETE FROM authors WHERE email LIKE $1", [`${PREFIX}%`]);
    await pool.end();
  });

  test("GET /authors - devuelve lista de autores", async () => {
    const res = await request(app).get("/authors");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /authors/:id - devuelve el autor de test", async () => {
    const res = await request(app).get(`/authors/${testAuthor.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", testAuthor.id);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("email");
  });

  test("GET /authors/:id - devuelve 404 si no existe", async () => {
    const res = await request(app).get("/authors/9999999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /authors - crea un autor correctamente", async () => {
    const res = await request(app)
      .post("/authors")
      .send({
        name: `${PREFIX}-nuevo`,
        email: `${PREFIX}-nuevo@example.com`,
        bio: "Autor nuevo de test",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(`${PREFIX}-nuevo`);
  });

  test("POST /authors - devuelve 400 si falta el nombre", async () => {
    const res = await request(app)
      .post("/authors")
      .send({ email: "sinnombre@example.com" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /authors - devuelve 400 si el email tiene formato inválido", async () => {
    const res = await request(app)
      .post("/authors")
      .send({ name: "Ana", email: "noesunmail" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /authors - devuelve 409 si el email ya existe", async () => {
    const res = await request(app)
      .post("/authors")
      .send({ name: "Duplicado", email: testAuthor.email });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("error");
  });
});
