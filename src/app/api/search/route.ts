import type { NextRequest } from "next/server";
import { isValidEan, lookupProduct } from "@/lib/leclerc";

export async function GET(request: NextRequest) {
  const ean = request.nextUrl.searchParams.get("ean")?.replace(/\s/g, "") ?? "";

  if (!isValidEan(ean)) {
    return Response.json(
      { error: "Code EAN invalide. Il doit contenir exactement 13 chiffres." },
      { status: 400 },
    );
  }

  try {
    const result = await lookupProduct(ean);
    if (result.status === "not_found") {
      return Response.json({ error: "Produit non trouvé" }, { status: 404 });
    }
    return Response.json(result.product);
  } catch (err) {
    const timeout = err instanceof Error && err.name === "TimeoutError";
    console.error("[api/search]", ean, err instanceof Error ? err.message : err);
    return Response.json(
      { error: timeout ? "Délai d'attente dépassé" : "Erreur lors de la récupération du produit" },
      { status: timeout ? 504 : 502 },
    );
  }
}
