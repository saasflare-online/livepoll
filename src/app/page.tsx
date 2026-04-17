"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { usePoll } from "@/hooks/usePoll";
import { useTransaction } from "@/hooks/useTransaction";
import { useEventPolling } from "@/hooks/useEventPolling";
import { WalletModal } from "@/components/WalletModal";
import { PollCard } from "@/components/PollCard";
import { ResultsView } from "@/components/ResultsView";
import { TransactionStatus } from "@/components/TransactionStatus";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LiveIndicator } from "@/components/LiveIndicator";
import { Button } from "@/components/ui/button";
import { LogOut, Vote, Settings, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { address, isConnecting, error: walletError, connect, disconnect } = useWallet();
  const { data, isLoading, refreshData } = usePoll(address);
  const { stage, txHash, error: txError, castVote } = useTransaction();
  const { secondsSinceUpdate } = useEventPolling(refreshData);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleVote = async () => {
    if (address && selectedOption !== null) {
      await castVote(address, selectedOption);
      refreshData();
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
             <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-cyan-500 rounded-full animate-spin [animation-duration:1.5s]" />
          </div>
          <div className="space-y-1 text-center font-black tracking-tighter uppercase">
            <p className="text-white text-xl">Initializing</p>
            <p className="text-gray-600 text-[10px] tracking-[0.2em]">Stellar Horizon Gateway</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#f1f5f9] relative overflow-x-hidden pb-32">
      {/* Dynamic Background Blurs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full z-0 opacity-50" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full z-0 opacity-50" />
      <div className="fixed top-[40%] left-[30%] w-[20%] h-[20%] bg-violet-400/5 blur-[100px] rounded-full z-0" />

      {/* Navigation Bar */}
      <nav className="relative z-50 px-8 py-6 flex justify-between items-center max-w-7xl mx-auto backdrop-blur-sm border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/20"
          >
            <Vote size={26} />
          </motion.div>
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-black tracking-tightest">LIVEPOLL</span>
            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase ml-1">v2.0 Beta</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
            {!address ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-2xl px-8 h-12 primary-gradient border-none hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all font-black text-white"
                >
                  {isConnecting ? "Detecting..." : "Connect Wallet"}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-white/5 p-1.5 pr-5 rounded-2xl border border-white/10 group hover:border-violet-500/30 transition-all"
              >
                <div className="px-4 py-2 rounded-xl bg-violet-500/10 text-violet-400 text-xs font-mono font-black border border-violet-500/20">
                  {address.slice(0, 5)}...{address.slice(-5)}
                </div>
                <button 
                  onClick={disconnect}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  title="Disconnect"
                >
                  <LogOut size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative z-10 pt-16 px-8 container mx-auto mb-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <AnimatePresence>
            {(walletError || txError) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <ErrorBanner message={walletError || txError} onClear={() => {}} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-20 items-start">
            {/* Voting Component */}
            <div className="space-y-12">
              <PollCard
                data={data}
                selectedOption={selectedOption}
                onSelect={setSelectedOption}
                onVote={handleVote}
                isVoting={stage === "PENDING" || stage === "CONFIRMING"}
                isConnected={!!address}
              />
              
              <AnimatePresence>
                {stage !== "IDLE" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TransactionStatus stage={stage} txHash={txHash} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Component */}
            <div className="space-y-10 lg:sticky lg:top-12">
              <ResultsView 
                options={data.options}
                votes={data.votes}
                totalVotes={data.totalVotes}
              />
              
              <div className="flex flex-col items-center gap-4 py-6 border-t border-white/5">
                 <LiveIndicator secondsSinceUpdate={secondsSinceUpdate} />
                 <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Network</p>
                      <p className="text-xs font-black text-white">Stellar Testnet</p>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Contract</p>
                      <p className="text-xs font-black text-white">v1.2 Soroban</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 w-full p-6 flex justify-between items-center bg-black/60 backdrop-blur-2xl z-[100] border-t border-white/5 px-12">
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <span>&copy; 2024 LIVEPOLL CORE</span>
          <div className="w-1.5 h-1.5 rounded-full bg-violet-600/50" />
          <span>Antigravity Competition Submission</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 gap-2 font-bold group transition-all">
              <Settings size={16} className="group-hover:rotate-90 transition-transform" />
              Settings
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="rounded-xl text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 gap-2 font-bold transition-all">
              <LayoutDashboard size={16} />
              Admin Console
            </Button>
          </Link>
        </div>
      </footer>

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={connect}
      />
    </main>
  );
}
