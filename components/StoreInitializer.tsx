'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { mockDeals, mockRegistries, mockContractors, mockPayments } from '@/lib/mock-data';

export function StoreInitializer() {
  const { setDeals, setRegistries, setContractors, setPayments } = useStore();

  useEffect(() => {
    // Initialize store with mock data on first load
    if (typeof window !== 'undefined') {
      const isInitialized = sessionStorage.getItem('store_initialized');

      if (!isInitialized) {
        setDeals(mockDeals);
        setRegistries(mockRegistries);
        setContractors(mockContractors);
        setPayments(mockPayments);
        sessionStorage.setItem('store_initialized', 'true');
      }
    }
  }, [setDeals, setRegistries, setContractors, setPayments]);

  return null;
}
