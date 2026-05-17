import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Posts API", () => {
  // Test 7
  test("GET /posts - devuelve lista de posts", async () => {
    const res = await request(app).get("/posts");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test 8
  test("POST /posts - crea un post correctamente", async () => {
    const res = await request(app).post("/posts").send({
      title: "Post de prueba",
      content: "Contenido de prueba",
      author_id: 1,
      published: false,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Post de prueba");
  });

  // Test 9
  test("DELETE /posts/:id - devuelve 404 si no existe", async () => {
    const res = await request(app).delete("/posts/9999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});
