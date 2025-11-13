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
} from 'lucide-react';
import { useStore, UserRole } from '@/lib/store';
import { RoleSwitcher } from './RoleSwitcher';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles: UserRole[]; // Which roles can see this item
}

const navigation: NavigationItem[] = [
  {
    name: 'Дашборд',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['DEVELOPER_ADMIN', 'M2_OPERATOR', 'AGENCY_ADMIN', 'CONTRACTOR'],
  },
  {
    name: 'Сделки',
    href: '/deals',
    icon: FileText,
    roles: ['DEVELOPER_ADMIN', 'M2_OPERATOR', 'AGENCY_ADMIN', 'CONTRACTOR'],
  },
  {
    name: 'Реестры',
    href: '/registries',
    icon: FileStack,
    roles: ['DEVELOPER_ADMIN', 'M2_OPERATOR'],
  },
  {
    name: 'Выплаты',
    href: '/payments',
    icon: CreditCard,
    roles: ['DEVELOPER_ADMIN', 'M2_OPERATOR', 'AGENCY_ADMIN', 'CONTRACTOR'],
  },
  {
    name: 'Документы',
    href: '/documents',
    icon: FileCheck,
    roles: ['DEVELOPER_ADMIN', 'M2_OPERATOR', 'AGENCY_ADMIN', 'CONTRACTOR'],
  },
  {
    name: 'Контрагенты',
    href: '/contractors',
    icon: Users,
    roles: ['DEVELOPER_ADMIN', 'M2_OPERATOR'],
  },
  {
    name: 'Настройки',
    href: '/settings',
    icon: Settings,
    roles: ['DEVELOPER_ADMIN', 'M2_OPERATOR'],
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { currentRole } = useStore();

  // Filter navigation based on current role
  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(currentRole)
  );

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
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

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

          {/* Role Switcher */}
          <div className="p-4 border-t border-gray-200">
            <RoleSwitcher />
          </div>
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
