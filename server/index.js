const express = require("express");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({
  origin: 'https://escan.lucaprc.fr',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// GET /
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
    size: 10,
    pertimmContexts: [{ sessionShopSignCode: "0772" }],
  };

  try {
    const headers = {
      "Host": "www.e.leclerc",
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json",
      "Origin": "https://www.e.leclerc",
      "Referer": `https://www.e.leclerc/recherche?q=${ean}&result=0`,
      "Connection": "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Cookie": fs.readFileSync("cookies.txt", "utf8").trim(),
    };

    const response = await axios.post(
      "https://www.e.leclerc/api/rest/live-api/product-search",
      payload,
      { headers }
    );

    const rawData = response.data;

    const images = rawData.items?.[0]?.variants?.[0]?.attributes
      ?.filter(attr => attr.type === "image")
      ?.map(attr => attr.value.url);

    console.log("Images found:", images);

    res.json(response.data);
  } catch (err) {
    console.error("Error while fetching data:", err.response?.status, err.response?.data);
    res.status(500).json({
      error: "Request failed",
      status: err.response?.status,
      details: err.response?.data,
    });
  }
}

app.post("/search", async (req, res) => {
  const ean = req.body.ean;
  await handleSearch(ean, res);
});

app.get("/search", async (req, res) => {
  const ean = req.query.ean;
  await handleSearch(ean, res);
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
