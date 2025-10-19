'use client';

import { useRef, useState } from 'react';
// @ts-expect-error - Quagga library doesn't have TypeScript definitions
import Quagga from 'quagga';
import { motion, AnimatePresence } from 'framer-motion';

export default function BarcodeScanner({ onDetected }: { onDetected?: (code: string) => void;}) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(false);

  interface ScannedCode {
    code: string;
    frequency: number;
  }

  const scannedCodes: ScannedCode[] = [];

  function addScannedCode(code: string) {
    const existingCode = scannedCodes.find((c) => c.code === code);
    if (existingCode) {
      existingCode.frequency += 1;
    } else {
      scannedCodes.push({ code, frequency: 1 });
    }
    scannedCodes.sort((a, b) => b.frequency - a.frequency);
  }

  function getTotalCount(): number {
      return scannedCodes.reduce((total, code) => total + code.frequency, 0);
  }

  function getMostFrequentCode(): ScannedCode | null {
      if (scannedCodes.length === 0) return null;
      return scannedCodes[0];
  }

  function getMostProbableCode(): string | null {
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
        className="w-full rounded-3xl max-w-md h-56 relative overflow-hidden shadow-2xl border-2 border-white/10"
        style={{ background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)' }}
      >
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
                  width: '50%',
                  height: '65%',
                  border: '3px solid white',
                  borderRadius: '1rem',
                  boxShadow: '0 0 20px rgba(248, 112, 96, 0.5)',
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: [0.95, 1.05, 0.95],
                  opacity: 1,
                }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ 
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  opacity: { duration: 0.3 }
                }}
              />
              <motion.div
                className="absolute top-4 left-0 right-0 text-center"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-white text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                  Positionnez le code-barres
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isRunning && (
            <motion.button
              key="start-button"
              onClick={isRunning ? stopScanner : startScanner}
              className="text-white bg-(--foreground) hover:bg-[#ff8575] rounded-2xl px-6 py-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 font-medium shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ boxShadow: "0 20px 40px rgba(248, 112, 96, 0.4)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scanner un produit
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
          border-radius: 1.5rem;
        }
      `}</style>
    </div>
  );
}
