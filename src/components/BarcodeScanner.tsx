"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { QuaggaJSResultObject } from "@ericblade/quagga2";
import { AnimatePresence, motion } from "motion/react";

/** Nombre de lectures identiques consécutives avant d'accepter un code. */
const CONFIRMATIONS = 2;
/** Erreur médiane maximale tolérée sur les barres décodées (cf. exemple quagga2). */
const MAX_MEDIAN_ERROR = 0.25;

function medianError(result: QuaggaJSResultObject) {
  const errors = result.codeResult.decodedCodes
    .map((c) => c.error)
    .filter((e): e is number => typeof e === "number")
    .sort((a, b) => a - b);
  if (errors.length === 0) return 1;
  const half = Math.floor(errors.length / 2);
  return errors.length % 2 ? errors[half] : (errors[half - 1] + errors[half]) / 2;
}

export default function BarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const onDetectedRef = useRef(onDetected);

  useLayoutEffect(() => {
    onDetectedRef.current = onDetected;
  });

  useLayoutEffect(() => {
    if (!scanning) return;

    let cancelled = false;
    let quagga: typeof import("@ericblade/quagga2").default | null = null;
    let last: string | null = null;
    let streak = 0;

    const handleDetected = (result: QuaggaJSResultObject) => {
      const code = result.codeResult.code;
      if (!code || !/^\d{13}$/.test(code) || medianError(result) > MAX_MEDIAN_ERROR) return;
      streak = code === last ? streak + 1 : 1;
      last = code;
      if (streak >= CONFIRMATIONS) {
        setScanning(false);
        onDetectedRef.current(code);
      }
    };

    (async () => {
      // Laisse passer un tick : si le composant est démonté aussitôt, on n'ouvre pas la caméra.
      await new Promise((r) => setTimeout(r, 1));
      if (cancelled || !targetRef.current) return;

      quagga = (await import("@ericblade/quagga2")).default;
      if (cancelled) return;

      try {
        await quagga.init({
          inputStream: {
            type: "LiveStream",
            target: targetRef.current,
            constraints: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            area: { top: "25%", right: "10%", bottom: "25%", left: "10%" },
          },
          locator: { patchSize: "medium", halfSample: true, willReadFrequently: true },
          decoder: { readers: ["ean_reader"] },
          locate: true,
        });
        if (cancelled) {
          await quagga.stop();
          return;
        }
        quagga.onDetected(handleDetected);
        quagga.start();
      } catch (err) {
        console.error("Quagga init error:", err);
        if (!cancelled) {
          setError("Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.");
          setScanning(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (quagga) {
        quagga.offDetected(handleDetected);
        void quagga.stop();
      }
    };
  }, [scanning]);

  return (
    <div className="w-full">
      <div
        className="relative h-60 w-full overflow-hidden rounded-3xl border border-white/10 bg-black/30"
      >
        <div ref={targetRef} className="scanner-viewport absolute inset-0" />

        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div
              key="frame"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-1/2 w-4/5 rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(16,37,66,0.45)]">
                <motion.div
                  className="mx-3 h-0.5 rounded-full bg-accent"
                  animate={{ y: [8, 104, 8] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setScanning(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-hover active:scale-95"
              >
                <BarcodeIcon />
                Scanner un produit
              </button>
              {error && <p className="text-sm text-red-300">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {scanning && (
          <button
            type="button"
            onClick={() => setScanning(false)}
            className="absolute right-3 bottom-3 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            Arrêter
          </button>
        )}
      </div>
    </div>
  );
}

function BarcodeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M14 8v8M17 8v8" />
    </svg>
  );
}
