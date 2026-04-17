"use client";

import { AlertCircle, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ErrorBannerProps {
  message: string | null;
  onClear: () => void;
}

export function ErrorBanner({ message, onClear }: ErrorBannerProps) {
  if (!message) return null;

  const isWalletMissing = message.includes("not detected") || message.includes("not installed");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[100]"
      >
        <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-md p-4 rounded-xl flex items-start gap-3 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <div className="mt-0.5 text-red-500">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-red-100">{message}</p>
            {isWalletMissing && (
              <a 
                href="https://www.freighter.app/" 
                target="_blank" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                rel="noreferrer"
              >
                <Download size={14} /> Install Freighter
              </a>
            )}
          </div>
          <button onClick={onClear} className="text-red-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
