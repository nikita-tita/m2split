import React from 'react';
import { mockRegistries } from '@/lib/mock-data';
import RegistryDetailClient from './RegistryDetailClient';

export function generateStaticParams() {
  return mockRegistries.map((registry) => ({
    id: registry.id,
  }));
}

export const dynamicParams = true;

interface RegistryDetailPageProps {
  params: { id: string };
}

export default function RegistryDetailPage({ params }: RegistryDetailPageProps) {
  return <RegistryDetailClient id={params.id} />;
}
