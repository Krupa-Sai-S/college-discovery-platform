'use client';

import { CompareProvider } from '@/contexts/CompareContext';
import CompareDrawer from './CompareDrawer';

export default function CompareDrawerWrapper() {
  return (
    <CompareProvider>
      <CompareDrawer />
    </CompareProvider>
  );
}
