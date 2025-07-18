"use client";
import { useState } from "react";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Page() {
  const [scannedCode, setScannedCode] = useState("");
  const [scannerActive, setScannerActive] = useState(true);

  const handleDetected = (code: string) => {
    setScannedCode(code);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Scan EAN-13</h1>
      <BarcodeScanner
                active={scannerActive}
                setActive={setScannerActive}
                onDetected={handleDetected}
              />
      {scannedCode && (
        <p className="mt-4 text-green-600 font-mono">Code détecté : {scannedCode}</p>
      )}
    </div>
  );
}
