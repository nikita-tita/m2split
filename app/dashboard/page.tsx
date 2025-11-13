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
import { BusinessProcessInfo } from '@/components/ui/BusinessProcessInfo';
import { businessProcessContent } from '@/lib/business-process-content';
import { OnboardingTip } from '@/components/ui/OnboardingTip';
import Link from 'next/link';

export default function DashboardPage() {
  const { deals, payments, currentRole } = useStore();

  // Use mock data for demo
  const metrics = mockDashboardMetrics;
  const recentDeals = mockDeals.slice(0, 3);
  const recentPayments = mockPayments.slice(0, 5);

  // Role-based content
  const canCreateDeal = ['M2_OPERATOR', 'AGENCY_ADMIN', 'CONTRACTOR'].includes(currentRole);
  const canCreateRegistry = ['M2_OPERATOR', 'DEVELOPER_ADMIN'].includes(currentRole);
  const showFullMetrics = ['DEVELOPER_ADMIN', 'M2_OPERATOR'].includes(currentRole);
  const showContractorView = currentRole === 'CONTRACTOR';
  const showAgencyView = currentRole === 'AGENCY_ADMIN';

  const getRoleTitle = () => {
    switch (currentRole) {
      case 'DEVELOPER_ADMIN':
        return 'Дашборд застройщика';
      case 'M2_OPERATOR':
        return 'Дашборд М2-оператора';
      case 'AGENCY_ADMIN':
        return 'Дашборд агентства';
      case 'CONTRACTOR':
        return 'Мои выплаты и сделки';
      default:
        return 'Дашборд';
    }
  };

  const getRoleDescription = () => {
    switch (currentRole) {
      case 'DEVELOPER_ADMIN':
        return 'Общая информация по выплатам и сделкам застройщика';
      case 'M2_OPERATOR':
        return 'Управление сделками и реестрами выплат';
      case 'AGENCY_ADMIN':
        return 'Статистика выплат и сделок вашего агентства';
      case 'CONTRACTOR':
        return 'Ваши выплаты, сделки и документы';
      default:
        return 'Общая информация';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{getRoleTitle()}</h1>
            <p className="mt-1 text-sm text-gray-500">{getRoleDescription()}</p>
          </div>
          <div className="flex gap-3">
            {canCreateDeal && (
              <Link href="/deals/new">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Создать сделку
                </Button>
              </Link>
            )}
            {canCreateRegistry && (
              <Link href="/registries/new">
                <Button variant="secondary">
                  <FileStack className="w-5 h-5 mr-2" />
                  Сформировать реестр
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Onboarding for Contractor - First step in the system */}
        {showContractorView && (
          <OnboardingTip
            id="contractor-first-deal"
            title="👋 Добро пожаловать в М2 Split!"
            description="Вы находитесь в роли агента. Первый шаг - создать сделку на бронирование объекта у застройщика. Система автоматически рассчитает комиссию КВН и покажет, как М2 распределит её между участниками."
            actionText="Создать первую сделку"
            actionHref="/deals/new"
          />
        )}

        {/* Business Process Overview */}
        <BusinessProcessInfo {...businessProcessContent.overview} defaultExpanded={false} />

        {/* Metrics - Full view for Developer/M2 */}
        {showFullMetrics && (
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
        )}

        {/* Metrics - Agency view */}
        {showAgencyView && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Выплачено за период"
              value={9000000}
              icon={TrendingUp}
              format="currency"
              trend={{ value: 15.3, positive: true }}
            />
            <MetricCard
              title="Выплаты в ожидании"
              value={4500000}
              icon={Clock}
              format="currency"
            />
            <MetricCard
              title="Экономия НДС"
              value={1800000}
              icon={PiggyBank}
              format="currency"
            />
            <MetricCard
              title="Полнота первички"
              value={66.7}
              icon={FileCheck}
              format="percent"
            />
          </div>
        )}

        {/* Metrics - Contractor view */}
        {showContractorView && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Выплачено мне"
              value={4500000}
              icon={TrendingUp}
              format="currency"
            />
            <MetricCard
              title="Ожидает выплаты"
              value={1500000}
              icon={Clock}
              format="currency"
            />
            <MetricCard
              title="Моих документов"
              value={2}
              icon={FileCheck}
              format="number"
            />
          </div>
        )}

        {/* Recent Deals */}
        <Card>
          <CardHeader
            title={showContractorView ? 'Мои сделки' : 'Недавние сделки'}
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
                <TableCell header>
                  {showContractorView ? 'Моя сумма' : 'Сумма'}
                </TableCell>
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
                  <TableCell>
                    {showContractorView
                      ? formatCurrency(deal.shares[1]?.amount || 0)
                      : formatCurrency(deal.totalAmount)}
                  </TableCell>
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
            title={showContractorView ? 'Мои выплаты' : 'Статусы выплат'}
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
              {recentPayments
                .filter((payment, index) => {
                  // For contractor view, show only their payments (index 1)
                  if (showContractorView) return index === 1;
                  // For agency view, show agency payments (index 0, 1)
                  if (showAgencyView) return index <= 1;
                  return true;
                })
                .map((payment) => (
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

        {/* Role-specific message */}
        {showContractorView && (
          <Card>
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Следите за документами
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Не забывайте загружать акты, счета-фактуры и чеки НПД после получения выплат
              </p>
              <Link href="/documents">
                <Button size="sm">Перейти к документам</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
