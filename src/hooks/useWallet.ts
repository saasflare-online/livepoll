"use client";

import { useState, useCallback } from "react";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import { useWalletKit } from "@/context/WalletProvider";

export function useWallet() {
  const { isInitialized } = useWalletKit();
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("connectedAddress");
    }
    return null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!isInitialized) {
       setError("Wallet kit not initialized.");
       return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const { address } = await StellarWalletsKit.authModal();
      setAddress(address);
      localStorage.setItem("connectedAddress", address);
    } catch (err: unknown) {
      console.error(err);
      const error = err as Error;
      if (error.message?.includes("closed") || error.message?.includes("cancelled")) {
        // User closed modal, don't show as error
      } else if (error.message?.includes("not found") || error.message?.includes("not installed")) {
        setError("Wallet not detected. Please install a compatible Stellar wallet (e.g., Freighter).");
      } else {
        setError(error.message || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isInitialized]);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem("connectedAddress");
  }, []);

  return { address, isConnecting, error, connect, disconnect };
}
