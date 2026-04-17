"use client";

import { motion } from "framer-motion";
import { Trophy, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsViewProps {
  options: string[];
  votes: Record<number, number>;
  totalVotes: number;
}

export function ResultsView({ options, votes, totalVotes }: ResultsViewProps) {
  const sortedOptions = options
    .map((label, idx) => ({ 
      label, 
      idx, 
      count: votes[idx] || 0,
      percentage: totalVotes > 0 ? ((votes[idx] || 0) / totalVotes) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  const maxVotes = Math.max(...Object.values(votes), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto glass-card p-10 rounded-[2rem] space-y-10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Activity size={120} className="text-cyan-400" />
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-violet-400">
            <Activity size={18} className="animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Real-time Status</h2>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tight">Live Distribution</h3>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Users size={20} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white leading-none">{totalVotes}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1">Total Votes</div>
          </div>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        {sortedOptions.map((opt, i) => {
          const isWinning = opt.count > 0 && opt.count === maxVotes;

          return (
            <div key={opt.idx} className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-lg font-bold transition-colors",
                    isWinning ? "text-white" : "text-gray-400"
                  )}>
                    {opt.label}
                  </span>
                  {isWinning && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-500/20"
                    >
                      <Trophy size={10} />
                      Leading
                    </motion.div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">{opt.percentage.toFixed(1)}%</span>
                  <span className="ml-2 text-xs font-medium text-gray-500">{opt.count} votes</span>
                </div>
              </div>
              
              <div className="h-4 w-full bg-white/5 rounded-full p-1 border border-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${opt.percentage}%` }}
                  transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className={cn(
                    "h-full rounded-full relative",
                    isWinning ? "primary-gradient" : "bg-white/10"
                  )}
                >
                  {isWinning && (
                    <div className="absolute inset-0 bg-white/20 blur-sm rounded-full" />
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pt-4 flex justify-center relative z-10">
         <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/5 rounded-full border border-emerald-500/10">
               <div className="live-dot" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Network Live Verified</span>
            </div>
            <p className="text-[10px] text-gray-600 font-medium">Syncing with Horizon Testnet every 2s</p>
         </div>
      </div>
    </motion.div>
  );
}
