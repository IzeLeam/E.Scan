"use client";

import React, { useEffect, useRef } from "react";
// @ts-expect-error: quagga n’a pas de types disponibles
import Quagga from "quagga";

type Props = {
  active: boolean;
  setActive: (value: boolean) => void;
  onDetected: (code: string) => void;
};

export default function BarcodeScanner({ active, setActive, onDetected }: Props) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current || !scannerRef.current) return;

    startedRef.current = true;

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["ean_reader"],
        },
      },
      (err: Error | null) => {
        if (err) {
          console.error("Quagga init error:", err);
          startedRef.current = false;
          return;
        }
        Quagga.start();
      }
    );

    const onDetectedHandler = (result: { codeResult: { code: string } }) => {
      const code = result.codeResult.code;
      onDetected(code);
      setActive(false);
    };

    Quagga.onDetected(onDetectedHandler);

    return () => {
      Quagga.offDetected(onDetectedHandler);
      Quagga.stop();
      startedRef.current = false;
    };
  }, [active, onDetected, setActive]);

  return (
    <div className="w-full">
      {active ? (
        <div ref={scannerRef} className="w-full h-64 bg-black" />
      ) : (
        <div className="w-full h-64 bg-black flex flex-col items-center justify-center">
          <button
            onClick={() => setActive(true)}
            className="ml-4 px-4 py-2 bg-black text-white rounded border border-white"
          >
            Activer le scanner
          </button>
          <span className="text-red mt-3 ml-2">En cours de développement</span>
        </div>
      )}
    </div>
  );
}
