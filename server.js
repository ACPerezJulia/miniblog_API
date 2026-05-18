if (process.env.NODE_ENV !== "production") {
  const { default: dotenv } = await import("dotenv");
  dotenv.config();
}

const { createApp } = await import("./app.js");
const { default: pool } = await import("./src/db/config.js");

const PORT = process.env.PORT || 3000;

createApp({ pool }).listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
