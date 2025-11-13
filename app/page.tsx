'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { mockUsers } from '@/lib/mock-data';

export default function HomePage() {
  const router = useRouter();
  const { setCurrentUser } = useStore();

  useEffect(() => {
    // Auto-login with mock user for demo
    setCurrentUser(mockUsers[1]); // M2 Operator
    router.push('/dashboard');
  }, [router, setCurrentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">M2 Split</h1>
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
}
