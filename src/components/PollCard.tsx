"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { PollData } from "@/lib/constants";
import { Button } from "./ui/button";

interface VoteOptionProps {
  label: string;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function VoteOption({ label, index, isSelected, onSelect, disabled }: VoteOptionProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01, x: 4 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      className={cn(
        "group w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
        isSelected 
          ? "border-violet-500/50 bg-violet-500/10 shadow-[0_0_20px_rgba(124,58,237,0.2)]" 
          : "border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
        disabled && !isSelected && "opacity-40 cursor-not-allowed grayscale"
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="option-glow"
          className="absolute inset-0 bg-violet-600/5 blur-xl -z-10"
        />
      )}
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
          isSelected ? "bg-violet-500 text-white" : "bg-white/10 text-white/40 group-hover:text-white/60"
        )}>
          {index + 1}
        </div>
        <span className={cn(
          "text-lg font-semibold transition-colors",
          isSelected ? "text-white" : "text-white/70 group-hover:text-white"
        )}>
          {label}
        </span>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {isSelected ? (
            <motion.div
              key="checked"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              className="text-violet-400"
            >
              <CheckCircle2 size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="arrow"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white/20 group-hover:text-white/40"
            >
              <ChevronRight size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

interface PollCardProps {
  data: PollData;
  selectedOption: number | null;
  onSelect: (index: number) => void;
  onVote: () => void;
  isVoting: boolean;
  isConnected: boolean;
}

export function PollCard({ data, selectedOption, onVote, onSelect, isVoting, isConnected }: PollCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-10"
    >
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest"
        >
          <Info size={14} />
          Soroban Protected Poll
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
          <span className="text-gradient">Decentralized</span>
          <br />
          {data.question}
        </h1>
        
        <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
          Your vote is recorded permanently on the <span className="text-white font-semibold">Stellar Testnet</span>.
        </p>
      </div>

      <div className="grid gap-3 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-violet-500/20 to-transparent" />
        {data.options.map((option, idx) => (
          <VoteOption
            key={idx}
            index={idx}
            label={option}
            isSelected={selectedOption === idx}
            onSelect={onSelect}
            disabled={isVoting || data.hasVoted}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 pt-6">
        {!isConnected ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-amber-500 bg-amber-500/10 px-8 py-4 rounded-2xl border border-amber-500/20 font-bold"
          >
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Connect wallet to participate
          </motion.div>
        ) : data.hasVoted ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 px-10 py-5 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] font-bold text-lg"
          >
            <CheckCircle2 size={24} className="text-emerald-500" />
            Thank you for voting!
          </motion.div>
        ) : (
          <Button
            size="lg"
            onClick={onVote}
            disabled={selectedOption === null || isVoting}
            className="w-full md:w-80 h-16 text-xl font-bold rounded-2xl primary-gradient shadow-[0_10px_40px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            {isVoting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Casting Vote...
              </div>
            ) : (
              "Confirm & Vote"
            )}
          </Button>
        )}
        
        {isConnected && !data.hasVoted && (
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <Info size={14} />
            Small network fee (~0.00001 XLM) applies
          </p>
        )}
      </div>
    </motion.div>
  );
}
