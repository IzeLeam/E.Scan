import axios from "axios";
import fs from "fs";

export async function handleSearch(ean, res) {
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
      Host: "www.e.leclerc",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json",
      Origin: "https://www.e.leclerc",
      Referer: `https://www.e.leclerc/recherche?q=${ean}&result=0`,
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
      Cookie: fs.readFileSync("cookies.txt", "utf8").trim(),
    };

    const response = await axios.post(
      "https://www.e.leclerc/api/rest/live-api/product-search",
      payload,
      { headers }
    );

    const rawData = response.data;
    let data = {};

    // Get the title (data.title)
    const title = rawData.items?.[0]?.label || "No title found";
    data.title = title;

    // Get the description (data.description)
    const description =
      rawData.items?.[0]?.variants?.[0]?.attributes?.find(
        (attr) => attr.code == "description"
      )?.value || "No description found";
    data.description = description;

    // Get the images (data.images[])
    const images =
      rawData.items?.[0]?.variants?.[0]?.attributes
        ?.filter((attr) => attr.type === "image")
        ?.map((attr) => attr.value.url)
        .filter((url) => /^https:\/\/media\.e\.leclerc/.test(url)) || [];
    data.images = images;

    // Get the offer of our local store (data.offer)
    const offer =
      rawData.items?.[0]?.variants?.[0]?.offers?.find(
        (offer) => offer.shop?.signCode === "0772"
      ) || {};

    data.offer = !!offer;

    // Get the price (data.price)
    let price = offer.basePrice?.price?.priceWithAllTaxes || "No price found";
    if (typeof price === "string") {
      price = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    }
    if (isNaN(price)) {
      price = 0.0;
    }
    // Convert price to a string with two decimal places
    price = (price / 100).toFixed(2);
    if (isNaN(price)) {
      price = 0.0;
    }
    data.price = price;

    // Get the stock (data.stock)
    let stock = offer.stock || "No stock information found";
    if (typeof stock === "string") {
      stock = 0;
    }
    data.stock = stock > 0 ? stock + 1 : stock;

    data.rawData = rawData;

    res.status(200).json(data);
  } catch (err) {
    console.error(
      "Error while fetching data:",
      err.message,
      err.stack,
      err.response,
      err.response?.status,
      err.response?.data
    );
    res.status(500).json({
      error: "Request failed",
      status: err.response?.status,
      details: err.response?.data,
    });
  }
}