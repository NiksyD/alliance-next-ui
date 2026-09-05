'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  Users,
  Building2,
  Award,
  BarChart3,
  ShieldCheck,
  QrCode,
  CalendarPlus,
} from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);

  const navSections = [
    {
      label: 'Event Operations',
      items: [
        { label: 'Check-In Desk', href: '/checkin', icon: QrCode, roles: ['officer', 'admin'] },
        {
          label: 'Post New Event',
          href: '/dashboard/events/create',
          icon: CalendarPlus,
          roles: ['officer', 'admin'],
        },
        {
          label: 'Certificates',
          href: '/dashboard/certificates',
          icon: Award,
          roles: ['officer', 'admin'],
        },
      ],
    },
    {
      label: 'Master Records',
      items: [
        {
          label: 'Members & Approvals',
          href: '/dashboard/members',
          icon: Users,
          roles: ['officer', 'admin'],
        },
        {
          label: 'Venues & Categories',
          href: '/dashboard/master-data',
          icon: Building2,
          roles: ['officer', 'admin'],
        },
      ],
    },
    {
      label: 'Analytics & Security',
      items: [
        {
          label: 'Participation Reports',
          href: '/dashboard/reports',
          icon: BarChart3,
          roles: ['officer', 'admin'],
        },
        {
          label: 'Officer Permissions',
          href: '/dashboard/admin',
          icon: ShieldCheck,
          roles: ['admin'],
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Sleek Sub-Header Navigation Tabs for Desktop */}
      <div className="mb-8 border-b border-slate-200">
        <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-[11px] font-bold tracking-wider text-[var(--uc-blue)] uppercase">
              Alliance Officer Portal
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Organization Management & Desk
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Signed in as:</span>
            <span className="font-bold text-slate-800">{currentUser.name}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 uppercase">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-px">
          {navSections
            .flatMap((s) => s.items)
            .map((item) => {
              if (!item.roles.includes(currentUser.role)) return null;
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-[var(--uc-blue)] text-[var(--uc-blue)]'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? 'text-[var(--uc-blue)]' : 'text-slate-400'}`}
                  />
                  {item.label}
                </Link>
              );
            })}
        </div>
      </div>

      {/* Child Content */}
      <main>{children}</main>
    </div>
  );
}
