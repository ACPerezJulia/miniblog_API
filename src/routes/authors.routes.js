import { Router } from "express";
import { createAuthorsService } from "../services/authors.service.js";
import { validateAuthor } from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { notFound } from "../../errors.js";

export function createAuthorsRouter(pool) {
  const router = Router();
  const authorsService = createAuthorsService(pool);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const authors = await authorsService.getAllAuthors();
      res.json(authors);
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res, next) => {
      const author = await authorsService.getAuthorById(req.params.id);
      if (!author) return next(notFound("Autor no encontrado"));
      res.json(author);
    }),
  );

  router.post(
    "/",
    validateAuthor,
    asyncHandler(async (req, res) => {
      const { name, email, bio } = req.body;
      const author = await authorsService.createAuthor({ name, email, bio });
      res.status(201).json(author);
    }),
  );

  router.put(
    "/:id",
    validateAuthor,
    asyncHandler(async (req, res, next) => {
      const { name, email, bio } = req.body;
      const author = await authorsService.updateAuthor(req.params.id, {
        name,
        email,
        bio,
      });
      if (!author) return next(notFound("Autor no encontrado"));
      res.json(author);
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res, next) => {
      const author = await authorsService.deleteAuthor(req.params.id);
      if (!author) return next(notFound("Autor no encontrado"));
      res.status(204).send();
    }),
  );

  return router;
}
