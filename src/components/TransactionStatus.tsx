"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { TransactionStage } from "@/lib/constants";

interface TransactionStatusProps {
  stage: TransactionStage;
  txHash: string | null;
}

export function TransactionStatus({ stage, txHash }: TransactionStatusProps) {
  if (stage === TransactionStage.IDLE) return null;

  const steps = [
    { label: "Pending", matches: [TransactionStage.PENDING, TransactionStage.CONFIRMING, TransactionStage.SUCCESS] },
    { label: "Signing", matches: [TransactionStage.CONFIRMING, TransactionStage.SUCCESS] },
    { label: "Success", matches: [TransactionStage.SUCCESS] },
  ];

  return (
    <div className="w-full max-w-md mx-auto glass-card p-6 rounded-2xl border-l-4 border-l-violet-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white uppercase text-sm tracking-widest">Transaction Status</h3>
        {stage !== TransactionStage.SUCCESS && stage !== TransactionStage.FAILED && (
          <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
        )}
      </div>

      <div className="flex justify-between relative mb-6">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
        {steps.map((step, idx) => {
          const isActive = step.matches.includes(stage);
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-4 h-4 rounded-full transition-colors duration-500 ${
                  isActive ? "bg-violet-500 shadow-[0_0_10px_#7c3aed]" : "bg-gray-700"
                }`}
              />
              <span className={`text-[10px] mt-2 uppercase font-bold ${isActive ? "text-violet-400" : "text-gray-600"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {stage === TransactionStage.SUCCESS && txHash && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 pt-2"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 size={18} />
            <span>Vote Confirmed!</span>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View on Stellar Expert <ExternalLink size={12} />
          </a>
        </motion.div>
      )}

      {stage === TransactionStage.FAILED && (
        <div className="flex items-center justify-center gap-2 text-red-400 border-t border-red-500/20 pt-4 mt-2">
          <XCircle size={18} />
          <span className="text-sm font-bold">Transaction Failed</span>
        </div>
      )}
    </div>
  );
}
