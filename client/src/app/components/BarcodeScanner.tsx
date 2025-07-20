'use client';

import { useRef, useState } from 'react';
// @ts-expect-error: Quagga n’a pas de types
import Quagga from 'quagga';

export default function BarcodeScanner({
  onDetected,
}: {
  onDetected?: (code: string) => void;
}) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(false);

  const startScanner = () => {
    if (!scannerRef.current) {
      console.warn('Scanner ref not ready');
      return;
    }

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            width: 480,
            height: 320,
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: ['ean_reader'],
        },
        locate: true,
      },
      (err: Error | null) => {
        if (err) {
          console.error('Quagga init error:', err);
          return;
        }
        Quagga.start();
        setIsRunning(true);
      }
    );

    Quagga.onDetected((result: { codeResult: { code: string } }) => {
      const code: string = result.codeResult.code;
      alert(`Code détecté : ${code}`);
      stopScanner();
      if (onDetected) onDetected(code);
    });
  };

  const stopScanner = () => {
    Quagga.stop();
    setIsRunning(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={scannerRef}
        className="bg-black w-full max-w-md h-32 flex items-center justify-center mb-4 relative"
      >
        <button
          onClick={isRunning ? stopScanner : startScanner}
          className="text-white border border-white rounded px-4 py-2 absolute cursor-pointer"
          style={{ zIndex: 2 }}
        >
          {isRunning ? 'Stop Scanner' : 'Start Scanner'}
        </button>
      </div>
    </div>
  );
}
