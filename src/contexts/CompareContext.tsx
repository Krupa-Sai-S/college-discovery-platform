'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CollegeSummary {
  id: number;
  name: string;
  type: string;
}

interface CompareContextType {
  compared: CollegeSummary[];
  addCollege: (college: CollegeSummary) => void;
  removeCollege: (id: number) => void;
  clearCompare: () => void;
  isAdded: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compared, setCompared] = useState<CollegeSummary[]>([]);

  const addCollege = useCallback((college: CollegeSummary) => {
    setCompared(prev => {
      if (prev.find(c => c.id === college.id)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, college];
    });
  }, []);

  const removeCollege = useCallback((id: number) => {
    setCompared(prev => prev.filter(c => c.id !== id));
  }, []);

  const clearCompare = useCallback(() => setCompared([]), []);

  const isAdded = useCallback((id: number) => compared.some(c => c.id === id), [compared]);

  return (
    <CompareContext.Provider value={{ compared, addCollege, removeCollege, clearCompare, isAdded }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
}
