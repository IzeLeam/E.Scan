const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const app = express();

const { handleSearch } = require("./leclerc");

app.use(
  cors({
    origin: [
      "https://escan.lucaprc.fr",
      "http://localhost:3000",
      "http://192.168.1.92:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the E.Leclerc Product Search API");
});

app.get("/search", async (req, res) => {
  const ean = req.query.ean;
  await handleSearch(ean, res);
});

const PORT = process.env.PORT || 9999;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

const shutdown = () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server shut down.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown();
});
