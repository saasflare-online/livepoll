"use client";

import { useState, useEffect, useCallback } from "react";
import { getQuestion, getOptions, getResults, hasVoted } from "@/lib/stellar";
import { PollData } from "@/lib/constants";

export function usePoll(address: string | null) {
  const [data, setData] = useState<PollData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [question, options, votes] = await Promise.all([
        getQuestion(),
        getOptions(),
        getResults()
      ]);
      
      let voted = false;
      if (address) {
        voted = await hasVoted(address);
      }

      const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

      setData({
        question,
        options,
        votes,
        totalVotes,
        hasVoted: voted
      });
    } catch (err) {
      console.error("Failed to fetch poll data", err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return { data, isLoading, refreshData };
}
