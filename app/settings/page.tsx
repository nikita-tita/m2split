'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
          <p className="mt-1 text-sm text-gray-500">
            Конфигурация системы и интеграций
          </p>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader title="Реквизиты застройщика" />
          <div className="space-y-4">
            <Input label="Наименование организации" defaultValue="ООО 'СтройДевелопмент'" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="ИНН" defaultValue="7701234567" />
              <Input label="КПП" defaultValue="770101001" />
            </div>
            <Input label="Адрес" defaultValue="г. Москва, ул. Строителей, д. 1" />
          </div>
        </Card>

        {/* Bank Accounts */}
        <Card>
          <CardHeader title="Банковские счета" />
          <div className="space-y-4">
            <Input
              label="Расчётный счёт"
              defaultValue="40702810100000001234"
            />
            <Input
              label="Спецсчёт распределения"
              defaultValue="40702810200000002345"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="БИК" defaultValue="044525225" />
              <Input label="Наименование банка" defaultValue="ПАО Сбербанк" />
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
              defaultValue="••••••••••••••••"
            />
            <Input
              label="Webhook URL для статусов банка"
              placeholder="https://your-domain.com/webhooks/bank-status"
            />
            <Input
              label="IP whitelist (через запятую)"
              placeholder="192.168.1.1, 10.0.0.1"
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary">Отмена</Button>
          <Button>Сохранить изменения</Button>
        </div>
      </div>
    </Layout>
  );
}
