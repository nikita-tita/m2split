'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { ArrowLeft, Plus, Trash2, Info } from 'lucide-react';
import { useStore } from '@/lib/store';
import { mockContractors, mockUsers } from '@/lib/mock-data';
import { Deal, DealShare, DealStatus, ContractorRole, TaxRegime, VATRate, Contractor, Project, Tariff } from '@/types';
import { formatCurrency } from '@/lib/validations';
import { counterpartiesService } from '@/lib/services/counterparties.service';
import { projectsService } from '@/lib/services/projects.service';
import { tariffsService } from '@/lib/services/tariffs.service';
import { eventsService } from '@/lib/services/events.service';
import { BusinessProcessInfo } from '@/components/ui/BusinessProcessInfo';
import { businessProcessContent } from '@/lib/business-process-content';
import { OnboardingTip } from '@/components/ui/OnboardingTip';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ShareForm {
  contractorId: string;
  role: ContractorRole;
  sharePercent: number;
  amount: number; // Auto-calculated from sharePercent and commission
  taxRegime: TaxRegime;
  vatRate?: VATRate;
  contractNumber: string;
  contractDate: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const { addDeal, currentRole } = useStore();

  // Check permissions
  const canCreateDeal = ['M2_OPERATOR', 'AGENCY_ADMIN', 'CONTRACTOR'].includes(currentRole);
  const isM2Operator = currentRole === 'M2_OPERATOR';
  const isAgencyAdmin = currentRole === 'AGENCY_ADMIN';
  const isContractor = currentRole === 'CONTRACTOR';

  // Developer & Project (only for M2 Operator)
  const [developers, setDevelopers] = useState<Contractor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const [objectName, setObjectName] = useState('');
  const [objectAddress, setObjectAddress] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractDate, setContractDate] = useState('');

  // Client fields (на кого бронируем)
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Tariff and commission
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [calculatedCommission, setCalculatedCommission] = useState<number>(0);

  const [shares, setShares] = useState<ShareForm[]>([]);

  // Check access on mount
  useEffect(() => {
    if (!canCreateDeal) {
      router.push('/deals');
    }
  }, [canCreateDeal, router]);

  // Load developers and projects on mount (only for M2 Operator)
  useEffect(() => {
    if (isM2Operator) {
      loadDevelopersAndProjects();
    }
  }, [isM2Operator]);

  // Filter projects when developer changes
  useEffect(() => {
    if (selectedDeveloperId) {
      const filtered = projects.filter(p => p.developerId === selectedDeveloperId);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
    // Reset project selection when developer changes
    setSelectedProjectId('');
    setObjectName('');
    setObjectAddress('');
  }, [selectedDeveloperId, projects]);

  // Auto-fill object info from selected project
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        setObjectName(project.projectName);
        setObjectAddress(project.address || `${project.city}, ${project.region}`);
      }
    }
  }, [selectedProjectId, projects]);

  // Auto-find tariff and calculate commission when project is selected
  useEffect(() => {
    const findTariff = async () => {
      if (selectedProjectId && selectedDeveloperId) {
        try {
          const tariff = await tariffsService.findBestTariff({
            developerId: selectedDeveloperId,
            projectId: selectedProjectId,
          });

          setSelectedTariff(tariff);

          // Calculate commission if totalAmount is set
          if (tariff && totalAmount) {
            const commission = tariffsService.calculateCommission(
              parseFloat(totalAmount),
              tariff
            );
            setCalculatedCommission(commission);
          } else {
            setCalculatedCommission(0);
          }
        } catch (error) {
          console.error('Failed to find tariff:', error);
          setSelectedTariff(null);
          setCalculatedCommission(0);
        }
      } else {
        setSelectedTariff(null);
        setCalculatedCommission(0);
      }
    };

    findTariff();
  }, [selectedProjectId, selectedDeveloperId, totalAmount]);

  // Recalculate all share amounts when commission changes
  useEffect(() => {
    if (calculatedCommission > 0 && shares.length > 0) {
      setShares(prevShares =>
        prevShares.map(share => ({
          ...share,
          amount: (calculatedCommission * share.sharePercent) / 100,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedCommission]);

  const loadDevelopersAndProjects = async () => {
    try {
      // Load developers
      const devData = await counterpartiesService.getCounterparties({
        type: 'DEVELOPER',
        offerAccepted: true,
      });
      setDevelopers(devData);

      // Load projects (Moscow only)
      const projData = await projectsService.getProjects({
        city: 'Москва',
        isActive: true,
      });
      setProjects(projData);
    } catch (error) {
      console.error('Failed to load developers/projects:', error);
    }
  };

  const addShare = () => {
    setShares([...shares, {
      contractorId: '',
      role: 'AGENT',
      sharePercent: 0,
      amount: 0,
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

    // Auto-set VAT rate when taxRegime is OSN
    if (field === 'taxRegime' && value === 'OSN') {
      newShares[index].vatRate = 20;
    } else if (field === 'taxRegime' && value !== 'OSN') {
      newShares[index].vatRate = undefined;
    }

    // Auto-calculate amount based on share percent and commission
    if (field === 'sharePercent' && calculatedCommission > 0) {
      newShares[index].amount = (calculatedCommission * value) / 100;
    }

    setShares(newShares);
  };

  const sharesTotal = shares.reduce((sum, share) => sum + share.sharePercent, 0);
  const isValidShares = Math.abs(sharesTotal - 100) < 0.01;

  // Submit validation depends on role
  const canSubmit = objectName && objectAddress && totalAmount && shares.length > 0 && isValidShares &&
    (isAgencyAdmin || (isM2Operator && selectedDeveloperId && selectedProjectId));

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
        amount: share.amount, // Use pre-calculated amount from commission
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
      developerId: selectedDeveloperId || undefined,
      projectId: selectedProjectId || undefined,
      totalAmount: amount,
      status: 'DRAFT' as DealStatus,
      shares: dealShares,
      contractNumber: contractNumber || undefined,
      contractDate: contractDate ? new Date(contractDate) : undefined,
      clientName: clientName || undefined,
      clientPhone: clientPhone || undefined,
      clientEmail: clientEmail || undefined,
      tariffId: selectedTariff?.id,
      commissionCalculatedAmount: calculatedCommission || undefined,
      commissionActualAmount: calculatedCommission || undefined,
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

    // Log deal creation event
    eventsService.logEvent({
      type: 'DEAL_CREATED',
      entityType: 'DEAL',
      entityId: dealId,
      userId: '2', // TODO: Get from auth
      userName: 'Current User',
      userRole: currentRole,
      description: `Сделка создана: ${objectName}`,
      metadata: {
        objectName,
        objectAddress,
        totalAmount: amount,
        commissionAmount: calculatedCommission,
        participantsCount: shares.length,
        developerId: selectedDeveloperId,
        projectId: selectedProjectId,
      },
    });

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
              {isM2Operator && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <Info className="w-4 h-4" />
                  <span>Система работает только для объектов в Москве</span>
                </div>
              )}
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

        {/* Onboarding for Contractor */}
        {isContractor && (
          <OnboardingTip
            id="contractor-deal-form"
            title="✏️ Заполните данные сделки"
            description="Укажите объект недвижимости, сумму договора с клиентом и данные клиента. Система автоматически рассчитает комиссию КВН на основе тарифа М2 с застройщиком. Затем вы сможете распределить доли между участниками (агентство, агенты, ИП)."
          />
        )}

        {/* Business Process Description */}
        <BusinessProcessInfo {...businessProcessContent.dealCreation} />

        {/* Basic Info */}
        <Card>
          <CardHeader title="Основная информация" />
          <div className="space-y-4">
            {/* Only M2 Operator can select developer and project */}
            {isM2Operator && (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Застройщик"
                  value={selectedDeveloperId}
                  onChange={(e) => setSelectedDeveloperId(e.target.value)}
                  options={[
                    { value: '', label: 'Выберите застройщика' },
                    ...developers.map(d => ({
                      value: d.id,
                      label: d.name
                    }))
                  ]}
                  required
                />
                <Select
                  label="Проект / ЖК"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={[
                    { value: '', label: selectedDeveloperId ? 'Выберите проект' : 'Сначала выберите застройщика' },
                    ...filteredProjects.map(p => ({
                      value: p.id,
                      label: p.projectName
                    }))
                  ]}
                  required
                  disabled={!selectedDeveloperId}
                />
              </div>
            )}
            <Input
              label="Название объекта"
              placeholder="ЖК Солнечный"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              required
              disabled={isM2Operator && !selectedProjectId}
            />
            <Input
              label="Адрес объекта"
              placeholder="г. Москва, ул. Солнечная, д. 10"
              value={objectAddress}
              onChange={(e) => setObjectAddress(e.target.value)}
              required
              disabled={isM2Operator && !selectedProjectId}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Лот (квартира, офис)"
                placeholder="Кв. 45"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
              />
              <Input
                label="Сумма договора с застройщиком (₽)"
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

            {/* Tariff and Commission Calculation */}
            {selectedTariff && totalAmount && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Расчет комиссии КВН
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Тариф:</span>
                    <span className="font-medium text-gray-900">
                      {tariffsService.getTariffDisplayInfo(selectedTariff)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Сумма договора:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(parseFloat(totalAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold text-blue-900">Комиссия КВН:</span>
                    <span className="font-bold text-blue-900">
                      {formatCurrency(calculatedCommission)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    * Расчет на основе уникального клиента (максимальный тариф)
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader title="Информация о клиенте" />
          <p className="text-sm text-gray-500 mb-4">На кого бронируем объект</p>
          <div className="space-y-4">
            <Input
              label="ФИО клиента"
              placeholder="Иванов Иван Иванович"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Телефон"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="client@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
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
                      {calculatedCommission > 0 && share.amount > 0
                        ? formatCurrency(share.amount)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={share.taxRegime}
                        onChange={(e) => updateShare(index, 'taxRegime', e.target.value)}
                        options={[
                          { value: 'OSN', label: 'НДС' },
                          { value: 'USN', label: 'УСН' },
                          { value: 'NPD', label: 'НПД' },
                        ]}
                      />
                    </TableCell>
                    <TableCell>
                      {share.taxRegime === 'OSN' ? (
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
