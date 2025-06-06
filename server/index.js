const express = require("express");
const axios = require("axios");
const https = require("https");
const fs = require("fs");

const app = express();
app.use(express.json());

app.post("/search", async (req, res) => {
  const ean = req.body.ean;
  if (!ean) return res.status(400).json({ error: "Missing 'ean'" });

  const payload = {
    text: ean,
    filters: {
      "oaf-sign-code": { value: ["0772", "0100", "0000"] },
    },
    page: 1,
    size: 32,
    language: "fr-FR",
    pertimmContexts: [{ sessionShopSignCode: "0772" }],
  };

  try {
    const response = await axios.post(
      "https://www.e.leclerc/api/rest/live-api/product-search",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
          "User-Agent": "Mozilla/5.0",
          Origin: "https://www.e.leclerc",
          Referer: `https://www.e.leclerc/recherche?q=${ean}&result=0`,
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // à ajuster selon ton VPS
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Erreur API:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
