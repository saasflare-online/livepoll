"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { StellarWalletsKit, Networks } from "@creit-tech/stellar-wallets-kit";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";

interface WalletContextType {
  isInitialized: boolean;
}

const WalletContext = createContext<WalletContextType>({ isInitialized: false });

export const useWalletKit = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize kit statically on client side
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: defaultModules(),
    });
    setIsInitialized(true);
  }, []);

  return (
    <WalletContext.Provider value={{ isInitialized }}>
      {children}
    </WalletContext.Provider>
  );
}
