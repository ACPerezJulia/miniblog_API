const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Email duplicado (violación de constraint UNIQUE en PostgreSQL)
  if (err.code === "23505") {
    return res.status(409).json({ error: "El email ya está registrado" });
  }

  // Foreign key inválida (author_id no existe)
  if (err.code === "23503") {
    return res.status(400).json({ error: "El autor indicado no existe" });
  }

  // Tipo de dato inválido en parámetro de consulta SQL
  if (err.code === "22P02") {
    return res.status(400).json({ error: "Identificador inválido" });
  }

  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
};

export default errorHandler;
