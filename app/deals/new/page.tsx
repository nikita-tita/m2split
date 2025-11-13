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
import { mockContractors, mockUsers } from '@/lib/mock-data';
import { Deal, DealShare, DealStatus, ContractorRole, TaxRegime, VATRate } from '@/types';
import { formatCurrency } from '@/lib/validations';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ShareForm {
  contractorId: string;
  role: ContractorRole;
  sharePercent: number;
  taxRegime: TaxRegime;
  vatRate?: VATRate;
  contractNumber: string;
  contractDate: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const { addDeal } = useStore();

  const [objectName, setObjectName] = useState('');
  const [objectAddress, setObjectAddress] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [shares, setShares] = useState<ShareForm[]>([]);

  const addShare = () => {
    setShares([...shares, {
      contractorId: '',
      role: 'AGENT',
      sharePercent: 0,
      taxRegime: 'USN',
      contractNumber: '',
      contractDate: '',
    }]);
  };

  const removeShare = (index: number) => {
    setShares(shares.filter((_, i) => i !== index));
  };

  const updateShare = (index: number, field: keyof ShareForm, value: any) => {
    const newShares = [...shares];
    newShares[index] = { ...newShares[index], [field]: value };

    // Auto-set VAT rate when taxRegime is VAT
    if (field === 'taxRegime' && value === 'VAT') {
      newShares[index].vatRate = 20;
    } else if (field === 'taxRegime' && value !== 'VAT') {
      newShares[index].vatRate = undefined;
    }

    // Auto-calculate amount based on share percent
    if (field === 'sharePercent' && totalAmount) {
      const amount = (parseFloat(totalAmount) * value) / 100;
      // Store amount in state if needed
    }

    setShares(newShares);
  };

  const sharesTotal = shares.reduce((sum, share) => sum + share.sharePercent, 0);
  const isValidShares = Math.abs(sharesTotal - 100) < 0.01;
  const canSubmit = objectName && objectAddress && totalAmount && shares.length > 0 && isValidShares;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    const dealId = `d${Date.now()}`;
    const amount = parseFloat(totalAmount);

    const dealShares: DealShare[] = shares.map((share, index) => {
      const contractor = mockContractors.find(c => c.id === share.contractorId);
      return {
        id: `s${dealId}_${index}`,
        contractorId: share.contractorId,
        contractor,
        role: share.role,
        sharePercent: share.sharePercent,
        amount: (amount * share.sharePercent) / 100,
        taxRegime: share.taxRegime,
        vatRate: share.vatRate,
        contractNumber: share.contractNumber || undefined,
        contractDate: share.contractDate ? new Date(share.contractDate) : undefined,
      };
    });

    const newDeal: Deal = {
      id: dealId,
      objectName,
      objectAddress,
      lotNumber: lotNumber || undefined,
      developerId: '1',
      totalAmount: amount,
      status: 'DRAFT' as DealStatus,
      shares: dealShares,
      contractNumber: contractNumber || undefined,
      contractDate: contractDate ? new Date(contractDate) : undefined,
      responsibleUserId: '2',
      initiator: {
        role: 'M2_OPERATOR',
        partyId: '1',
        userId: '2',
        timestamp: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addDeal(newDeal);
    router.push(`/deals/${dealId}`);
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/deals">
              <Button type="button" variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Создание сделки</h1>
              <p className="mt-1 text-sm text-gray-500">
                Укажите объект и распределите доли между участниками
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/deals">
              <Button type="button" variant="secondary">Отмена</Button>
            </Link>
            <Button type="submit" disabled={!canSubmit}>
              Создать сделку
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader title="Основная информация" />
          <div className="space-y-4">
            <Input
              label="Название объекта"
              placeholder="ЖК Солнечный"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              required
            />
            <Input
              label="Адрес объекта"
              placeholder="г. Москва, ул. Солнечная, д. 10"
              value={objectAddress}
              onChange={(e) => setObjectAddress(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Лот (квартира, офис)"
                placeholder="Кв. 45"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
              />
              <Input
                label="Сумма комиссии (₽)"
                type="number"
                placeholder="15000000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Номер договора"
                placeholder="ДК-2024-001"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
              />
              <Input
                label="Дата договора"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Shares */}
        <Card padding="none">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardHeader title="Распределение долей" />
                <p className="text-sm text-gray-500 mt-1">
                  Сумма долей: {sharesTotal.toFixed(2)}%{' '}
                  {isValidShares ? (
                    <Badge variant="success" size="sm">✓ Корректно</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Должно быть 100%</Badge>
                  )}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addShare}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить получателя
              </Button>
            </div>
          </div>

          {shares.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>Контрагент</TableCell>
                  <TableCell header>Роль</TableCell>
                  <TableCell header>Доля %</TableCell>
                  <TableCell header>Сумма</TableCell>
                  <TableCell header>Режим</TableCell>
                  <TableCell header>НДС %</TableCell>
                  <TableCell header>Договор</TableCell>
                  <TableCell header> </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shares.map((share, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={share.contractorId}
                        onChange={(e) => updateShare(index, 'contractorId', e.target.value)}
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
                        value={share.role}
                        onChange={(e) => updateShare(index, 'role', e.target.value)}
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
                        step="0.01"
                        min="0"
                        max="100"
                        value={share.sharePercent || ''}
                        onChange={(e) => updateShare(index, 'sharePercent', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {totalAmount && share.sharePercent
                        ? formatCurrency((parseFloat(totalAmount) * share.sharePercent) / 100)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={share.taxRegime}
                        onChange={(e) => updateShare(index, 'taxRegime', e.target.value)}
                        options={[
                          { value: 'VAT', label: 'НДС' },
                          { value: 'USN', label: 'УСН' },
                          { value: 'NPD', label: 'НПД' },
                        ]}
                      />
                    </TableCell>
                    <TableCell>
                      {share.taxRegime === 'VAT' ? (
                        <Select
                          value={share.vatRate?.toString() || '20'}
                          onChange={(e) => updateShare(index, 'vatRate', parseInt(e.target.value))}
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
                          value={share.contractNumber}
                          onChange={(e) => updateShare(index, 'contractNumber', e.target.value)}
                        />
                        <Input
                          type="date"
                          value={share.contractDate}
                          onChange={(e) => updateShare(index, 'contractDate', e.target.value)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShare(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {shares.length === 0 && (
            <div className="text-center py-12 border-t">
              <p className="text-gray-500">Нажмите &ldquo;Добавить получателя&rdquo; для распределения долей</p>
            </div>
          )}
        </Card>
      </form>
    </Layout>
  );
}
