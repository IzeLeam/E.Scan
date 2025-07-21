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
            return [...updatedCodes].sort((a, b) => b.count - a.count);
        });
    }

    function getTotalCount(): number {
        return scannedCodes.reduce((total, code) => total + code.count, 0);
    }

    function isValidEAN13(code: string): boolean {
        if (!/^\d{13}$/.test(code)) return false;

        const digits = code.split('').map(Number);
        const checksum = digits[12];

        const sum =
            digits
            .slice(0, 12)
            .reduce((acc, digit, idx) => acc + digit * (idx % 2 === 0 ? 1 : 3), 0);

        const expected = (10 - (sum % 10)) % 10;
        return checksum === expected;
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
                        <li
                            key={index}
                            className={isValidEAN13(item.code) ? "text-green-600" : "text-red-600"}
                        >
                            {item.code} - {item.count}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}