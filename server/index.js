const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { handleSearch } = require("./leclerc");

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/search", limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "https://escan.lucaprc.fr",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" })); // Limit body size

// Trust proxy (if behind reverse proxy like nginx)
app.set("trust proxy", 1);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ 
    name: "E.Leclerc Product Search API",
    version: "1.0.0",
    endpoints: {
      search: "/search?ean={13-digit-code}",
      health: "/health"
    }
  });
});

// EAN validation middleware
const validateEAN = (req, res, next) => {
  const ean = req.query.ean;
  
  if (!ean) {
    return res.status(400).json({ error: "Le paramètre 'ean' est requis" });
  }
  
  // EAN-13 validation: must be exactly 13 digits
  if (!/^\d{13}$/.test(ean)) {
    return res.status(400).json({ 
      error: "Code EAN invalide. Doit contenir exactement 13 chiffres." 
    });
  }
  
  next();
};

app.get("/search", validateEAN, async (req, res) => {
  const ean = req.query.ean;
  await handleSearch(ean, res);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint non trouvé" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Accès refusé" });
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === "production" 
      ? "Erreur interne du serveur" 
      : err.message 
  });
});

const PORT = process.env.PORT || 9999;
const server = app.listen(PORT, () => {
  console.log(`[INFO] Server running on port ${PORT}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || "development"}`);
});

const shutdown = () => {
  console.log("\n[INFO] Shutting down server gracefully...");
  server.close(() => {
    console.log("[INFO] Server shut down successfully");
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("[ERROR] Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", (err) => {
  console.error("[ERROR] Uncaught Exception:", err);
  shutdown();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[ERROR] Unhandled Rejection at:", promise, "reason:", reason);
  shutdown();
});

module.exports = app;
