'use client';

import { useRef, useState } from 'react';
// @ts-expect-error: Quagga n’a pas de types
import Quagga from 'quagga';
import { AnimatePresence, motion } from 'framer-motion';

export default function BarcodeScanner({ onDetected }: { onDetected?: (code: string) => void }) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [scannedCodes, setScannedCodes] = useState<{ code: string; frequency: number }[]>([]);

  interface ScannedCode {
    code: string;
    frequency: number;
  }

  const addScannedCode = (code: string) => {
    setScannedCodes((prev) => {
      const existing = prev.find((c) => c.code === code);
      if (existing) {
        return prev.map((c) => (c.code === code ? { ...c, frequency: c.frequency + 1 } : c));
      }
      return [...prev, { code, frequency: 1 }];
    });
  };

  const getTotalCount = () => {
      return scannedCodes.reduce((total, code) => total + code.frequency, 0);
  }

  const getMostFrequentCode = (): ScannedCode | null => {
      if (scannedCodes.length === 0) return null;
      return scannedCodes[0];
  }

  const getMostProbableCode = (): string | null => {
    const TRESHOLD_NUMBER_CODES = 10;
    if (scannedCodes.length === 0) return null;
    if (getTotalCount() < TRESHOLD_NUMBER_CODES) return null;

    const TRESHOLD_PERCENTAGE = 0.8;
    const mostFrequentCode = getMostFrequentCode();
    if (!mostFrequentCode) return null;
    if ((mostFrequentCode.frequency * 100 / getTotalCount()) < TRESHOLD_PERCENTAGE) {
        return null;
    }
    return mostFrequentCode.code;
  }

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
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment',
        aspectRatio: { ideal: 1.777 },
        },
        area: {
        top: "20%",
        right: "20%",
        left: "20%",
        bottom: "20%",
        }
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
      addScannedCode(code);
      const mostProbableCode = getMostProbableCode();
      if (mostProbableCode) {
        stopScanner();
        if (typeof onDetected === 'function') {
          onDetected(mostProbableCode);
        }
      }
    });
  };

  const stopScanner = () => {
    Quagga.stop();
    setIsRunning(false);
    scannedCodes.length = 0;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={scannerRef}
        id="scanner-container"
        className="w-full rounded max-w-md h-48 relative overflow-hidden"
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      >
        {/* Zone de détection */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                style={{
                  width: '40%',
                  height: '60%',
                  border: '2px dashed white',
                  borderRadius: '0.5rem',
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton d’activation */}
        <AnimatePresence>
          {!isRunning && (
            <motion.button
              key="start-button"
              onClick={isRunning ? stopScanner : startScanner}
              className="text-(--background) bg-(--foreground) border border-white rounded px-4 py-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Start Scanner
            </motion.button>
          )}
        </AnimatePresence>
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
