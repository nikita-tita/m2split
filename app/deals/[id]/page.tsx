'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { ArrowLeft, FileStack, Edit, Trash2, Plus } from 'lucide-react';
import { mockDeals } from '@/lib/mock-data';
import { formatCurrency, formatDate, getTaxRegimeLabel } from '@/lib/validations';
import Link from 'next/link';

// Dynamic route with client-side rendering
export const dynamic = 'force-dynamic';

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const deal = mockDeals.find((d) => d.id === id);

  if (!deal) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Сделка не найдена</h2>
          <Link href="/deals">
            <Button className="mt-4">Вернуться к списку</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const sharesTotal = deal.shares.reduce((sum, share) => sum + share.sharePercent, 0);
  const isValid = Math.abs(sharesTotal - 100) < 0.01;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/deals">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{deal.objectName}</h1>
              <p className="mt-1 text-sm text-gray-500">{deal.objectAddress}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Edit className="w-5 h-5 mr-2" />
              Редактировать
            </Button>
            <Button>
              <FileStack className="w-5 h-5 mr-2" />
              Сформировать реестр
            </Button>
          </div>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader title="Информация о сделке" />
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">№ сделки</dt>
                <dd className="mt-1 text-sm font-mono text-gray-900">{deal.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Лот</dt>
                <dd className="mt-1 text-sm text-gray-900">{deal.lotNumber || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Сумма КВН</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(deal.totalAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Статус</dt>
                <dd className="mt-1">
                  <Badge variant={deal.status === 'IN_PROGRESS' ? 'info' : 'default'}>
                    {deal.status === 'DRAFT' && 'Черновик'}
                    {deal.status === 'IN_PROGRESS' && 'В работе'}
                    {deal.status === 'IN_REGISTRY' && 'В реестре'}
                    {deal.status === 'PAID' && 'Выплачено'}
                  </Badge>
                </dd>
              </div>
              {deal.contractNumber && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Договор №</dt>
                    <dd className="mt-1 text-sm text-gray-900">{deal.contractNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Дата договора</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {deal.contractDate ? formatDate(deal.contractDate) : '—'}
                    </dd>
                  </div>
                </>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Дата создания</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(deal.createdAt)}</dd>
              </div>
              {deal.specialAccountReceiptDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Поступило на спецсчёт</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(deal.specialAccountReceiptDate)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Валидация" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Сумма долей</span>
                <Badge variant={isValid ? 'success' : 'danger'}>
                  {sharesTotal.toFixed(2)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Участников</span>
                <span className="text-sm font-medium">{deal.shares.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Реквизиты</span>
                <Badge variant="success">Заполнены</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Shares */}
        <Card padding="none">
          <div className="p-6">
            <CardHeader title="Распределение долей" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Получатель</TableCell>
                <TableCell header>Роль</TableCell>
                <TableCell header>Доля %</TableCell>
                <TableCell header>Сумма</TableCell>
                <TableCell header>Режим</TableCell>
                <TableCell header>Ставка НДС</TableCell>
                <TableCell header>Договор</TableCell>
                <TableCell header></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deal.shares.map((share) => (
                <TableRow key={share.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{share.contractor?.name}</div>
                      <div className="text-xs text-gray-500">
                        ИНН: {share.contractor?.inn}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge size="sm" variant="info">
                      {share.role === 'AGENCY' && 'АН'}
                      {share.role === 'AGENT' && 'Агент'}
                      {share.role === 'IP' && 'ИП'}
                      {share.role === 'NPD' && 'НПД'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{share.sharePercent}%</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(share.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge size="sm">{getTaxRegimeLabel(share.taxRegime)}</Badge>
                  </TableCell>
                  <TableCell>{share.vatRate ? `${share.vatRate}%` : '—'}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {share.contractNumber && (
                        <>
                          <div>{share.contractNumber}</div>
                          {share.contractDate && (
                            <div className="text-gray-500">
                              {formatDate(share.contractDate)}
                            </div>
                          )}
                        </>
                      )}
                      {!share.contractNumber && '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 bg-gray-50 border-t">
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Добавить получателя
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
