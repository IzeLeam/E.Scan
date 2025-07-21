import React, { useState } from "react";
import BarcodeScanner from "../components/BarcodeScanner";

export default function ScannerPage() {
    const [scannedCodes, setScannedCodes] = useState<string[]>([]);

    function handleCodeDetected(code: string) {
        setScannedCodes(scannedCodes => [...scannedCodes, code]);
    }

    return (
        <div className="w-full bg-white rounded min-h-[calc(100vh-56px)] mb-[56px] shadow-md mt-6 overflow-hidden">
            <h2 className="text-xl text-black font-semibold px-5 pt-5">Scanner</h2>
            <hr className="my-2 w-[calc(100%-3rem)] mx-auto" />

            <BarcodeScanner onDetected={handleCodeDetected} />

            <div className="px-5 py-4">
                <h3 className="text-lg font-semibold">Scanned Codes:</h3>
                <ul className="list-disc pl-5">
                    {scannedCodes.map((code, index) => (
                        <li key={index} className="text-gray-800">{code}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}