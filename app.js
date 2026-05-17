const express = require("express");
const authorsRoutes = require("./src/routes/authors");
const postsRoutes = require("./src/routes/posts");
const errorHandler = require("./src/middlewares/errorHandler");
const swaggerUi = require("swagger-ui-express");
const YAML = require("js-yaml");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(express.json());

// Rutas
app.use("/authors", authorsRoutes);
app.use("/posts", postsRoutes);

// Swagger
const swaggerDocument = YAML.load(
  fs.readFileSync(path.join(__dirname, "docs/openapi.yaml"), "utf8"),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware de errores (siempre al final)
app.use(errorHandler);

module.exports = app;
