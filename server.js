if (process.env.NODE_ENV !== "production") {
  const { default: dotenv } = await import("dotenv");
  dotenv.config();
}

const hasDbUrl = !!process.env.DATABASE_URL;
const hasSeparateVars =
  process.env.DB_HOST &&
  process.env.DB_PORT &&
  process.env.DB_NAME &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD;

if (!hasDbUrl && !hasSeparateVars) {
  console.error(
    "Error: se requiere DATABASE_URL o las variables DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD",
  );
  process.exit(1);
}

const { createApp } = await import("./app.js");
const { default: pool } = await import("./src/db/config.js");

const PORT = process.env.PORT || 3000;

createApp({ pool }).listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
