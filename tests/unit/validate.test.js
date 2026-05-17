import { describe, test, expect } from "vitest";

// Simulamos req y res para testear los validators como funciones puras
const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

const mockNext = () => {
  let called = false;
  const next = () => {
    called = true;
  };
  next.wasCalled = () => called;
  return next;
};

// Importamos los validators
import {
  validateAuthor,
  validatePost,
} from "../../src/middlewares/validate.js";

describe("validateAuthor", () => {
  test("llama next() si name y email están presentes", () => {
    const req = { body: { name: "Ana", email: "ana@example.com" } };
    const res = mockRes();
    const next = mockNext();

    validateAuthor(req, res, next);

    expect(next.wasCalled()).toBe(true);
  });

  test("devuelve 400 si falta name", () => {
    const req = { body: { email: "ana@example.com" } };
    const res = mockRes();
    const next = mockNext();

    validateAuthor(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(next.wasCalled()).toBe(false);
  });

  test("devuelve 400 si falta email", () => {
    const req = { body: { name: "Ana" } };
    const res = mockRes();
    const next = mockNext();

    validateAuthor(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("devuelve 400 si name es string vacío", () => {
    const req = { body: { name: "", email: "ana@example.com" } };
    const res = mockRes();
    const next = mockNext();

    validateAuthor(req, res, next);

    expect(res.statusCode).toBe(400);
  });
});

describe("validatePost", () => {
  test("llama next() si title, content y author_id están presentes", () => {
    const req = {
      body: { title: "Título", content: "Contenido", author_id: 1 },
    };
    const res = mockRes();
    const next = mockNext();

    validatePost(req, res, next);

    expect(next.wasCalled()).toBe(true);
  });

  test("devuelve 400 si falta title", () => {
    const req = { body: { content: "Contenido", author_id: 1 } };
    const res = mockRes();
    const next = mockNext();

    validatePost(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("devuelve 400 si falta author_id", () => {
    const req = { body: { title: "Título", content: "Contenido" } };
    const res = mockRes();
    const next = mockNext();

    validatePost(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
