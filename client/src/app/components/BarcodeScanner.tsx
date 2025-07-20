"use client";

import React, { useEffect, useRef } from "react";
// BarcodeScanner.tsx
// @ts-expect-error: quagga n’a pas de types disponibles (pas de @types/quagga)
import Quagga from 'quagga';



type Props = {
  onDetected: (code: string) => void;
};

export default function BarcodeScanner({ onDetected }: Props) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    interface QuaggaInputStreamConstraints {
        facingMode: string;
    }

    interface QuaggaInputStreamConfig {
        type: string;
        target: HTMLElement;
        constraints: QuaggaInputStreamConstraints;
    }

    interface QuaggaDecoderConfig {
        readers: string[];
    }

    interface QuaggaConfig {
        inputStream: QuaggaInputStreamConfig;
        decoder: QuaggaDecoderConfig;
    }

    Quagga.init(
        {
            inputStream: {
                type: "LiveStream",
                target: scannerRef.current as HTMLElement,
                constraints: {
                    facingMode: "environment", // caméra arrière
                },
            },
            decoder: {
                readers: ["ean_reader"], // EAN-13
            },
        } as QuaggaConfig,
        (err: Error | null) => {
            if (err) {
                console.error("Quagga init error:", err);
                return;
            }
            Quagga.start();
        }
    );

    interface QuaggaCodeResult {
      code: string;
    }

    interface QuaggaDetectedResult {
      codeResult: QuaggaCodeResult;
    }

    Quagga.onDetected((result: QuaggaDetectedResult) => {
      const code: string = result.codeResult.code;
      onDetected(code);
      Quagga.stop();
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected(() => {});
    };
  }, []);

  return (
    <div>
      <div ref={scannerRef} className="w-full h-64 bg-black" />
      <p className="text-center mt-2 text-sm text-gray-500">Scanner un code EAN-13</p>
    </div>
  );
}