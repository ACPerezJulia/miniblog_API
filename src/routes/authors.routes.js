import { Router } from "express";
import authorsService from "../services/authors.service.js";
import { validateAuthor } from "../middlewares/validate.js";

const router = Router();

// Obtener todos los autores
router.get("/", async (req, res, next) => {
  try {
    const authors = await authorsService.getAllAuthors();
    res.json(authors);
  } catch (error) {
    next(error);
  }
});

// Obtener un autor por ID
router.get("/:id", async (req, res, next) => {
  try {
    const author = await authorsService.getAuthorById(req.params.id);
    if (!author) return res.status(404).json({ error: "Autor no encontrado" });
    res.json(author);
  } catch (error) {
    next(error);
  }
});

// Crear un autor
router.post("/", validateAuthor, async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;
    const author = await authorsService.createAuthor({ name, email, bio });
    res.status(201).json(author);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    next(error);
  }
});

// Actualizar un autor
router.put("/:id", validateAuthor, async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;
    const author = await authorsService.updateAuthor(req.params.id, {
      name,
      email,
      bio,
    });
    if (!author) return res.status(404).json({ error: "Autor no encontrado" });
    res.json(author);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    next(error);
  }
});

// Eliminar un autor
router.delete("/:id", async (req, res, next) => {
  try {
    const author = await authorsService.deleteAuthor(req.params.id);
    if (!author) return res.status(404).json({ error: "Autor no encontrado" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
