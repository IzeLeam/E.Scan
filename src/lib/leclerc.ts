import "server-only";
import { cacheLife } from "next/cache";

const BASE_URL = "https://www.e.leclerc";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36";
const TIMEOUT_MS = 10_000;

export const STORE_CODE = process.env.LECLERC_STORE_CODE ?? "0772";

export type Product = {
  ean: string;
  title: string;
  brand: string | null;
  description: string | null;
  images: string[];
  /** Le produit est référencé dans le magasin. */
  available: boolean;
  price: number | null;
  crossedOutPrice: number | null;
  unitPrice: string | null;
  stock: number;
};

export type LookupResult =
  | { status: "found"; product: Product }
  | { status: "not_found" };

export const isValidEan = (ean: string) => /^\d{13}$/.test(ean);

/**
 * Cherche un produit par EAN dans le magasin configuré.
 * 1. API d'offres : prix et stock du magasin, titre et slug de la fiche.
 * 2. Fiche produit HTML (JSON-LD) : description et toutes les images.
 * Les réponses sont gardées en cache une minute.
 */
export async function lookupProduct(ean: string): Promise<LookupResult> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });

  const offerId = `m-${ean}-${STORE_CODE}`;
  const url =
    `${BASE_URL}/api/rest/offer/stores/0100-0000-${STORE_CODE}/by-ids` +
    `?offerIds=${encodeURIComponent(offerId)}&startPosition=0`;

  const res = await fetch(url, {
    headers: { accept: "text/plain", "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Leclerc offer API responded ${res.status}`);

  const data: OfferResponse = await res.json();
  const item = data.items?.[0];
  if (!item) return { status: "not_found" };

  const { offer } = item;
  const available =
    offer?.price?.offerAvailabilityStatus !== "unavailable" &&
    (offer?.price?.price ?? 0) > 0;

  const details = await fetchProductPage(offer?.electedOffer?.slug);

  const images = details?.images.length
    ? details.images
    : item.product?.image
      ? [item.product.image]
      : [];

  return {
    status: "found",
    product: {
      ean,
      title: item.product?.title?.trim() || details?.name || "Titre non disponible",
      brand: item.product?.brand ?? null,
      description: details?.description ?? null,
      images: images.filter(isTrustedImage),
      available,
      price: available ? (offer?.price?.price ?? null) : null,
      crossedOutPrice: available ? (offer?.price?.crossedOutPrice ?? null) : null,
      unitPrice: offer?.price?.pricePerUnit
        ? `${offer.price.pricePerUnit.value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${offer.price.pricePerUnit.unit}`
        : null,
      stock: available ? Math.max(0, offer?.electedOffer?.stock ?? 0) : 0,
    },
  };
}

/** Lit le bloc JSON-LD `Product` de la fiche produit. Ne bloque jamais la recherche. */
async function fetchProductPage(slug: string | undefined) {
  if (!slug || !/^fp\/[\w-]+/.test(slug)) return null;
  try {
    const res = await fetch(`${BASE_URL}/${slug.split("?")[0]}`, {
      headers: {
        accept: "text/html",
        "accept-language": "fr-FR,fr;q=0.9",
        "user-agent": USER_AGENT,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const blocks = html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    );
    for (const [, json] of blocks) {
      let ld: JsonLdProduct;
      try {
        ld = JSON.parse(json);
      } catch {
        continue;
      }
      if (ld?.["@type"] !== "Product") continue;
      const images = Array.isArray(ld.image) ? ld.image : ld.image ? [ld.image] : [];
      return {
        name: ld.name ? decodeEntities(ld.name).trim() : null,
        description: ld.description
          ? decodeEntities(ld.description).replace(/\s+/g, " ").trim() || null
          : null,
        images: images.filter((u): u is string => typeof u === "string"),
      };
    }
    return null;
  } catch (err) {
    console.warn("[leclerc] product page unavailable:", (err as Error).message);
    return null;
  }
}

function isTrustedImage(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return (
      protocol === "https:" &&
      (hostname === "media.e.leclerc" || hostname.endsWith(".filerobot.com"))
    );
  } catch {
    return false;
  }
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
};

function decodeEntities(text: string) {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === "#") {
        const code = entity[1].toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
    });
}

type OfferResponse = {
  total?: number;
  items?: {
    ean: string;
    product?: { title?: string; brand?: string; image?: string };
    offer?: {
      electedOffer?: { stock?: number; slug?: string; shopName?: string };
      price?: {
        price?: number;
        crossedOutPrice?: number;
        pricePerUnit?: { value: number; unit: string };
        offerAvailabilityStatus?: string;
      };
    };
  }[];
};

type JsonLdProduct = {
  "@type"?: string;
  name?: string;
  description?: string;
  image?: string | string[];
};
