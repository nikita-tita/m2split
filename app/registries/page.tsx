'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Plus, Download } from 'lucide-react';
import { mockRegistries } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/validations';
import { downloadRegistryCSV, downloadRegistryJSON } from '@/lib/export';
import Link from 'next/link';

export default function RegistriesPage() {
  const registries = mockRegistries;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
      DRAFT: 'default',
      PENDING_APPROVAL: 'warning',
      APPROVED: 'info',
      SENT_TO_BANK: 'info',
      EXECUTED: 'success',
      ERROR: 'danger',
    };

    const labels: Record<string, string> = {
      DRAFT: 'Черновик',
      PENDING_APPROVAL: 'На утверждении',
      APPROVED: 'Утверждён',
      SENT_TO_BANK: 'Отправлен в банк',
      EXECUTED: 'Исполнен',
      PARTIALLY_EXECUTED: 'Частично',
      ERROR: 'Ошибка',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Реестры выплат</h1>
            <p className="mt-1 text-sm text-gray-500">
              Формирование и управление реестрами
            </p>
          </div>
          <Link href="/registries/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Создать реестр
            </Button>
          </Link>
        </div>

        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>№ реестра</TableCell>
                <TableCell header>Дата</TableCell>
                <TableCell header>Строк</TableCell>
                <TableCell header>Сумма</TableCell>
                <TableCell header>Статус</TableCell>
                <TableCell header>Утверждён</TableCell>
                <TableCell header> </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registries.map((registry) => (
                <TableRow key={registry.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{registry.registryNumber}</span>
                  </TableCell>
                  <TableCell>{formatDate(registry.date)}</TableCell>
                  <TableCell>{registry.linesCount}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(registry.totalAmount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(registry.status)}</TableCell>
                  <TableCell>
                    {registry.approvedAt ? formatDate(registry.approvedAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/registries/${registry.id}`}>
                        <Button variant="ghost" size="sm">
                          Открыть
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadRegistryCSV(registry)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
