"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, Smartphone, Globe, Shield } from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const WALLETS = [
  { id: "freighter", name: "Freighter", icon: Shield, desc: "Stellar Official Browser Extension" },
  { id: "lobstr", name: "LOBSTR", icon: Smartphone, desc: "Simple & Secure Mobile Wallet" },
  { id: "xbull", name: "xBull", icon: Globe, desc: "Powerful Multi-platform Wallet" },
  { id: "rabet", name: "Rabet", icon: Wallet, desc: "Simple Browser Extension" },
  { id: "albedo", name: "Albedo", icon: Globe, desc: "Browser-based Wallet Service" },
];

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const handleConnect = async () => {
    try {
      // Set the wallet module if needed, kit usually handles selection
      await onConnect();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card p-6 z-[60] rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {WALLETS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  className="w-full flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/50 transition-all group"
                >
                  <div className="p-3 rounded-lg bg-violet-500/20 text-violet-400 mr-4 group-hover:scale-110 transition-transform">
                    <wallet.icon size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{wallet.name}</div>
                    <div className="text-xs text-gray-400">{wallet.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              New to Stellar? <a href="https://stellar.org/learn/wallets" target="_blank" className="text-cyan-400 hover:underline">Learn about wallets</a>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
