'use client';

import { CompareProvider } from '@/contexts/CompareContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return <CompareProvider>{children}</CompareProvider>;
}
