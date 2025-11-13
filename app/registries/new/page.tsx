'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { mockContractors } from '@/lib/mock-data';
import { Registry, RegistryPaymentLine, RegistryStatus, ContractorRole, TaxRegime, VATRate, PaymentStatus } from '@/types';
import { formatCurrency } from '@/lib/validations';
import { eventsService } from '@/lib/services/events.service';
import { BusinessProcessInfo } from '@/components/ui/BusinessProcessInfo';
import { businessProcessContent } from '@/lib/business-process-content';
import { OnboardingTip } from '@/components/ui/OnboardingTip';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LineForm {
  contractorId: string;
  role: ContractorRole;
  amount: number;
  taxRegime: TaxRegime;
  vatRate?: VATRate;
  contractNumber: string;
  contractDate: string;
  comment: string;
}

export default function NewRegistryPage() {
  const router = useRouter();
  const { addRegistry, currentRole } = useStore();

  const [registryDate, setRegistryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [lines, setLines] = useState<LineForm[]>([]);

  const addLine = () => {
    setLines([...lines, {
      contractorId: '',
      role: 'AGENT',
      amount: 0,
      taxRegime: 'USN',
      contractNumber: '',
      contractDate: '',
      comment: '',
    }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof LineForm, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    // Auto-set VAT rate when taxRegime is OSN
    if (field === 'taxRegime' && value === 'OSN') {
      newLines[index].vatRate = 20;
    } else if (field === 'taxRegime' && value !== 'OSN') {
      newLines[index].vatRate = undefined;
    }

    // Contractor details (inn, accountNumber, bik) will be populated from the contractor data on save

    setLines(newLines);
  };

  const totalAmount = lines.reduce((sum, line) => sum + (line.amount || 0), 0);
  const canSubmit = registryDate && lines.length > 0 && lines.every(l => l.contractorId && l.amount > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    const registryId = `r${Date.now()}`;
    const registryNumber = `РЕЕ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    const registryLines: RegistryPaymentLine[] = lines.map((line, index) => {
      const contractor = mockContractors.find(c => c.id === line.contractorId);
      return {
        id: `l${registryId}_${index}`,
        registryId,
        contractorId: line.contractorId,
        contractor,
        role: line.role,
        inn: contractor?.inn || '',
        accountNumber: contractor?.accountNumber || '',
        bik: contractor?.bik || '',
        amount: line.amount,
        taxRegime: line.taxRegime,
        vatRate: line.vatRate,
        contractNumber: line.contractNumber || undefined,
        contractDate: line.contractDate ? new Date(line.contractDate) : undefined,
        comment: line.comment || undefined,
        paymentStatus: 'PENDING' as PaymentStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const newRegistry: Registry = {
      id: registryId,
      registryNumber,
      date: new Date(registryDate),
      status: 'DRAFT' as RegistryStatus,
      totalAmount,
      linesCount: lines.length,
      creatorId: '2',
      lines: registryLines,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addRegistry(newRegistry);

    // Log registry creation event
    eventsService.logEvent({
      type: 'REGISTRY_CREATED',
      entityType: 'REGISTRY',
      entityId: registryId,
      userId: '2', // TODO: Get from auth
      userName: 'M2 Operator',
      userRole: 'M2_OPERATOR',
      description: `Реестр создан: ${registryNumber}`,
      metadata: {
        registryNumber,
        totalAmount,
        linesCount: lines.length,
        date: registryDate,
      },
    });

    router.push(`/registries/${registryId}`);
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/registries">
              <Button type="button" variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Создание реестра</h1>
              <p className="mt-1 text-sm text-gray-500">
                Сформируйте реестр выплат для отправки в банк
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/registries">
              <Button type="button" variant="secondary">Отмена</Button>
            </Link>
            <Button type="submit" disabled={!canSubmit}>
              Создать реестр
            </Button>
          </div>
        </div>

        {/* Onboarding Tips by Role */}
        {currentRole === 'M2_OPERATOR' && (
          <OnboardingTip
            id="m2-registry-create"
            title="📋 Формирование реестра выплат"
            description="Здесь вы формируете реестр выплат исполнителям после того, как застройщик оплатил заявку. Добавьте всех исполнителей, укажите суммы сплита, и отправьте реестр в банк. М2 выплатит каждому исполнителю его долю со спецсчёта."
          />
        )}

        {currentRole === 'DEVELOPER_ADMIN' && (
          <OnboardingTip
            id="dev-registry-create"
            title="📊 М2 формирует реестры автоматически"
            description="Этот экран используется М2 для создания реестров выплат исполнителям ваших заявок. После оплаты заявки М2 автоматически распределяет комиссию между всеми участниками сделки и отправляет реестр в банк."
          />
        )}

        {/* Business Process Description */}
        <BusinessProcessInfo {...businessProcessContent.registryCreation} />

        {/* Basic Info */}
        <Card>
          <CardHeader title="Основная информация" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Дата реестра"
              type="date"
              value={registryDate}
              onChange={(e) => setRegistryDate(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Общая сумма
              </label>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Lines */}
        <Card padding="none">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardHeader title="Строки выплат" />
                <p className="text-sm text-gray-500 mt-1">
                  Добавьте получателей и суммы выплат
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addLine}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить строку
              </Button>
            </div>
          </div>

          {lines.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>Контрагент</TableCell>
                  <TableCell header>Роль</TableCell>
                  <TableCell header>Сумма (₽)</TableCell>
                  <TableCell header>Режим</TableCell>
                  <TableCell header>НДС %</TableCell>
                  <TableCell header>Договор</TableCell>
                  <TableCell header>Комментарий</TableCell>
                  <TableCell header> </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={line.contractorId}
                        onChange={(e) => updateLine(index, 'contractorId', e.target.value)}
                        options={[
                          { value: '', label: 'Выберите контрагента' },
                          ...mockContractors.map(c => ({
                            value: c.id,
                            label: `${c.name} (${c.inn})`
                          }))
                        ]}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={line.role}
                        onChange={(e) => updateLine(index, 'role', e.target.value)}
                        options={[
                          { value: 'AGENCY', label: 'АН' },
                          { value: 'AGENT', label: 'Агент' },
                          { value: 'IP', label: 'ИП' },
                          { value: 'NPD', label: 'НПД' },
                        ]}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.amount || ''}
                        onChange={(e) => updateLine(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={line.taxRegime}
                        onChange={(e) => updateLine(index, 'taxRegime', e.target.value)}
                        options={[
                          { value: 'OSN', label: 'НДС' },
                          { value: 'USN', label: 'УСН' },
                          { value: 'NPD', label: 'НПД' },
                        ]}
                      />
                    </TableCell>
                    <TableCell>
                      {line.taxRegime === 'OSN' ? (
                        <Select
                          value={line.vatRate?.toString() || '20'}
                          onChange={(e) => updateLine(index, 'vatRate', parseInt(e.target.value))}
                          options={[
                            { value: '0', label: '0%' },
                            { value: '10', label: '10%' },
                            { value: '20', label: '20%' },
                          ]}
                        />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          placeholder="№ договора"
                          value={line.contractNumber}
                          onChange={(e) => updateLine(index, 'contractNumber', e.target.value)}
                        />
                        <Input
                          type="date"
                          value={line.contractDate}
                          onChange={(e) => updateLine(index, 'contractDate', e.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Назначение платежа"
                        value={line.comment}
                        onChange={(e) => updateLine(index, 'comment', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {lines.length === 0 && (
            <div className="text-center py-12 border-t">
              <p className="text-gray-500">Нажмите &ldquo;Добавить строку&rdquo; для создания выплат</p>
            </div>
          )}
        </Card>
      </form>
    </Layout>
  );
}
