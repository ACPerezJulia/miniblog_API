import { Router } from "express";
import authorsService from "../services/authors.service.js";
import { validateAuthor } from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();

// Obtener todos los autores
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const authors = await authorsService.getAllAuthors();
    res.json(authors);
  }),
);

// Obtener un autor por ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const author = await authorsService.getAuthorById(req.params.id);
    if (!author) return res.status(404).json({ error: "Autor no encontrado" });
    res.json(author);
  }),
);

// Crear un autor
router.post(
  "/",
  validateAuthor,
  asyncHandler(async (req, res) => {
    const { name, email, bio } = req.body;
    const author = await authorsService.createAuthor({ name, email, bio });
    res.status(201).json(author);
  }),
);

// Actualizar un autor
router.put(
  "/:id",
  validateAuthor,
  asyncHandler(async (req, res) => {
    const { name, email, bio } = req.body;
    const author = await authorsService.updateAuthor(req.params.id, {
      name,
      email,
      bio,
    });
    if (!author) return res.status(404).json({ error: "Autor no encontrado" });
    res.json(author);
  }),
);

// Eliminar un autor
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const author = await authorsService.deleteAuthor(req.params.id);
    if (!author) return res.status(404).json({ error: "Autor no encontrado" });
    res.status(204).send();
  }),
);

export default router;
