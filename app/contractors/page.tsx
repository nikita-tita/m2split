'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Plus, CheckCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Contractor, ContractorType } from '@/types';
import { formatDateTime } from '@/lib/validations';
import { counterpartiesService } from '@/lib/services/counterparties.service';
import { eventsService } from '@/lib/services/events.service';
import { BusinessProcessInfo } from '@/components/ui/BusinessProcessInfo';
import { businessProcessContent } from '@/lib/business-process-content';
import { OnboardingTip } from '@/components/ui/OnboardingTip';
import { useStore } from '@/lib/store';

interface ContractorForm {
  type: ContractorType;
  name: string;
  inn: string;
  kpp: string;
  accountNumber: string;
  bik: string;
  bankName: string;
  email: string;
  phone: string;
}

export default function ContractorsPage() {
  const { currentRole } = useStore();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractorForm>({
    type: 'AGENT',
    name: '',
    inn: '',
    kpp: '',
    accountNumber: '',
    bik: '',
    bankName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = async () => {
    try {
      setLoading(true);
      const data = await counterpartiesService.getCounterparties();
      setContractors(data);
    } catch (error) {
      console.error('Failed to load contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      type: 'AGENT',
      name: '',
      inn: '',
      kpp: '',
      accountNumber: '',
      bik: '',
      bankName: '',
      email: '',
      phone: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contractor: Contractor) => {
    setEditingId(contractor.id);
    setForm({
      type: contractor.type,
      name: contractor.name,
      inn: contractor.inn,
      kpp: contractor.kpp || '',
      accountNumber: contractor.accountNumber || '',
      bik: contractor.bik || '',
      bankName: contractor.bankName || '',
      email: contractor.email || '',
      phone: contractor.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      const input = {
        type: form.type,
        name: form.name,
        inn: form.inn,
        kpp: form.kpp || undefined,
        accountNumber: form.accountNumber || undefined,
        bik: form.bik || undefined,
        bankName: form.bankName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
      };

      let contractorId: string;
      if (editingId) {
        await counterpartiesService.updateCounterparty(editingId, input);
        contractorId = editingId;

        // Log contractor update event
        await eventsService.logEvent({
          type: 'CONTRACTOR_UPDATED',
          entityType: 'CONTRACTOR',
          entityId: contractorId,
          userId: '2', // TODO: Get from auth
          userName: 'Current User',
          userRole: currentRole,
          description: `Контрагент обновлён: ${form.name}`,
          metadata: {
            name: form.name,
            inn: form.inn,
            type: form.type,
          },
        });
      } else {
        const created = await counterpartiesService.createCounterparty(input);
        contractorId = created.id;

        // Log contractor creation event
        await eventsService.logEvent({
          type: 'CONTRACTOR_CREATED',
          entityType: 'CONTRACTOR',
          entityId: contractorId,
          userId: '2', // TODO: Get from auth
          userName: 'Current User',
          userRole: currentRole,
          description: `Контрагент создан: ${form.name}`,
          metadata: {
            name: form.name,
            inn: form.inn,
            type: form.type,
          },
        });
      }

      await loadContractors();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save contractor:', error);
      alert('Не удалось сохранить контрагента');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptOffer = async (id: string) => {
    try {
      const contractor = contractors.find(c => c.id === id);
      await counterpartiesService.acceptOffer(id);

      // Log offer acceptance event
      if (contractor) {
        await eventsService.logEvent({
          type: 'CONTRACTOR_OFFER_ACCEPTED',
          entityType: 'CONTRACTOR',
          entityId: id,
          userId: '2', // TODO: Get from auth
          userName: 'Current User',
          userRole: currentRole,
          description: `Оферта принята: ${contractor.name}`,
          metadata: {
            name: contractor.name,
            inn: contractor.inn,
            type: contractor.type,
          },
        });
      }

      await loadContractors();
    } catch (error) {
      console.error('Failed to accept offer:', error);
      alert('Не удалось принять оферту');
    }
  };

  const getTypeBadge = (type: ContractorType) => {
    const labels: Record<ContractorType, string> = {
      DEVELOPER: 'Застройщик',
      AGENCY: 'АН',
      AGENT: 'Агент',
      IP: 'ИП',
      NPD: 'НПД',
    };

    return <Badge variant="info" size="sm">{labels[type]}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Контрагенты</h1>
            <p className="mt-1 text-sm text-gray-500">
              Управление контрагентами и статусами оферт
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-5 h-5 mr-2" />
            Добавить контрагента
          </Button>
        </div>

        {/* Onboarding Tips by Role */}
        {currentRole === 'M2_OPERATOR' && (
          <OnboardingTip
            id="m2-contractors-list"
            title="👥 Управление исполнителями"
            description="Здесь управляются все исполнители заявок застройщиков: агентства, агенты, ИП, НПД. Добавляйте новых исполнителей, проверяйте реквизиты, принимайте оферты. Каждый исполнитель должен принять оферту перед первой выплатой."
          />
        )}

        {currentRole === 'DEVELOPER_ADMIN' && (
          <OnboardingTip
            id="dev-contractors-list"
            title="🔍 Исполнители ваших заявок"
            description="Здесь показаны все исполнители, которые работают с вашими заявками через М2. Вы видите агентства и агентов, которые находят клиентов из вашей базы контактов и оформляют сделки."
          />
        )}

        {currentRole === 'AGENCY_ADMIN' && (
          <OnboardingTip
            id="agency-contractors-list"
            title="👨‍💼 Агенты вашего агентства"
            description="Здесь управляются агенты вашего агентства. Добавляйте новых агентов, указывайте их реквизиты, следите за принятием оферт. Это нужно для корректного распределения комиссии между агентством и агентами."
          />
        )}

        {currentRole === 'CONTRACTOR' && (
          <OnboardingTip
            id="contractor-profile"
            title="👤 Ваш профиль исполнителя"
            description="Здесь ваши данные как исполнителя заявок. Убедитесь, что реквизиты указаны правильно - на них будут приходить выплаты. Обязательно примите оферту М2 перед началом работы."
          />
        )}

        {/* Business Process Description */}
        <BusinessProcessInfo {...businessProcessContent.contractors} />

        {/* Contractors Table */}
        <Card padding="none">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-4">Загрузка контрагентов...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell header>Тип</TableCell>
                    <TableCell header>Название</TableCell>
                    <TableCell header>ИНН / КПП</TableCell>
                    <TableCell header>Реквизиты</TableCell>
                    <TableCell header>Оферта</TableCell>
                    <TableCell header>Дата создания</TableCell>
                    <TableCell header> </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractors.map((contractor) => (
                    <TableRow key={contractor.id}>
                      <TableCell>
                        {getTypeBadge(contractor.type)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contractor.name}</div>
                          {contractor.email && (
                            <div className="text-xs text-gray-500">{contractor.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          <div>ИНН: {contractor.inn}</div>
                          {contractor.kpp && <div>КПП: {contractor.kpp}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {contractor.accountNumber && (
                            <div>Р/С: {contractor.accountNumber}</div>
                          )}
                          {contractor.bik && (
                            <div>БИК: {contractor.bik}</div>
                          )}
                          {contractor.bankName && (
                            <div className="text-gray-500">{contractor.bankName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contractor.offerAcceptedAt ? (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Принята
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAcceptOffer(contractor.id)}
                          >
                            Принять оферту
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {formatDateTime(contractor.createdAt)}
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

              {contractors.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Пока нет контрагентов. Добавьте первого!</p>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Редактировать контрагента' : 'Новый контрагент'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Тип контрагента"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ContractorType })}
              options={[
                { value: 'DEVELOPER', label: 'Застройщик' },
                { value: 'AGENCY', label: 'Агентство недвижимости' },
                { value: 'AGENT', label: 'Агент (физлицо)' },
                { value: 'IP', label: 'Индивидуальный предприниматель' },
                { value: 'NPD', label: 'Самозанятый (НПД)' },
              ]}
              required
              disabled={saving}
            />

            <Input
              label="Название / ФИО"
              placeholder="ООО Компания или Иванов Иван Иванович"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={saving}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ИНН"
                placeholder="1234567890"
                value={form.inn}
                onChange={(e) => setForm({ ...form, inn: e.target.value })}
                required
                disabled={saving}
              />
              <Input
                label="КПП"
                placeholder="123456789"
                value={form.kpp}
                onChange={(e) => setForm({ ...form, kpp: e.target.value })}
                disabled={saving}
              />
            </div>

            <Input
              label="Расчётный счёт"
              placeholder="40702810..."
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              disabled={saving}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="БИК банка"
                placeholder="044525225"
                value={form.bik}
                onChange={(e) => setForm({ ...form, bik: e.target.value })}
                disabled={saving}
              />
              <Input
                label="Название банка"
                placeholder="ПАО Сбербанк"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                disabled={saving}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={saving}
            />

            <Input
              label="Телефон"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={saving}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  editingId ? 'Сохранить' : 'Создать'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
