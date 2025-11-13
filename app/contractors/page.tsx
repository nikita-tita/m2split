'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Plus, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Contractor, ContractorRole, TaxRegime } from '@/types';
import { getTaxRegimeLabel, formatDateTime } from '@/lib/validations';

interface ContractorForm {
  name: string;
  inn: string;
  kpp: string;
  accountNumber: string;
  bik: string;
  bankName: string;
  address: string;
  taxRegime: TaxRegime;
  role: ContractorRole;
}

export default function ContractorsPage() {
  const { contractors, addContractor, updateContractor } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractorForm>({
    name: '',
    inn: '',
    kpp: '',
    accountNumber: '',
    bik: '',
    bankName: '',
    address: '',
    taxRegime: 'USN',
    role: 'AGENT',
  });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      inn: '',
      kpp: '',
      accountNumber: '',
      bik: '',
      bankName: '',
      address: '',
      taxRegime: 'USN',
      role: 'AGENT',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contractor: Contractor) => {
    setEditingId(contractor.id);
    setForm({
      name: contractor.name,
      inn: contractor.inn,
      kpp: contractor.kpp || '',
      accountNumber: contractor.accountNumber,
      bik: contractor.bik,
      bankName: contractor.bankName,
      address: contractor.address,
      taxRegime: contractor.taxRegime,
      role: contractor.role,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing contractor
      updateContractor(editingId, {
        ...form,
        kpp: form.kpp || undefined,
        updatedAt: new Date(),
      });
    } else {
      // Create new contractor
      const newContractor: Contractor = {
        id: `c${Date.now()}`,
        ...form,
        kpp: form.kpp || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addContractor(newContractor);
    }

    setIsModalOpen(false);
  };

  const updateForm = (field: keyof ContractorForm, value: any) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Контрагенты и оферты</h1>
            <p className="mt-1 text-sm text-gray-500">
              Управление исполнителями и акцептом оферт
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-5 h-5 mr-2" />
            Добавить контрагента
          </Button>
        </div>

        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Наименование</TableCell>
                <TableCell header>ИНН</TableCell>
                <TableCell header>Роль</TableCell>
                <TableCell header>Режим</TableCell>
                <TableCell header>Счёт</TableCell>
                <TableCell header>Банк</TableCell>
                <TableCell header>Оферта</TableCell>
                <TableCell header> </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractors.map((contractor) => (
                <TableRow key={contractor.id}>
                  <TableCell>
                    <div className="font-medium">{contractor.name}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{contractor.inn}</span>
                  </TableCell>
                  <TableCell>
                    <Badge size="sm" variant="info">
                      {contractor.role === 'AGENCY' && 'АН'}
                      {contractor.role === 'AGENT' && 'Агент'}
                      {contractor.role === 'IP' && 'ИП'}
                      {contractor.role === 'NPD' && 'НПД'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge size="sm">{getTaxRegimeLabel(contractor.taxRegime)}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{contractor.accountNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{contractor.bankName}</div>
                      <div className="text-xs text-gray-500 font-mono">БИК: {contractor.bik}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contractor.offerAcceptedAt ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div className="text-xs">
                          <div className="text-green-600 font-medium">Принято</div>
                          <div className="text-gray-500">
                            {formatDateTime(contractor.offerAcceptedAt)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="warning">Не принято</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(contractor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Редактирование контрагента' : 'Добавление контрагента'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Наименование"
            placeholder="ООО Недвижимость Плюс"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ИНН"
              placeholder="7701234567"
              value={form.inn}
              onChange={(e) => updateForm('inn', e.target.value)}
              required
            />
            <Input
              label="КПП (опционально)"
              placeholder="770101001"
              value={form.kpp}
              onChange={(e) => updateForm('kpp', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Роль"
              value={form.role}
              onChange={(e) => updateForm('role', e.target.value)}
              options={[
                { value: 'AGENCY', label: 'Агентство недвижимости' },
                { value: 'AGENT', label: 'Агент' },
                { value: 'IP', label: 'Индивидуальный предприниматель' },
                { value: 'NPD', label: 'Самозанятый (НПД)' },
              ]}
            />
            <Select
              label="Налоговый режим"
              value={form.taxRegime}
              onChange={(e) => updateForm('taxRegime', e.target.value)}
              options={[
                { value: 'VAT', label: 'НДС' },
                { value: 'USN', label: 'УСН' },
                { value: 'NPD', label: 'НПД' },
              ]}
            />
          </div>

          <Input
            label="Расчётный счёт"
            placeholder="40702810100000001234"
            value={form.accountNumber}
            onChange={(e) => updateForm('accountNumber', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="БИК банка"
              placeholder="044525225"
              value={form.bik}
              onChange={(e) => updateForm('bik', e.target.value)}
              required
            />
            <Input
              label="Наименование банка"
              placeholder="ПАО Сбербанк"
              value={form.bankName}
              onChange={(e) => updateForm('bankName', e.target.value)}
              required
            />
          </div>

          <Input
            label="Адрес"
            placeholder="г. Москва, ул. Примерная, д. 1"
            value={form.address}
            onChange={(e) => updateForm('address', e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit">
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
