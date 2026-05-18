import { describe, test, expect } from "vitest";
import { validateAuthor, validatePost } from "../../src/middlewares/validate.js";

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
});
