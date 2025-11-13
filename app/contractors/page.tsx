'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Plus, CheckCircle } from 'lucide-react';
import { mockContractors } from '@/lib/mock-data';
import { getTaxRegimeLabel, formatDateTime } from '@/lib/validations';

export default function ContractorsPage() {
  const contractors = mockContractors;

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
          <Button>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
