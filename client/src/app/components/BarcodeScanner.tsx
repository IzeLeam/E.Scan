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
      setActive(false); // Désactive après détection
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
        <button
          onClick={() => setActive(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Activer le scanner
        </button>
      )}
    </div>
  );
}
