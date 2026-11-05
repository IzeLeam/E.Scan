"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type Toast = { id: number; message: string; error?: boolean };
type Notify = (message: string, options?: { error?: boolean }) => void;

const ToastContext = createContext<Notify | null>(null);

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used within <ToastProvider>");
  return notify;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const nextId = useRef(0);

  const notify = useCallback<Notify>((message, options) => {
    setToast({ id: ++nextId.current, message, error: options?.error });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg ${
                toast.error ? "bg-red-500" : "bg-emerald-600"
              }`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
