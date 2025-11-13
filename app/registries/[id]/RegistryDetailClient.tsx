'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { ArrowLeft, Send, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getTaxRegimeLabel } from '@/lib/validations';
import { registriesService } from '@/lib/services/registries.service';
import { eventsService } from '@/lib/services/events.service';
import Link from 'next/link';

interface RegistryDetailClientProps {
  id: string;
}

export default function RegistryDetailClient({ id }: RegistryDetailClientProps) {
  const { registries, currentRole, updateRegistry } = useStore();
  const registry = registries.find((r) => r.id === id);
  const [updating, setUpdating] = useState(false);

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

  const handleApprove = async () => {
    setUpdating(true);
    try {
      // Update registry status
      try {
        await registriesService.updateRegistryStatus(registry.id, 'APPROVED');
      } catch (error) {
        console.warn('Supabase not configured, updating store directly');
      }

      // Update store
      updateRegistry(registry.id, {
        status: 'APPROVED',
        approvedAt: new Date(),
      });

      // Log event
      await eventsService.logEvent({
        type: 'REGISTRY_APPROVED',
        entityType: 'REGISTRY',
        entityId: registry.id,
        userId: '1', // TODO: Get from auth
        userName: 'Developer Admin',
        userRole: currentRole,
        description: `Реестр ${registry.registryNumber} утверждён застройщиком`,
        metadata: {
          registryNumber: registry.registryNumber,
          totalAmount: registry.totalAmount,
          linesCount: registry.linesCount,
        },
      });

      alert('Реестр утверждён');
    } catch (error) {
      console.error('Failed to approve registry:', error);
      alert('Не удалось утвердить реестр');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Укажите причину отклонения:');
    if (!reason) return;

    setUpdating(true);
    try {
      // Update registry status
      try {
        await registriesService.updateRegistryStatus(registry.id, 'DRAFT');
      } catch (error) {
        console.warn('Supabase not configured, updating store directly');
      }

      // Update store
      updateRegistry(registry.id, {
        status: 'DRAFT',
      });

      // Log event
      await eventsService.logEvent({
        type: 'REGISTRY_APPROVED',
        entityType: 'REGISTRY',
        entityId: registry.id,
        userId: '1', // TODO: Get from auth
        userName: 'Developer Admin',
        userRole: currentRole,
        description: `Реестр ${registry.registryNumber} отклонён: ${reason}`,
        metadata: {
          registryNumber: registry.registryNumber,
          rejectionReason: reason,
        },
      });

      alert('Реестр отклонён');
    } catch (error) {
      console.error('Failed to reject registry:', error);
      alert('Не удалось отклонить реестр');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendToBank = async () => {
    setUpdating(true);
    try {
      // Update registry status
      try {
        await registriesService.updateRegistryStatus(registry.id, 'SENT_TO_BANK');
      } catch (error) {
        console.warn('Supabase not configured, updating store directly');
      }

      // Update store
      updateRegistry(registry.id, {
        status: 'SENT_TO_BANK',
        sentToBankAt: new Date(),
      });

      // Log event
      await eventsService.logEvent({
        type: 'REGISTRY_SENT_TO_BANK',
        entityType: 'REGISTRY',
        entityId: registry.id,
        userId: '2', // TODO: Get from auth
        userName: 'M2 Operator',
        userRole: currentRole,
        description: `Реестр ${registry.registryNumber} отправлен в банк`,
        metadata: {
          registryNumber: registry.registryNumber,
          totalAmount: registry.totalAmount,
          linesCount: registry.linesCount,
        },
      });

      alert('Реестр отправлен в банк');
    } catch (error) {
      console.error('Failed to send registry to bank:', error);
      alert('Не удалось отправить реестр в банк');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (
    lineId: string,
    newStatus: 'PENDING' | 'ACCEPTED_BY_BANK' | 'EXECUTED' | 'ERROR',
    contractorName?: string
  ) => {
    setUpdating(true);
    try {
      let errorCode: string | undefined;
      let errorText: string | undefined;

      // If marking as error, ask for error details
      if (newStatus === 'ERROR') {
        errorCode = prompt('Код ошибки банка:') || undefined;
        errorText = prompt('Описание ошибки:') || undefined;
        if (!errorText) {
          alert('Необходимо указать описание ошибки');
          setUpdating(false);
          return;
        }
      }

      // Update payment status
      try {
        await registriesService.updatePaymentLineStatus(lineId, newStatus, errorCode, errorText);
      } catch (error) {
        console.warn('Supabase not configured, updating store directly');
      }

      // Update store - find and update the specific line
      const updatedLines = registry.lines.map(line =>
        line.id === lineId
          ? {
              ...line,
              paymentStatus: newStatus,
              bankErrorCode: errorCode,
              bankErrorText: errorText,
            }
          : line
      );

      updateRegistry(registry.id, {
        lines: updatedLines,
      });

      // Log event
      await eventsService.logEvent({
        type: 'PAYMENT_STATUS_CHANGED',
        entityType: 'PAYMENT',
        entityId: lineId,
        userId: '2', // TODO: Get from auth
        userName: 'M2 Operator',
        userRole: currentRole,
        description: `Статус выплаты изменён: ${contractorName || 'Получатель'} → ${getPaymentStatusLabel(newStatus)}`,
        metadata: {
          registryId: registry.id,
          registryNumber: registry.registryNumber,
          lineId,
          newStatus,
          errorCode,
          errorText,
        },
      });

      alert(`Статус выплаты обновлён: ${getPaymentStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Не удалось обновить статус выплаты');
    } finally {
      setUpdating(false);
    }
  };

  const getPaymentStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      PENDING: 'Ожидание',
      ACCEPTED_BY_BANK: 'Принято банком',
      EXECUTED: 'Исполнено',
      ERROR: 'Ошибка',
    };
    return labels[status] || status;
  };

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

    return <Badge variant={variants[status] || 'default'} size="sm">{getPaymentStatusLabel(status)}</Badge>;
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
            {/* Developer Admin: Approve/Reject when PENDING_APPROVAL */}
            {currentRole === 'DEVELOPER_ADMIN' && registry.status === 'PENDING_APPROVAL' && (
              <>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  disabled={updating}
                >
                  {updating ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Утвердить реестр
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={updating}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Отклонить
                </Button>
              </>
            )}

            {/* M2 Operator: Send to bank when APPROVED */}
            {currentRole === 'M2_OPERATOR' && registry.status === 'APPROVED' && (
              <Button
                variant="primary"
                onClick={handleSendToBank}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
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
                    <div className="flex items-center gap-2">
                      {getPaymentStatusBadge(line.paymentStatus)}
                      {/* M2 Operator can update payment status when registry sent to bank */}
                      {currentRole === 'M2_OPERATOR' &&
                       (registry.status === 'SENT_TO_BANK' || registry.status === 'EXECUTED') &&
                       line.paymentStatus !== 'EXECUTED' && (
                        <select
                          value={line.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(
                            line.id,
                            e.target.value as 'PENDING' | 'ACCEPTED_BY_BANK' | 'EXECUTED' | 'ERROR',
                            line.contractor?.name
                          )}
                          disabled={updating}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="PENDING">Ожидание</option>
                          <option value="ACCEPTED_BY_BANK">Принято банком</option>
                          <option value="EXECUTED">Исполнено</option>
                          <option value="ERROR">Ошибка</option>
                        </select>
                      )}
                    </div>
                    {line.bankErrorText && (
                      <div className="text-xs text-red-600 mt-1">
                        {line.bankErrorCode && `[${line.bankErrorCode}] `}
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
