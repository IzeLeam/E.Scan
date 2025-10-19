"use client";

import BarcodeScanner from "./BarcodeScanner";
import { useRef, useState, useEffect } from "react";
import SearchResult from "./SearchResult";
import { AnimatePresence, motion } from "framer-motion";
import { useNotification } from "./notifications/NotificationProvider";
import { useIsScrolled } from "../hook/useIsScrolled";

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
    ean: string;
  }>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const isScrolled = useIsScrolled(250);

  const { notify } = useNotification();

  const handleSearch = async (ean: string) => {
    try {
      const res = await fetch(`https://api.escan.lucaprc.fr/search?ean=${ean}`);
      const fetchedData = await res.json();
      fetchedData.ean = ean;
      setData(fetchedData);
      if (fetchedData.rawData.items.length === 0) {
        notify({
          message: "Produit non trouvé",
          error: true,
        });
      } else {
        notify({
          message: "Produit trouvé",
        });
        inputRef.current?.blur();

        if (autoScroll) {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
      setData(null);
    }
  };

  useEffect(() => {
    if (/^\d{13}$/.test(initialEAN)) {
      handleSearch(initialEAN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEAN]);

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
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            key="scroll-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed right-12 bottom-[1.5rem] z-50"
          >
            <button
              className="w-14 h-14 bg-(--foreground) hover:bg-[#ff8575] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
              onClick={() => {
                topRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              aria-label="Top of page"
              title="Retour en haut"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="p-6 max-w-md h-[100vh] mx-auto flex flex-col items-center justify-center"
        ref={topRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="absolute top-6 right-6 flex items-center space-x-2 text-sm text-white/70 z-10"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <label htmlFor="scroll-toggle" className="font-medium text-xs tracking-wide">
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
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
              autoScroll ? "bg-(--foreground)" : "bg-white/20 backdrop-blur-sm"
            }`}
          >
            <motion.div
              className="bg-white w-5 h-5 rounded-full shadow-lg"
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              animate={{ x: autoScroll ? 18 : 0 }}
            />
          </label>
        </motion.div>

        <motion.div
          className="w-full mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.h1
            className="text-4xl font-bold text-white mb-2 tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            E.Scan
          </motion.h1>
          <motion.p
            className="text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Scannez ou entrez un code-barres
          </motion.p>
        </motion.div>

        <motion.div
          className="relative w-full mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <motion.input
            ref={inputRef}
            type="text"
            pattern="\d*"
            inputMode="numeric"
            placeholder="Entrez un code EAN (13 chiffres)"
            autoComplete="off"
            value={eanValue}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-2xl border-2 border-white/10 pr-12 text-white bg-white/5 backdrop-blur-md placeholder:text-white/40 focus:border-(--foreground) focus:bg-white/10 transition-all duration-300 outline-none text-lg"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />

          <AnimatePresence>
            {eanValue && (
              <motion.button
                onClick={handleClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-(--foreground) transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Effacer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
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
      <motion.div 
        className="w-full flex items-center justify-center gap-2 mt-8 mb-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span className="text-xs text-white/30 text-center">
          © 2025 Luca Pourceau
        </span>
        <span className="text-white/20">•</span>
        <a
          href="https://lucaprc.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/40 hover:text-(--foreground) transition-colors duration-200 flex items-center gap-1"
        >
          Site web
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width={14}
            height={14}
            className="inline-block"
          >
            <path
              d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </motion.div>
    </>
  );
}
