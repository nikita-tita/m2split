'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileText,
  FileStack,
  CreditCard,
  FileCheck,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useStore } from '@/lib/store';

const navigation = [
  { name: 'Дашборд', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Сделки', href: '/deals', icon: FileText },
  { name: 'Реестры', href: '/registries', icon: FileStack },
  { name: 'Выплаты', href: '/payments', icon: CreditCard },
  { name: 'Документы', href: '/documents', icon: FileCheck },
  { name: 'Контрагенты', href: '/contractors', icon: Users },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { currentUser } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">M2 Split</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          {currentUser && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.role === 'DEVELOPER_ADMIN' && 'Застройщик'}
                    {currentUser.role === 'M2_OPERATOR' && 'Оператор М2'}
                    {currentUser.role === 'CONTRACTOR' && 'Исполнитель'}
                    {currentUser.role === 'BANK_INTEGRATION' && 'Банк'}
                  </p>
                </div>
                <button
                  className="ml-3 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Выйти"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
