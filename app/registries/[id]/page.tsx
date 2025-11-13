import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { ArrowLeft, Send, Download, CheckCircle } from 'lucide-react';
import { mockRegistries } from '@/lib/mock-data';
import { formatCurrency, formatDate, getTaxRegimeLabel } from '@/lib/validations';
import Link from 'next/link';

export async function generateStaticParams() {
  return mockRegistries.map((registry) => ({
    id: registry.id,
  }));
}

interface RegistryDetailPageProps {
  params: { id: string };
}

export default function RegistryDetailPage({ params }: RegistryDetailPageProps) {
  const { id } = params;
  const registry = mockRegistries.find((r) => r.id === id);

  if (!registry) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Реестр не найден</h2>
          <Link href="/registries">
            <Button className="mt-4">Вернуться к списку</Button>
          </Link>
        </div>
      </Layout>
    );
  }

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

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'info' | 'success' | 'danger'> = {
      PENDING: 'default',
      ACCEPTED_BY_BANK: 'info',
      EXECUTED: 'success',
      ERROR: 'danger',
    };

    const labels: Record<string, string> = {
      PENDING: 'Ожидание',
      ACCEPTED_BY_BANK: 'Принято банком',
      EXECUTED: 'Исполнено',
      ERROR: 'Ошибка',
    };

    return <Badge variant={variants[status] || 'default'} size="sm">{labels[status] || status}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/registries">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Реестр {registry.registryNumber}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                от {formatDate(registry.date)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {registry.status === 'APPROVED' && (
              <Button>
                <Send className="w-5 h-5 mr-2" />
                Отправить в банк
              </Button>
            )}
            <Button variant="secondary">
              <Download className="w-5 h-5 mr-2" />
              Скачать
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader title="Статус" />
            <div className="mt-2">{getStatusBadge(registry.status)}</div>
          </Card>
          <Card>
            <CardHeader title="Строк" />
            <div className="mt-2 text-2xl font-bold">{registry.linesCount}</div>
          </Card>
          <Card>
            <CardHeader title="Общая сумма" />
            <div className="mt-2 text-2xl font-bold">
              {formatCurrency(registry.totalAmount)}
            </div>
          </Card>
          <Card>
            <CardHeader title="Утверждён" />
            <div className="mt-2 text-sm">
              {registry.approvedAt ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />
                  {formatDate(registry.approvedAt)}
                </>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </Card>
        </div>

        {/* Payment Lines */}
        <Card padding="none">
          <div className="p-6">
            <CardHeader title="Строки выплат" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Получатель</TableCell>
                <TableCell header>ИНН</TableCell>
                <TableCell header>Роль</TableCell>
                <TableCell header>Сумма</TableCell>
                <TableCell header>Режим</TableCell>
                <TableCell header>НДС</TableCell>
                <TableCell header>Счёт</TableCell>
                <TableCell header>БИК</TableCell>
                <TableCell header>Статус выплаты</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registry.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{line.contractor?.name}</div>
                      {line.comment && (
                        <div className="text-xs text-gray-500 max-w-xs">
                          {line.comment}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{line.inn}</span>
                  </TableCell>
                  <TableCell>
                    <Badge size="sm" variant="info">
                      {line.role === 'AGENCY' && 'АН'}
                      {line.role === 'AGENT' && 'Агент'}
                      {line.role === 'IP' && 'ИП'}
                      {line.role === 'NPD' && 'НПД'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(line.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge size="sm">{getTaxRegimeLabel(line.taxRegime)}</Badge>
                  </TableCell>
                  <TableCell>
                    {line.vatRate ? `${line.vatRate}%` : '—'}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{line.accountNumber}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{line.bik}</span>
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(line.paymentStatus)}
                    {line.bankErrorText && (
                      <div className="text-xs text-red-600 mt-1">
                        {line.bankErrorText}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* History */}
        <Card>
          <CardHeader title="История изменений" />
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-32 text-gray-500">{formatDate(registry.createdAt)}</div>
              <div className="flex-1">Реестр создан</div>
            </div>
            {registry.approvedAt && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-32 text-gray-500">{formatDate(registry.approvedAt)}</div>
                <div className="flex-1">Реестр утверждён застройщиком</div>
              </div>
            )}
            {registry.sentToBankAt && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-32 text-gray-500">{formatDate(registry.sentToBankAt)}</div>
                <div className="flex-1">Отправлен в банк</div>
              </div>
            )}
            {registry.executedAt && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-32 text-gray-500">{formatDate(registry.executedAt)}</div>
                <div className="flex-1">Исполнен банком</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
