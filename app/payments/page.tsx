'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { mockPayments, mockContractors } from '@/lib/mock-data';
import { formatCurrency, formatDateTime } from '@/lib/validations';
import { BusinessProcessInfo } from '@/components/ui/BusinessProcessInfo';
import { businessProcessContent } from '@/lib/business-process-content';
import { OnboardingTip } from '@/components/ui/OnboardingTip';
import { useStore } from '@/lib/store';

export default function PaymentsPage() {
  const payments = mockPayments;
  const { currentRole } = useStore();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Выплаты и статусы банка</h1>
          <p className="mt-1 text-sm text-gray-500">
            Мониторинг статусов выплат от банка
          </p>
        </div>

        {/* Onboarding Tips by Role */}
        {currentRole === 'M2_OPERATOR' && (
          <OnboardingTip
            id="m2-payments-list"
            title="🏦 Мониторинг выплат от банка"
            description="Здесь отображаются статусы всех выплат по реестрам. Банк присылает референсы и статусы исполнения. Отслеживайте, какие выплаты прошли успешно, какие в ожидании, и какие завершились с ошибкой."
          />
        )}

        {currentRole === 'DEVELOPER_ADMIN' && (
          <OnboardingTip
            id="dev-payments-list"
            title="💳 Статусы выплат исполнителям"
            description="Здесь видны статусы всех выплат по вашим заявкам. После того как вы оплатили заявку, М2 формирует реестр и отправляет в банк. Здесь вы видите, когда банк исполнил выплаты исполнителям."
          />
        )}

        {currentRole === 'CONTRACTOR' && (
          <OnboardingTip
            id="contractor-payments-list"
            title="💰 Мои выплаты"
            description="Здесь отображаются статусы ваших выплат. Когда застройщик оплачивает заявку, М2 формирует реестр и отправляет в банк. Отслеживайте, когда банк исполнит вашу выплату и деньги поступят на ваш счёт."
          />
        )}

        {currentRole === 'AGENCY_ADMIN' && (
          <OnboardingTip
            id="agency-payments-list"
            title="📊 Выплаты агентству"
            description="Здесь отображаются статусы выплат вашему агентству и вашим агентам. После оплаты заявки застройщиком, М2 распределяет комиссию и отправляет реестр в банк. Следите за статусами исполнения."
          />
        )}

        {/* Business Process Description */}
        <BusinessProcessInfo {...businessProcessContent.payments} />

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
