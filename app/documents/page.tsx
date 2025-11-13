'use client';

import React, { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { BusinessProcessInfo } from '@/components/ui/BusinessProcessInfo';
import { businessProcessContent } from '@/lib/business-process-content';
import { OnboardingTip } from '@/components/ui/OnboardingTip';
import { useStore } from '@/lib/store';

export default function DocumentsPage() {
  const { currentRole } = useStore();
  const [activeTab, setActiveTab] = useState('contractors');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (contractorId: string) => {
    setUploadingFor(contractorId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingFor) {
      console.log(`Uploading ${file.name} for contractor ${uploadingFor}`);

      // TODO: Implement actual upload to storage
      // For now, just show an alert
      alert(`Документ "${file.name}" загружен для контрагента ${uploadingFor}`);

      // Reset
      setUploadingFor(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Документы и первичка</h1>
          <p className="mt-1 text-sm text-gray-500">
            Управление первичной документацией по выплатам
          </p>
        </div>

        {/* Onboarding Tips by Role */}
        {currentRole === 'M2_OPERATOR' && (
          <OnboardingTip
            id="m2-documents-list"
            title="📄 Управление первичкой"
            description="Здесь собирается вся первичная документация от исполнителей после выплат. Для агентств нужны акты и счета-фактуры, для ИП - акты, для НПД - чеки. Следите за полнотой первички, чтобы сформировать пакет для застройщика."
          />
        )}

        {currentRole === 'DEVELOPER_ADMIN' && (
          <OnboardingTip
            id="dev-documents-list"
            title="📦 Пакеты документов от М2"
            description="Здесь М2 формирует для вас сводные пакеты документов по каждому реестру выплат. В пакете: реестр, банковские статусы, первичка от всех исполнителей. Скачивайте готовые архивы для бухгалтерии."
          />
        )}

        {currentRole === 'CONTRACTOR' && (
          <OnboardingTip
            id="contractor-documents-list"
            title="📋 Ваши документы для М2"
            description="После получения выплаты вам нужно загрузить первичные документы. Для ИП/УСН - акт выполненных работ, для ОСН - акт + счёт-фактура, для НПД - чек. Без документов выплата считается незакрытой."
          />
        )}

        {currentRole === 'AGENCY_ADMIN' && (
          <OnboardingTip
            id="agency-documents-list"
            title="📑 Документы агентства"
            description="Здесь загружайте первичные документы по выплатам вашему агентству. Для ОСН нужны акт и счёт-фактура, для УСН - только акт. Следите за полнотой документов ваших агентов."
          />
        )}

        {/* Business Process Description */}
        <BusinessProcessInfo {...businessProcessContent.documents} />

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('contractors')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contractors'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Исполнители
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'packages'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Пакеты застройщика
            </button>
            <button
              onClick={() => setActiveTab('m2service')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'm2service'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Сервис М2
            </button>
          </nav>
        </div>

        {/* Contractors Tab */}
        {activeTab === 'contractors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">АН &quot;Недвижимость Плюс&quot;</h3>
                  <p className="text-sm text-gray-500 mt-1">НДС 20%</p>
                </div>
                <Badge variant="success">Загружено</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Акт выполненных работ</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Счёт-фактура</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Просмотр документов
                </Button>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">Петров П.П.</h3>
                  <p className="text-sm text-gray-500 mt-1">УСН</p>
                </div>
                <Badge variant="warning">Запрошено</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Акт выполненных работ</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => handleUploadClick('contractor-1')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить документ
                </Button>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">Сидорова А.И.</h3>
                  <p className="text-sm text-gray-500 mt-1">НПД</p>
                </div>
                <Badge variant="danger">Не загружено</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Чек НПД</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => handleUploadClick('contractor-2')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить чек
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <Card>
            <CardHeader title="Пакеты документов для застройщика" />
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium">Реестр РЕЕ-2024-001</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Сводный пакет: реестр + банковские статусы + первичка
                  </p>
                </div>
                <Button variant="secondary">Скачать .zip</Button>
              </div>
            </div>
          </Card>
        )}

        {/* M2 Service Tab */}
        {activeTab === 'm2service' && (
          <Card>
            <CardHeader title="Счета и акты сервиса М2" />
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium">Счёт №М2-2024-03</h4>
                  <p className="text-sm text-gray-500 mt-1">Март 2024 • 50 000 ₽</p>
                </div>
                <Button variant="secondary">Скачать</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
