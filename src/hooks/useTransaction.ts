"use client";

import { useState } from "react";
import { TransactionStage, NETWORK_PASSPHRASE } from "@/lib/constants";
import { buildVoteTx, server, parseSorobanError, reconstructTransaction } from "@/lib/stellar";
import { useWalletKit } from "@/context/WalletProvider";
import { StellarWalletsKit, Networks } from "@creit-tech/stellar-wallets-kit";

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
        console.log("Preparing to sign transaction for address:", address);
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR(), {
          networkPassphrase: NETWORK_PASSPHRASE,
          address: address
        });
        const signedTx = reconstructTransaction(signedTxXdr);
        const sendResponse = await server.sendTransaction(signedTx);
        
        if (sendResponse.status === "PENDING") {
          const finalStatus = await server.pollTransaction(sendResponse.hash, {
            attempts: 15,
            sleepStrategy: () => 2000
          });
          
          if (finalStatus.status !== "SUCCESS") {
             console.error("Transaction failed during polling:", finalStatus);
             throw new Error(`Transaction failed with status: ${finalStatus.status}`);
          }
        }
        
        finalHash = sendResponse.hash;
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
      const error = err as any;
      console.error("DEBUG - Transaction Failed Full Object:", err);
      console.error("DEBUG - Error Message:", error?.message);
      console.error("DEBUG - Error Keys:", Object.getOwnPropertyNames(err || {}));
      
      let message = "An error occurred during the transaction.";
      
      if (error && typeof error === 'object') {
        // Handle User Rejection / Cancellation
        if (error.message?.toLowerCase().includes("cancelled") || error.message?.toLowerCase().includes("rejected")) {
          message = "Transaction cancelled. You rejected the signing request.";
        } 
        // Handle explicit local errors (e.g. Insufficient balance)
        else if (error.message && !error.message.includes("Error(Contract")) {
          message = error.message;
        }
        // Handle Soroban specific errors
        else {
          message = parseSorobanError(error);
        }
      } else if (typeof err === "string") {
        message = err;
      }
      
      if (message === "{}" || !message || message === "undefined") {
        message = error?.message || error?.status || "An unknown blockchain error occurred. Please check your wallet for details.";
      }

      setError(message);
      setStage(TransactionStage.FAILED);
    }
  };

  return { stage, txHash, error, castVote, setStage, setTxHash, setError };
}
