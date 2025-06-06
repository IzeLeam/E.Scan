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
            Cookie: "_ga_NCQNKB4YT9=GS2.1.s1749205878$o6$g0$t1749205878$j60$l0$h433765593; _ga=GA1.1.1934137953.1731881037; FPID=FPID2.2.2bFTWTWA7oXa3lRDg1cAyo8e%2B1PaG64cCIeuE3hSdiQ%3D.1731881037; _scid=dcb54422-22d1-49b3-2661-37f13b059b8e; _cs_c=0; _fbp=fb.1.1731881037072.1292402548; cto_bundle=hjabn195ZTFjTWNHdHlPTTZDWDlscnVEUUxZWTBBYjVUaDElMkI3N0loRyUyRjBHdDNsa2J6dVFoM3A4JTJGd1B0ajNZc0NhbGxZamU1akExdFlYdENJenJia0ZzeWVWWWpXNzRlT0xRVGZZVElWbzlXJTJCUU1zSnhzYzFFUHlnRDlydExnYW13UEVVVWpzYU1oVXpFeEJPaSUyRnhBNEx5M2lBJTNEJTNE; __rtb…8; FPLC=WFY4BEPZZAuQgZtcE%2BEhQQut5fVPqZ45S1cvR%2Bwxj4XMbpXmiWxeS4yMeWeSuzyQZ2sSfiwZpPtpAeqNGCcqTajxxNofO35GdcX16h4cd5mPTEgiUIvgEmPx2%2FMS2g%3D%3D; FPGSID=1.1749205878.1749205878.G-NCQNKB4YT9.w3qIZUnq9LQtwSW3t2aqOA; gtm_nbpv=1; _cs_s=1.5.0.9.1749207709174; _dd_s=rum=0&expire=1749206808983; _uetsid=628ba36042c111f0a5f8fd4ee5aac736; _uetvid=d7d32040a52f11ef9e0de36ef44eaf20; ABTastySession=mrasn=&lp=https%253A%252F%252Fwww.e.leclerc%252F%253Fsrsltid%253DAfmBOorwInEQA3IMr73U9RjOKc3N_xYWzXolmzEHkOb30wyg6Q53faKH"
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
