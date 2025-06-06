const express = require("express");
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const app = express();
app.use(express.json());

async function getLeclercCookies() {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
  
    try {
      // Simulation d'un vrai navigateur
      await client.get("https://www.e.leclerc/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
  
      const cookies = await jar.getCookieString("https://www.e.leclerc/");
      console.log("✅ Cookies récupérés depuis le VPS :\n");
      console.log(cookies);
  
      return cookies;
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des cookies :", err.message);
      return null;
    }
  }

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
        let cookies = await getLeclercCookies();
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
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // Pour ignorer les erreurs SSL
            }),
            jar: new CookieJar(), // Utilisation du jar pour les cookies
            withCredentials: true, // Pour envoyer les cookies
            headers: {
                Cookie: cookies, // Ajout des cookies récupérés
            },
        }
        );

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
