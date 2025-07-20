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
        id="scanner-container"
        className="w-full rounded max-w-md h-48 relative overflow-hidden"
        style={{ background: 'rgba(0, 0, 0, 0.5)'}}
      >
        <button
          onClick={isRunning ? stopScanner : startScanner}
          className={`text-(--background) bg-(--foreground) border border-white rounded px-4 py-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10${isRunning ? ' hidden' : ''}`}
        >
          Start Scanner
        </button>
      </div>

      <style jsx global>{`
        #scanner-container video,
        #scanner-container canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
