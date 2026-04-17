"use client";

import { useEffect, useState, useRef } from "react";
import { CONTRACT_ID, HORIZON_URL } from "@/lib/constants";

export function useEventPolling(onNewEvent: () => void) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        // We poll for events related to the contract
        // In a real app, we'd check for new event IDs
        // For this demo, we just trigger a refresh to get the latest state
        const response = await fetch(`${HORIZON_URL}/contracts/${CONTRACT_ID}/events?limit=5&order=desc`);
        if (response.ok) {
           onNewEvent();
           setLastUpdated(new Date());
           setSecondsSinceUpdate(0);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    pollInterval.current = setInterval(poll, 5000);
    
    const timer = setInterval(() => {
      setSecondsSinceUpdate(prev => prev + 1);
    }, 1000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      clearInterval(timer);
    };
  }, [onNewEvent]);

  return { lastUpdated, secondsSinceUpdate };
}
