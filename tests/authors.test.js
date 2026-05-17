import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Autores API", () => {
  // Test 1
  test("GET /authors - devuelve lista de autores", async () => {
    const res = await request(app).get("/authors");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test 2
  test("GET /authors/:id - devuelve un autor existente", async () => {
    const res = await request(app).get("/authors/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("email");
  });

  // Test 3
  test("GET /authors/:id - devuelve 404 si no existe", async () => {
    const res = await request(app).get("/authors/9999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  // Test 4
  test("POST /authors - crea un autor correctamente", async () => {
    const res = await request(app)
      .post("/authors")
      .send({
        name: "Usuario Test",
        email: `test${Date.now()}@example.com`,
        bio: "Usuario de prueba",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Usuario Test");
  });

  // Test 5
  test("POST /authors - devuelve 400 si falta el nombre", async () => {
    const res = await request(app).post("/authors").send({
      email: "sinnombre@example.com",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  // Test 6
  test("POST /authors - devuelve 400 si el email ya existe", async () => {
    const res = await request(app).post("/authors").send({
      name: "Ana Garcia",
      email: "ana@example.com",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
