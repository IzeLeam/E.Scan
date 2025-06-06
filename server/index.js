const express = require("express");
const axios = require("axios");
const https = require("https");
const fs = require("fs");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the E.Leclerc Product Search API");
});

async function handleSearch(ean, res) {
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
        const cookies = fs.readFileSync("cookies.txt", "utf8").trim();
        console.log("Using cookies:", cookies);
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
            Cookie: cookies,
        });

        res.json(response.data);
    } catch (error) {
        console.error("Erreur API:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}

// POST /search (ex: via curl, Postman, frontend)
app.post("/search", async (req, res) => {
    const ean = req.body.ean;
    await handleSearch(ean, res);
});

// GET /search?ean=... (ex: depuis un navigateur)
app.get("/search", async (req, res) => {
    const ean = req.query.ean;
    await handleSearch(ean, res);
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
