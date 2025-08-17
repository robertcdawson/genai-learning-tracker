"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const [s, setS] = useState<T>(initial);
  
  useEffect(() => {
    try {
      const r = localStorage.getItem(key);
      if (r) setS(JSON.parse(r));
    } catch {
      // Ignore errors
    }
  }, [key]);
  
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(s));
    } catch {
      // Ignore errors
    }
  }, [key, s]);
  
  return [s, setS] as const;
}