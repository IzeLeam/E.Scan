"use client";

import React, { useState } from "react";
import BarcodeScanner from "../components/BarcodeScanner";

export default function ScannerPage() {
    interface ScannedCode {
        code:string;
        count:number;
    }

    const [scannedCodes, setScannedCodes] = useState<ScannedCode[]>([]);

    function handleCodeDetected(code: string) {
        setScannedCodes(prevCodes => {
            let updatedCodes;
            const existingCode = prevCodes.find(c => c.code === code);
            if (existingCode) {
                updatedCodes = prevCodes.map(c =>
                    c.code === code ? { ...c, count: c.count + 1 } : c
                );
            } else {
                updatedCodes = [...prevCodes, { code, count: 1 }];
            }
            // Sort by count descending
            return [...updatedCodes].sort((a, b) => b.count - a.count);
        });
    }

    return (
        <div className="w-full bg-white rounded min-h-[calc(100vh-56px)] mb-[56px] shadow-md mt-6 overflow-hidden">
            <h2 className="text-xl text-black font-semibold px-5 pt-5">Scanner</h2>
            <hr className="my-2 w-[calc(100%-3rem)] mx-auto" />

            <BarcodeScanner onDetected={handleCodeDetected} />

            <div className="px-5 py-4">
                <h3 className="text-lg font-semibold">Scanned Codes:</h3>
                <ul className="list-disc pl-5">
                    {scannedCodes.map((item, index) => (
                        <li key={index} className="text-gray-800">
                            {item.code} - Count: {item.count}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}