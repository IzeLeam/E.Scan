"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/leclerc";
import BarcodeScanner from "./BarcodeScanner";
import ProductCard from "./ProductCard";
import { useToast } from "./Toast";

const EAN_RE = /^\d{13}$/;
const AUTOSCROLL_KEY = "escan:autoscroll";

/** Préférence auto-scroll mémorisée sur l'appareil (activée par défaut). */
const autoScrollStore = {
  listeners: new Set<() => void>(),
  get(): boolean {
    try {
      return localStorage.getItem(AUTOSCROLL_KEY) !== "0";
    } catch {
      return true;
    }
  },
  set(value: boolean) {
    try {
      localStorage.setItem(AUTOSCROLL_KEY, value ? "1" : "0");
    } catch {}
    autoScrollStore.listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    autoScrollStore.listeners.add(listener);
    return () => autoScrollStore.listeners.delete(listener);
  },
};

export default function EScan() {
  const initialEan = useSearchParams().get("ean")?.replace(/\s/g, "") ?? "";
  const notify = useToast();

  const [ean, setEan] = useState(initialEan);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(() => EAN_RE.test(initialEan));
  const [scrolled, setScrolled] = useState(false);
  const autoScroll = useSyncExternalStore(autoScrollStore.subscribe, autoScrollStore.get, () => true);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /** Appel API ; ne modifie l'état qu'une fois la réponse reçue. */
  const fetchProduct = useCallback(
    async (code: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/search?ean=${code}`, { signal: controller.signal });
        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          setProduct(null);
          notify(body.error ?? "Erreur lors de la recherche", { error: true });
          return;
        }

        setProduct(body as Product);
        notify("Produit trouvé");
        inputRef.current?.blur();
        if (autoScrollStore.get()) {
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setProduct(null);
        notify("Impossible de joindre le serveur", { error: true });
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    },
    [notify],
  );

  const search = (code: string) => {
    setLoading(true);
    void fetchProduct(code);
  };

  // Lien partagé : ?ean=…  (loading est déjà initialisé à true dans ce cas)
  useEffect(() => {
    // fetchProduct ne modifie l'état qu'après le `await` du fetch : pas de rendu en cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (EAN_RE.test(initialEan)) void fetchProduct(initialEan);
  }, [initialEan, fetchProduct]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 250);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleChange = (value: string) => {
    const code = value.replace(/\D/g, "").slice(0, 13);
    setEan(code);
    if (EAN_RE.test(code)) {
      search(code);
    } else {
      abortRef.current?.abort();
      setLoading(false);
      setProduct(null);
    }
  };

  const toggleAutoScroll = () => autoScrollStore.set(!autoScroll);

  return (
    <>
      <section className="relative mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-5 py-16">
        <label className="absolute top-5 right-5 flex cursor-pointer items-center gap-2 text-xs font-medium text-white/70">
          Auto-scroll
          <input type="checkbox" checked={autoScroll} onChange={toggleAutoScroll} className="peer sr-only" />
          <span className="relative h-6 w-11 rounded-full bg-white/20 transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-white/60">
            <motion.span
              className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow"
              animate={{ x: autoScroll ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </span>
        </label>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <header>
            <h1 className="text-4xl font-bold tracking-tight text-white">E.Scan</h1>
            <p className="mt-1 text-sm text-white/60">Scannez ou entrez un code-barres</p>
          </header>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="Code EAN"
              placeholder="Code EAN (13 chiffres)"
              value={ean}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full rounded-2xl border-2 border-white/10 bg-white/5 px-5 py-4 pr-12 font-mono text-lg tracking-wider text-white transition outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-white/40 focus:border-accent focus:bg-white/10"
            />
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center">
              {loading ? (
                <span className="m-1.5 h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-accent" aria-label="Recherche…" />
              ) : (
                ean && (
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Effacer"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-accent"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <path d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )
              )}
            </div>
          </div>

          <BarcodeScanner
            onDetected={(code) => {
              setEan(code);
              search(code);
            }}
          />
        </motion.div>
      </section>

      <div ref={resultRef} className="mx-auto w-full max-w-md scroll-mt-4 px-4">
        <AnimatePresence mode="wait">
          {product && <ProductCard key={product.ean} product={product} />}
        </AnimatePresence>
      </div>

      <footer className="mt-auto flex items-center justify-center gap-2 px-4 pt-10 pb-6 text-xs text-white/40">
        <span>© 2026 Luca Pourceau</span>
        <span aria-hidden>•</span>
        <a
          href="https://lucaprc.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 transition hover:text-accent"
        >
          Site web
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
          </svg>
        </a>
      </footer>

      <AnimatePresence>
        {scrolled && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Retour en haut"
            title="Retour en haut"
            className="fixed right-5 bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-xl transition-colors hover:bg-accent-hover"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 10l7-7 7 7M12 3v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
