"use client";
import { useState } from "react";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Page() {
  const [scannedCode, setScannedCode] = useState("");

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Scan EAN-13</h1>
      <BarcodeScanner onDetected={(code) => setScannedCode(code)} />
      {scannedCode && (
        <p className="mt-4 text-green-600 font-mono">Code détecté : {scannedCode}</p>
      )}
    </div>
  );
}
