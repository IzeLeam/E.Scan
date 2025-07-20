'use client';

import { useEffect, useRef, useState } from 'react';
// @ts-expect-error: Quagga n’a pas de types
import Quagga from 'quagga';

export default function BarcodeScanner() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(false);

  const startScanner = () => {
    if (!scannerRef.current) {
      console.warn('Scanner ref not ready');
      return;
    }

    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: {
          width: 640,
          height: 480,
          facingMode: 'environment',
        },
      },
      decoder: {
        readers: ['ean_reader', 'code_128_reader'],
      },
      locate: true,
    }, (err: Error | null) => {
      if (err) {
        console.error('Quagga init error:', err);
        return;
      }
      Quagga.start();
      setIsRunning(true);
    });

    interface QuaggaCodeResult {
      code: string;
    }

    interface QuaggaDetectedResult {
      codeResult: QuaggaCodeResult;
    }

    Quagga.onDetected((result: QuaggaDetectedResult) => {
      const code: string = result.codeResult.code;
      alert(`Code détecté : ${code}`);
      Quagga.stop();
    });
  };

  const stopScanner = () => {
    Quagga.stop();
    setIsRunning(false);
  };

  useEffect(() => {
    // ⚠️ Démarre seulement si l'élément est visible
    const timeout = setTimeout(() => {
      if (!isRunning) startScanner();
    }, 500); // Laisse le temps au DOM de rendre

    return () => {
      clearTimeout(timeout);
      Quagga.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={scannerRef}
        className="w-[640px] h-[480px] bg-black"
      />
      <button
        onClick={isRunning ? stopScanner : startScanner}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isRunning ? 'Stop Scanner' : 'Start Scanner'}
      </button>
    </div>
  );
}
