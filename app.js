import express from "express";
import { createAuthorsRouter } from "./src/routes/authors.routes.js";
import { createPostsRouter } from "./src/routes/posts.routes.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerDocument = yaml.load(
  readFileSync(join(__dirname, "docs/openapi.yaml"), "utf8"),
);

export function createApp({ pool }) {
  const app = express();
  app.use(express.json());

  app.use("/authors", createAuthorsRouter(pool));
  app.use("/posts", createPostsRouter(pool));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(errorHandler);

  return app;
}
