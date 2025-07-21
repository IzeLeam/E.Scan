"use client";

import BarcodeScanner from "./BarcodeScanner";
import { useRef, useState, useEffect } from "react";
import SearchResult from "./SearchResult";
import { motion } from "framer-motion";

export default function SearchInput({ initialEAN = "" }: { initialEAN?: string }) {
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
      <motion.div
        className="p-4 max-w-md min-h-[calc(100vh-56px)] mx-auto flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="absolute top-5 right-5 flex items-center space-x-1 text-sm text-white z-10"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
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
            <motion.div
              className="bg-white w-3 h-3 rounded-full shadow-md transform"
              layout
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              animate={{ x: autoScroll ? 16 : 0 }}
            />
          </label>
        </motion.div>

        <motion.div
          className="relative w-full mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <motion.input
            ref={inputRef}
            type="text"
            pattern="\d*"
            inputMode="numeric"
            placeholder="Enter EAN code"
            autoComplete="off"
            value={eanValue}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border pr-10 text-white bg-transparent"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {eanValue && (
            <motion.button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              aria-label="Effacer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              &#10005;
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="w-full"
        >
          <BarcodeScanner onDetected={handleDetected} />
        </motion.div>
      </motion.div>

      <motion.div
        ref={resultRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {data ? <SearchResult data={data} /> : <></>}
      </motion.div>
    </>
  );
}
