import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache the cookie to avoid reading file on every request
let cachedCookie = null;
let cookieLastRead = 0;
const COOKIE_CACHE_TTL = 60000; // 1 minute

async function getCookie() {
  const now = Date.now();
  
  // Return cached cookie if still valid
  if (cachedCookie && (now - cookieLastRead) < COOKIE_CACHE_TTL) {
    return cachedCookie;
  }
  
  try {
    // Try environment variable first (most secure)
    if (process.env.LECLERC_COOKIE) {
      cachedCookie = process.env.LECLERC_COOKIE.trim();
      cookieLastRead = now;
      return cachedCookie;
    }
    
    // Fallback to file (less secure, but backwards compatible)
    const cookiePath = path.join(__dirname, "cookies.txt");
    cachedCookie = (await fs.readFile(cookiePath, "utf8")).trim();
    cookieLastRead = now;
    return cachedCookie;
  } catch (err) {
    console.error("[ERROR] Failed to load cookie:", err.message);
    throw new Error("Configuration error: Cookie not found");
  }
}

// Cache for product data (optional, improves performance)
const productCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedProduct(ean) {
  const cached = productCache.get(ean);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedProduct(ean, data) {
  productCache.set(ean, {
    data,
    timestamp: Date.now(),
  });
  
  // Limit cache size to prevent memory leaks
  if (productCache.size > 1000) {
    const firstKey = productCache.keys().next().value;
    productCache.delete(firstKey);
  }
}

export async function handleSearch(ean, res) {
  // Input validation (double-check, even with middleware)
  if (!ean || !/^\d{13}$/.test(ean)) {
    return res.status(400).json({ error: "Code EAN invalide" });
  }

  // Check cache first
  const cachedData = getCachedProduct(ean);
  if (cachedData) {
    return res.status(200).json({ ...cachedData, cached: true });
  }

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
    const cookie = await getCookie();
    
    const headers = {
      Host: "www.e.leclerc",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json",
      Origin: "https://www.e.leclerc",
      Referer: `https://www.e.leclerc/recherche?q=${encodeURIComponent(ean)}&result=0`,
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
      Cookie: cookie,
    };

    const response = await axios.post(
      "https://www.e.leclerc/api/rest/live-api/product-search",
      payload,
      { 
        headers,
        timeout: 10000, // 10 second timeout
      }
    );

    const rawData = response.data;
    
    // Check if product exists
    if (!rawData.items || rawData.items.length === 0) {
      return res.status(404).json({ 
        error: "Produit non trouvé",
        ean 
      });
    }

    const item = rawData.items[0];
    const variant = item.variants?.[0];
    const attributes = variant?.attributes || [];

    // Build response data
    const data = {
      title: item.label || "Titre non disponible",
      description: attributes.find(attr => attr.code === "description")?.value || "Description non disponible",
      images: attributes
        .filter(attr => attr.type === "image")
        .map(attr => attr.value.url)
        .filter(url => /^https:\/\/media\.e\.leclerc/.test(url)),
      offer: false,
      price: 0,
      stock: 0,
      rawData: rawData,
    };

    // Get offer for local store
    const offer = variant?.offers?.find(
      offer => offer.shop?.signCode === "0772"
    );

    if (offer) {
      data.offer = true;
      
      // Parse price safely
      let priceValue = offer.basePrice?.price?.priceWithAllTaxes || 0;
      if (typeof priceValue === "string") {
        priceValue = parseFloat(priceValue.replace(/[^0-9.-]+/g, ""));
      }
      data.price = isNaN(priceValue) ? 0 : (priceValue / 100).toFixed(2);

      // Parse stock safely
      let stockValue = offer.stock || 0;
      data.stock = typeof stockValue === "number" && stockValue > 0 ? stockValue + 1 : 0;
    }

    // Cache the result
    setCachedProduct(ean, data);

    res.status(200).json(data);
  } catch (err) {
    // Log full error for debugging (but don't expose to client)
    console.error("[ERROR] Error fetching product:", {
      ean,
      message: err.message,
      status: err.response?.status,
    });

    // Send sanitized error to client
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    
    if (err.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Délai d'attente dépassé" });
    }

    res.status(500).json({ 
      error: process.env.NODE_ENV === "production"
        ? "Erreur lors de la récupération du produit"
        : err.message
    });
  }
}
