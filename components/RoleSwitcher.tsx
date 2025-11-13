'use client';

import React, { useState } from 'react';
import { useStore, UserRole } from '@/lib/store';
import { ChevronDown, Check, Users } from 'lucide-react';

const roles: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'DEVELOPER_ADMIN',
    label: 'Застройщик',
    description: 'Администратор застройщика',
  },
  {
    value: 'M2_OPERATOR',
    label: 'М2-Оператор',
    description: 'Сотрудник М2 Split',
  },
  {
    value: 'AGENCY_ADMIN',
    label: 'АН-Админ',
    description: 'Администратор агентства',
  },
  {
    value: 'CONTRACTOR',
    label: 'Агент',
    description: 'Агент / ИП / НПД',
  },
];

export function RoleSwitcher() {
  const { currentRole, switchRole } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentRoleData = roles.find((r) => r.value === currentRole);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center min-w-0 flex-1">
          <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-medium text-gray-900 truncate">
              {currentRoleData?.label}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentRoleData?.description}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Переключить роль
              </p>
            </div>
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => {
                  switchRole(role.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {role.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {role.description}
                  </p>
                </div>
                {currentRole === role.value && (
                  <Check className="w-4 h-4 text-primary-600 ml-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
