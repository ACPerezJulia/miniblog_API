export const validateAuthor = (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ error: "El nombre y el email son obligatorios" });
  }

  next();
};

export const validatePost = (req, res, next) => {
  const { title, content, author_id } = req.body;

  if (!title || !content || !author_id) {
    return res
      .status(400)
      .json({ error: "El título, contenido e ID de autor son obligatorios" });
  }

  next();
};
