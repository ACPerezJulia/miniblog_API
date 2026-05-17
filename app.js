import express from "express";
import authorsRoutes from "./src/routes/authors.routes.js";
import postsRoutes from "./src/routes/posts.routes.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import yaml from "js-yaml";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Rutas
app.use("/authors", authorsRoutes);
app.use("/posts", postsRoutes);

// Swagger
const swaggerDocument = yaml.load(
  readFileSync(join(__dirname, "docs/openapi.yaml"), "utf8"),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware de errores (siempre al final)
app.use(errorHandler);

export default app;
