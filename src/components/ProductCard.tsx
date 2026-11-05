"use client";

import { motion } from "motion/react";
import type { Product } from "@/lib/leclerc";
import ImageCarousel from "./ImageCarousel";
import { useToast } from "./Toast";

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default function ProductCard({ product }: { product: Product }) {
  const notify = useToast();

  const share = async () => {
    const url = `${window.location.origin}/?ean=${product.ean}`;
    const title = `E.Scan – ${product.title.length > 30 ? `${product.title.slice(0, 30)}…` : product.title}`;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      notify("Lien copié");
    } else {
      window.prompt("Copiez ce lien :", url);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="overflow-hidden rounded-3xl bg-white text-navy shadow-2xl shadow-black/30"
    >
      <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0 flex-1">
          {product.brand && (
            <p className="text-xs font-medium text-slate-500">{product.brand}</p>
          )}
          <h2 className="text-lg leading-snug font-bold">{product.title}</h2>
          <p className="mt-0.5 font-mono text-xs text-slate-400">{product.ean}</p>
        </div>
        <button
          type="button"
          onClick={share}
          aria-label="Partager"
          title="Partager"
          className="rounded-xl p-2.5 text-accent transition hover:bg-accent/10 active:scale-95"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </button>
      </header>

      <ImageCarousel images={product.images} alt={product.title} />

      <div className="mx-4 mb-4 rounded-2xl bg-navy text-white">
        {product.available ? (
          <dl className="grid grid-cols-2 divide-x divide-white/15 py-5 text-center">
            <div>
              <dt className="text-sm text-white/60">Prix</dt>
              <dd className="text-2xl font-bold text-accent">
                {product.price != null ? euros.format(product.price) : "N/A"}
              </dd>
              {product.crossedOutPrice != null && product.crossedOutPrice > (product.price ?? 0) && (
                <dd className="text-xs text-white/50 line-through">
                  {euros.format(product.crossedOutPrice)}
                </dd>
              )}
              {product.unitPrice && (
                <dd className="text-xs text-white/50">{product.unitPrice}</dd>
              )}
            </div>
            <div>
              <dt className="text-sm text-white/60">Stock</dt>
              <dd className={`text-2xl font-bold ${product.stock > 0 ? "text-white" : "text-red-300"}`}>
                {product.stock}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="py-5 text-center text-lg font-semibold text-red-300">
            Non disponible en magasin
          </p>
        )}
      </div>

      {product.description && (
        <details open className="group border-t border-slate-100">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-bold">
            Description
            <svg className="h-5 w-5 text-slate-400 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
            {product.description}
          </p>
        </details>
      )}
    </motion.article>
  );
}
