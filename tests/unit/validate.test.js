import { describe, test, expect } from "vitest";
import { validateAuthor, validatePost, validateIntParam } from "../../src/middlewares/validate.js";

const mockNext = () => {
  let arg;
  const next = (err) => { arg = err; };
  next.error = () => arg;
  next.passed = () => arg === undefined;
  return next;
};

describe("validateAuthor", () => {
  test("llama next() sin error si name y email son válidos", () => {
    const req = { body: { name: "Ana", email: "ana@example.com" } };
    const next = mockNext();

    validateAuthor(req, {}, next);

    expect(next.passed()).toBe(true);
  });

  test("error 400 si falta name", () => {
    const req = { body: { email: "ana@example.com" } };
    const next = mockNext();

    validateAuthor(req, {}, next);

    expect(next.error()).toBeInstanceOf(Error);
    expect(next.error().status).toBe(400);
  });

  test("error 400 si falta email", () => {
    const req = { body: { name: "Ana" } };
    const next = mockNext();

    validateAuthor(req, {}, next);

    expect(next.error()).toBeInstanceOf(Error);
    expect(next.error().status).toBe(400);
  });

  test("error 400 si name es string vacío", () => {
    const req = { body: { name: "", email: "ana@example.com" } };
    const next = mockNext();

    validateAuthor(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si name es solo espacios", () => {
    const req = { body: { name: "   ", email: "ana@example.com" } };
    const next = mockNext();

    validateAuthor(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si email no tiene formato válido", () => {
    const req = { body: { name: "Ana", email: "noesunmail" } };
    const next = mockNext();

    validateAuthor(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si email no tiene dominio", () => {
    const req = { body: { name: "Ana", email: "ana@" } };
    const next = mockNext();

    validateAuthor(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("sanitiza name con trim y email en minúsculas", () => {
    const req = { body: { name: "  Ana  ", email: "  ANA@EXAMPLE.COM  " } };
    const next = mockNext();

    validateAuthor(req, {}, next);

    expect(next.passed()).toBe(true);
    expect(req.body.name).toBe("Ana");
    expect(req.body.email).toBe("ana@example.com");
  });
});

describe("validatePost", () => {
  test("llama next() sin error si title, content y author_id son válidos", () => {
    const req = { body: { title: "Título", content: "Contenido", author_id: 1 } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.passed()).toBe(true);
  });

  test("error 400 si falta title", () => {
    const req = { body: { content: "Contenido", author_id: 1 } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si falta author_id", () => {
    const req = { body: { title: "Título", content: "Contenido" } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si author_id es string no numérico", () => {
    const req = { body: { title: "Título", content: "Contenido", author_id: "abc" } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si author_id es negativo", () => {
    const req = { body: { title: "Título", content: "Contenido", author_id: -1 } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si title es solo espacios", () => {
    const req = { body: { title: "   ", content: "Contenido", author_id: 1 } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("sanitiza title y content con trim", () => {
    const req = { body: { title: "  Mi título  ", content: "  Contenido  ", author_id: 1 } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.passed()).toBe(true);
    expect(req.body.title).toBe("Mi título");
    expect(req.body.content).toBe("Contenido");
  });

  test("llama next() sin error si published es true", () => {
    const req = { body: { title: "T", content: "C", author_id: 1, published: true } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.passed()).toBe(true);
  });

  test("llama next() sin error si published es false", () => {
    const req = { body: { title: "T", content: "C", author_id: 1, published: false } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.passed()).toBe(true);
  });

  test("llama next() sin error si published no está presente", () => {
    const req = { body: { title: "T", content: "C", author_id: 1 } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.passed()).toBe(true);
  });

  test("error 400 si published es un string", () => {
    const req = { body: { title: "T", content: "C", author_id: 1, published: "true" } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si published es un número", () => {
    const req = { body: { title: "T", content: "C", author_id: 1, published: 1 } };
    const next = mockNext();

    validatePost(req, {}, next);

    expect(next.error().status).toBe(400);
  });
});

describe("validateIntParam", () => {
  test("llama next() sin error si el parámetro es un entero positivo", () => {
    const req = { params: { id: "5" } };
    const next = mockNext();

    validateIntParam("id")(req, {}, next);

    expect(next.passed()).toBe(true);
    expect(req.params.id).toBe(5);
  });

  test("error 400 si el parámetro es texto no numérico", () => {
    const req = { params: { id: "abc" } };
    const next = mockNext();

    validateIntParam("id")(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si el parámetro es 0", () => {
    const req = { params: { id: "0" } };
    const next = mockNext();

    validateIntParam("id")(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si el parámetro es negativo", () => {
    const req = { params: { id: "-3" } };
    const next = mockNext();

    validateIntParam("id")(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("error 400 si el parámetro es decimal", () => {
    const req = { params: { id: "1.5" } };
    const next = mockNext();

    validateIntParam("id")(req, {}, next);

    expect(next.error().status).toBe(400);
  });

  test("normaliza el parámetro a número entero", () => {
    const req = { params: { authorId: "42" } };
    const next = mockNext();

    validateIntParam("authorId")(req, {}, next);

    expect(next.passed()).toBe(true);
    expect(req.params.authorId).toBe(42);
  });
});
