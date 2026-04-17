"use client";

import { useState } from "react";
import { Plus, Trash2, Send, Save } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface AdminFormProps {
  onSumbit: (question: string, options: string[]) => void;
  isLoading: boolean;
}

export function AdminForm({ onSumbit, isLoading }: AdminFormProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const isFormValid = question.trim() !== "" && options.every(o => o.trim() !== "") && options.length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSumbit(question, options);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 glass-card p-8 rounded-2xl border border-white/10 shadow-2xl">
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wider text-violet-400">Poll Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you think about...?"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-violet-500 transition-all text-lg"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold uppercase tracking-wider text-cyan-400">Poll Options</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={isLoading}
            className="rounded-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-white"
          >
            <Plus size={16} className="mr-1" /> Add Option
          </Button>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {options.map((option, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-3"
              >
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-mono text-xs">#{idx + 1}</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                    disabled={isLoading}
                  />
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    disabled={isLoading}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full h-14 rounded-xl primary-gradient text-lg font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save size={20} />
              Launch Live Poll
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
