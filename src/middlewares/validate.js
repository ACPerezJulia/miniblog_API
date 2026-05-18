import { badRequest } from "../../errors.js";

export const validateAuthor = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("El nombre es obligatorio");
  }

  if (!email || typeof email !== "string") {
    errors.push("El email es obligatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("El email no tiene un formato válido");
  }

  if (errors.length) return next(badRequest(errors.join(". ")));
  next();
};

export const validatePost = (req, res, next) => {
  const { title, content, author_id } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("El título es obligatorio");
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    errors.push("El contenido es obligatorio");
  }

  const authorId = Number(author_id);
  if (!author_id || !Number.isInteger(authorId) || authorId <= 0) {
    errors.push("El ID de autor debe ser un número entero positivo");
  }

  if (errors.length) return next(badRequest(errors.join(". ")));
  next();
};
