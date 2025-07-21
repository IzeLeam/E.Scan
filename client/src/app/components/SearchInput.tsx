"use client";

import BarcodeScanner from "./BarcodeScanner";
import { useRef, useState, useEffect } from "react";
import SearchResult from "./SearchResult";
export default function SearchInput({
  initialEAN = "",
}: {
  initialEAN?: string;
}) {
  const [eanValue, setEanValue] = useState(initialEAN);
  const [autoScroll, setAutoScroll] = useState(true);
  const [data, setData] = useState<null | {
    title: string;
    description: string;
    images: string[];
    offer: boolean;
    price: number;
    stock: number;
    rawData: string;
  }>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (/^\d{13}$/.test(initialEAN)) {
      handleSearch(initialEAN);
    }
  }, [initialEAN]);

  const handleSearch = async (ean: string) => {
    try {
      const res = await fetch(`https://api.escan.lucaprc.fr/search?ean=${ean}`);
      const fetchedData = await res.json();
      setData(fetchedData);
      if (autoScroll) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
      setData(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ean = e.target.value.replaceAll(" ", "");
    setEanValue(ean);

    if (/^\d{13}$/.test(ean)) {
      handleSearch(ean);
    } else {
      setData(null);
    }
  };

  const handleClear = () => {
    setEanValue("");
    setData(null);
    inputRef.current?.focus();
  };

  const handleDetected = (code: string) => {
    setEanValue(code);
    handleSearch(code);
  };

  return (
    <>
      <div className="p-4 max-w-md min-h-[calc(100vh-56px)] mx-auto flex flex-col items-center justify-center">
        <div className="absolute top-5 right-5 flex items-center space-x-1 text-sm text-white z-10">
          <label htmlFor="scroll-toggle" className="font-bold opacity-25">
            Auto-Scroll
          </label>
          <input
            id="scroll-toggle"
            type="checkbox"
            checked={autoScroll}
            onChange={() => setAutoScroll(!autoScroll)}
            className="hidden"
          />
          <label
            htmlFor="scroll-toggle"
            className={`w-10 h-5 flex items-center border-1 rounded-full p-1 transition ${
              autoScroll ? "bg-(--foreground)" : "bg-(--background)"
            }`}
          >
            <div
              className={`bg-white w-3 h-3 rounded-full shadow-md transform transition ${
                autoScroll ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </label>
        </div>
        <div className="relative w-full mb-4">
          <input
            ref={inputRef}
            type="text"
            pattern="\d*"
            inputMode="numeric"
            placeholder="Enter EAN code"
            autoComplete="off"
            value={eanValue}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border pr-10 text-white"
          />
          {eanValue && (
            <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
            aria-label="Effacer"
            >
              &#10005;
            </button>
          )}
        </div>
        <BarcodeScanner onDetected={handleDetected}/>
      </div>
      <div ref={resultRef}>{data ? <SearchResult data={data} /> : <></>}</div>
    </>
  );
}
