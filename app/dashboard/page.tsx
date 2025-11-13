'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import {
  Wallet,
  TrendingUp,
  Clock,
  AlertCircle,
  FileCheck,
  PiggyBank,
  Plus,
  FileStack,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { mockDashboardMetrics, mockDeals, mockPayments } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/validations';
import Link from 'next/link';

export default function DashboardPage() {
  const { deals, payments } = useStore();

  // Use mock data for demo
  const metrics = mockDashboardMetrics;
  const recentDeals = mockDeals.slice(0, 3);
  const recentPayments = mockPayments.slice(0, 5);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
            <p className="mt-1 text-sm text-gray-500">
              Общая информация по выплатам и сделкам
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/deals/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Создать сделку
              </Button>
            </Link>
            <Link href="/registries/new">
              <Button variant="secondary">
                <FileStack className="w-5 h-5 mr-2" />
                Сформировать реестр
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Сумма на спецсчёте"
            value={metrics.specialAccountBalance}
            icon={Wallet}
            format="currency"
          />
          <MetricCard
            title="Выплачено за период"
            value={metrics.paidThisPeriod}
            icon={TrendingUp}
            format="currency"
            trend={{ value: 12.5, positive: true }}
          />
          <MetricCard
            title="Выплаты в ожидании"
            value={metrics.pendingPayments}
            icon={Clock}
            format="currency"
          />
          <MetricCard
            title="Выплаты в ошибке"
            value={metrics.errorPayments}
            icon={AlertCircle}
            format="currency"
          />
          <MetricCard
            title="Полнота первички"
            value={metrics.primaryDocCompletion}
            icon={FileCheck}
            format="percent"
          />
          <MetricCard
            title="Экономия НДС для АН"
            value={metrics.vatSavings}
            icon={PiggyBank}
            format="currency"
          />
        </div>

        {/* Recent Deals */}
        <Card>
          <CardHeader
            title="Недавние сделки"
            action={
              <Link href="/deals">
                <Button variant="ghost" size="sm">
                  Все сделки
                </Button>
              </Link>
            }
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Объект</TableCell>
                <TableCell header>Лот</TableCell>
                <TableCell header>Сумма</TableCell>
                <TableCell header>Статус</TableCell>
                <TableCell header>Дата</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{deal.objectName}</div>
                      <div className="text-xs text-gray-500">{deal.objectAddress}</div>
                    </div>
                  </TableCell>
                  <TableCell>{deal.lotNumber || '—'}</TableCell>
                  <TableCell>{formatCurrency(deal.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={deal.status === 'IN_PROGRESS' ? 'info' : 'default'}>
                      {deal.status === 'DRAFT' && 'Черновик'}
                      {deal.status === 'IN_PROGRESS' && 'В работе'}
                      {deal.status === 'IN_REGISTRY' && 'В реестре'}
                      {deal.status === 'PAID' && 'Выплачено'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(deal.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader
            title="Статусы выплат"
            action={
              <Link href="/payments">
                <Button variant="ghost" size="sm">
                  Все выплаты
                </Button>
              </Link>
            }
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Реестр</TableCell>
                <TableCell header>Сумма</TableCell>
                <TableCell header>Статус</TableCell>
                <TableCell header>Дата</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.registryId}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === 'EXECUTED'
                          ? 'success'
                          : payment.status === 'ERROR'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {payment.status === 'PENDING' && 'Ожидание'}
                      {payment.status === 'ACCEPTED_BY_BANK' && 'Принято банком'}
                      {payment.status === 'EXECUTED' && 'Исполнено'}
                      {payment.status === 'ERROR' && 'Ошибка'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
