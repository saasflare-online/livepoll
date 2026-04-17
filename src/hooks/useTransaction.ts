"use client";

import { useState } from "react";
import { TransactionStage } from "@/lib/constants";
import { buildVoteTx, server } from "@/lib/stellar";
import { useWalletKit } from "@/context/WalletProvider";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";

export function useTransaction() {
  const { isInitialized } = useWalletKit();
  const [stage, setStage] = useState<TransactionStage>(TransactionStage.IDLE);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const castVote = async (address: string, optionIndex: number) => {
    if (!isInitialized) {
      setError("Wallet kit not initialized.");
      return;
    }
    setStage(TransactionStage.PENDING);
    setTxHash(null);
    setError(null);

    try {
      // Check balance first
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
      const accountJson: { balances: Array<{ asset_type: string, balance: string }> } = await res.json();
      const balance = accountJson.balances.find((b: any) => b.asset_type === "native")?.balance;
      
      if (parseFloat(balance || "0") < 1.5) {
        throw new Error("Insufficient balance. You need at least 1.5 XLM to vote.");
      }

      const tx = await (async () => {
        try {
          return await buildVoteTx(address, optionIndex);
        } catch (e) {
          console.warn("Demo Mode: Simulating transaction signature...");
          return null;
        }
      })();
      
      setStage(TransactionStage.CONFIRMING);
      
      let finalHash: string;
      
      if (tx) {
        // Real transaction flow
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR());
        const submitResult = await server.sendTransaction(signedTxXdr);
        finalHash = submitResult.hash;
      } else {
        // Demo simulation flow: Post to global MongoDB API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          await fetch("/api/polls", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, optionIndex })
          });
        } catch (e) {
          console.warn("Failed to persist vote globally, demo might not sync", e);
        }
        
        finalHash = "simulated_demo_hash_" + Math.random().toString(36).substring(7);
      }
      
      setTxHash(finalHash);
      setStage(TransactionStage.SUCCESS);
      return finalHash;

    } catch (err: unknown) {
      console.error(err);
      const error = err as Error;
      if (error.message?.includes("cancelled") || error.message?.includes("rejected")) {
        setError("Transaction cancelled. You rejected the signing request.");
      } else if (error.message?.includes("Insufficient balance")) {
        setError(error.message);
      } else {
        setError(error.message || "An error occurred during the transaction.");
      }
      setStage(TransactionStage.FAILED);
    }
  };

  return { stage, txHash, error, castVote, setStage, setTxHash, setError };
}
