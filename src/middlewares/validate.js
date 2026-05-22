import { badRequest } from "../../errors.js";

export const validateIntParam = (paramName) => (req, res, next) => {
  const raw = req.params[paramName];
  const parsed = parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== raw) {
    return next(badRequest(`El parámetro '${paramName}' debe ser un número entero positivo`));
  }
  req.params[paramName] = parsed;
  next();
};

export const validateAuthor = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("El nombre es obligatorio");
  }

  if (!email || typeof email !== "string") {
    errors.push("El email es obligatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())) {
    errors.push("El email no tiene un formato válido");
  }

  if (errors.length) return next(badRequest(errors.join(". ")));

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

export const validatePost = (req, res, next) => {
  const { title, content, author_id, published } = req.body;
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

  if (published !== undefined && typeof published !== "boolean") {
    errors.push("El campo published debe ser un booleano (true o false)");
  }

  if (errors.length) return next(badRequest(errors.join(". ")));

  req.body.title = title.trim();
  req.body.content = content.trim();
  next();
};
