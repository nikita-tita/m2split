import React from 'react';
import { mockDeals } from '@/lib/mock-data';
import DealDetailClient from './DealDetailClient';

export function generateStaticParams() {
  return mockDeals.map((deal) => ({
    id: deal.id,
  }));
}

export const dynamicParams = true;

interface DealDetailPageProps {
  params: { id: string };
}

export default function DealDetailPage({ params }: DealDetailPageProps) {
  return <DealDetailClient id={params.id} />;
}
