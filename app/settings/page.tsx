'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setForm(settings);
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
            <p className="mt-1 text-sm text-gray-500">
              Конфигурация системы и интеграций
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Изменения сохранены</span>
            </div>
          )}
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader title="Реквизиты застройщика" />
          <div className="space-y-4">
            <Input
              label="Наименование организации"
              value={form.companyName}
              onChange={(e) => updateForm('companyName', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ИНН"
                value={form.inn}
                onChange={(e) => updateForm('inn', e.target.value)}
                required
              />
              <Input
                label="КПП"
                value={form.kpp}
                onChange={(e) => updateForm('kpp', e.target.value)}
                required
              />
            </div>
            <Input
              label="Адрес"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Bank Accounts */}
        <Card>
          <CardHeader title="Банковские счета" />
          <div className="space-y-4">
            <Input
              label="Расчётный счёт"
              value={form.currentAccount}
              onChange={(e) => updateForm('currentAccount', e.target.value)}
              required
            />
            <Input
              label="Спецсчёт распределения"
              value={form.specialAccount}
              onChange={(e) => updateForm('specialAccount', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="БИК"
                value={form.bik}
                onChange={(e) => updateForm('bik', e.target.value)}
                required
              />
              <Input
                label="Наименование банка"
                value={form.bankName}
                onChange={(e) => updateForm('bankName', e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* API Integration */}
        <Card>
          <CardHeader title="API и интеграции" />
          <div className="space-y-4">
            <Input
              label="API ключ"
              type="password"
              value={form.apiKey}
              onChange={(e) => updateForm('apiKey', e.target.value)}
            />
            <Input
              label="Webhook URL для статусов банка"
              placeholder="https://your-domain.com/webhooks/bank-status"
              value={form.webhookUrl}
              onChange={(e) => updateForm('webhookUrl', e.target.value)}
            />
            <Input
              label="IP whitelist (через запятую)"
              placeholder="192.168.1.1, 10.0.0.1"
              value={form.ipWhitelist}
              onChange={(e) => updateForm('ipWhitelist', e.target.value)}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={!hasChanges}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={!hasChanges}>
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Layout>
  );
}
