'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { mockPayments, mockContractors } from '@/lib/mock-data';
import { formatCurrency, formatDateTime } from '@/lib/validations';

export default function PaymentsPage() {
  const payments = mockPayments;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Выплаты и статусы банка</h1>
          <p className="mt-1 text-sm text-gray-500">
            Мониторинг статусов выплат от банка
          </p>
        </div>

        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Реестр</TableCell>
                <TableCell header>Получатель</TableCell>
                <TableCell header>Сумма</TableCell>
                <TableCell header>Статус</TableCell>
                <TableCell header>Референс банка</TableCell>
                <TableCell header>Дата</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const contractor = mockContractors.find(c => c.id === payment.contractorId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <span className="font-mono text-sm">{payment.registryId}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contractor?.name}</div>
                        <div className="text-xs text-gray-500">ИНН: {contractor?.inn}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
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
                      {payment.status === 'ERROR' && payment.bankErrorText && (
                        <div className="text-xs text-red-600 mt-1">
                          {payment.bankErrorText}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.bankReference ? (
                        <span className="font-mono text-xs">{payment.bankReference}</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{formatDateTime(payment.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
