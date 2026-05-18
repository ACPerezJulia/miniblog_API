const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Email duplicado (violación de constraint UNIQUE en PostgreSQL)
  if (err.code === "23505") {
    return res.status(409).json({ error: "El email ya está registrado" });
  }

  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
};

export default errorHandler;
