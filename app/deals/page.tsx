'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Plus, Search, Download, Loader2 } from 'lucide-react';
import { Deal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/validations';
import { downloadDealsCSV } from '@/lib/export';
import { dealsService } from '@/lib/services/deals.service';
import { BusinessProcessInfo } from '@/components/ui/BusinessProcessInfo';
import { businessProcessContent } from '@/lib/business-process-content';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DealsPage() {
  const router = useRouter();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const data = await dealsService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error('Failed to load deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.objectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.objectAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.lotNumber && deal.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
      DRAFT: 'default',
      IN_PROGRESS: 'info',
      IN_REGISTRY: 'warning',
      PAID: 'success',
    };

    const labels: Record<string, string> = {
      DRAFT: 'Черновик',
      IN_PROGRESS: 'В работе',
      IN_REGISTRY: 'В реестре',
      PAID: 'Выплачено',
      PARTIALLY_PAID: 'Частично',
      CANCELLED: 'Отменено',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Сделки</h1>
            <p className="mt-1 text-sm text-gray-500">
              Управление сделками и распределением комиссий
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => downloadDealsCSV(deals)}>
              <Download className="w-5 h-5 mr-2" />
              Экспорт
            </Button>
            <Link href="/deals/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Создать сделку
              </Button>
            </Link>
          </div>
        </div>

        {/* Business Process Description */}
        <BusinessProcessInfo {...businessProcessContent.dealsList} />

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Поиск по объекту, адресу или лоту..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Все статусы' },
                { value: 'DRAFT', label: 'Черновик' },
                { value: 'IN_PROGRESS', label: 'В работе' },
                { value: 'IN_REGISTRY', label: 'В реестре' },
                { value: 'PAID', label: 'Выплачено' },
              ]}
            />
          </div>
        </Card>

        {/* Deals Table */}
        <Card padding="none">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-4">Загрузка сделок...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell header>№ сделки</TableCell>
                    <TableCell header>Объект</TableCell>
                    <TableCell header>Лот</TableCell>
                    <TableCell header>Сумма КВН</TableCell>
                    <TableCell header>Участников</TableCell>
                    <TableCell header>Статус</TableCell>
                    <TableCell header>Дата создания</TableCell>
                    <TableCell header> </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow
                      key={deal.id}
                      onClick={() => router.push(`/deals/${deal.id}`)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <span className="font-mono text-xs">{deal.dealNumber || deal.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{deal.objectName}</div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {deal.objectAddress}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{deal.lotNumber || '—'}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(deal.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">{deal.shares.length}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(deal.status)}</TableCell>
                      <TableCell>{formatDate(deal.createdAt)}</TableCell>
                      <TableCell>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Link href={`/deals/${deal.id}`}>
                            <Button variant="ghost" size="sm">
                              Открыть
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDeals.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Сделки не найдены'
                      : 'Пока нет сделок. Создайте первую сделку!'}
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
