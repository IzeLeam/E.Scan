'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

type Props = {
  message: string;
  error?: boolean;
  onClose?: () => void;
};

export default function NotificationBanner({ message, error = false, onClose }: Props) {
  const [visible, setVisible] = useState(true);

  const bgGreen = "#00C851";
  const bgGreenDark = "#007E33";
  const bgRed = "#FF4444";
  const bgRedDark = "#CC0000";
  const bgColor = error ? bgRed : bgGreen;
  const bgColorDark = error ? bgRedDark : bgGreenDark;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (onClose) onClose();
      }}
    >
      {visible && (
        <motion.div
          key="banner"
          initial={{ y: '-100%', opacity: 50 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 50 }}
          transition={{ duration: 0.4 }}
          className={"fixed top-0 left-1/2 min-w-1/2 transform -translate-x-1/2 px-6 py-3 z-50 rounded-b-md shadow-md text-white text-center"}
          style={{
            backgroundColor: error ? bgRed : bgGreen,
            borderBottom: `2px solid ${error ? bgRedDark : bgGreenDark}`,
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
