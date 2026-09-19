'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useEventStore } from '@/stores/eventStore';
import {
  Users,
  Building2,
  Award,
  BarChart3,
  ShieldCheck,
  QrCode,
  CalendarDays,
  Plus,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
  count?: number;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

export function DashboardLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const registrationRequests = useEventStore((s) => s.registrationRequests);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const pendingApprovalsCount = registrationRequests.length;

  // Strict Role-Based Access Control (RBAC): Students have zero access to back-office modules
  if (currentUser.role === 'student') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Officer Portal Access Restricted
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Your current profile is set to{' '}
            <strong className="text-slate-800">Student Member</strong>. Only appointed organization
            officers and campus administrators can access this operational portal.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/events">
              <button className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800">
                Return to Campus Events
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // System Administration access guard: Only Admin can access /dashboard/admin
  if (pathname === '/dashboard/admin' && currentUser.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Super Administrator Privileges Required
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Executive officers cannot alter system-wide permission levels or audit trails.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/members">
              <button className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800">
                Return to Member Directory
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navGroups: NavGroup[] = [
    {
      group: 'Event Operations',
      items: [
        {
          label: 'Door Check-In Desk',
          href: '/checkin',
          icon: QrCode,
          roles: ['officer', 'admin'],
          badge: 'Live',
        },
        {
          label: 'Certificate Tracking',
          href: '/dashboard/certificates',
          icon: Award,
          roles: ['officer', 'admin'],
        },
      ],
    },
    {
      group: 'Master Directory',
      items: [
        {
          label: 'Members & Approvals',
          href: '/dashboard/members',
          icon: Users,
          roles: ['officer', 'admin'],
          count: pendingApprovalsCount,
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
      group: 'Analytics & Governance',
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
          roles: ['admin'], // Strictly Admin exclusive
        },
      ],
    },
  ];

  const allItems = navGroups.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => i.href === pathname);
  const currentTitle = activeItem?.label || 'Officer Dashboard';

  return (
    <div className="flex min-h-screen bg-slate-50/70">
      {/* Dedicated App Shell Sidebar (The Only Navigation inside Back-Office) */}
      <aside
        className={`fixed top-0 z-40 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 transition-transform md:sticky md:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 overflow-y-auto">
          {/* Brand & Organization Switcher */}
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--uc-blue)] text-white shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-base font-extrabold tracking-tight text-slate-900">
                  UC<span className="text-[var(--uc-blue)]">Events</span>
                </span>
                <span className="py-0.2 rounded-full bg-slate-100 px-1.5 font-mono text-[9px] font-bold text-slate-500 uppercase">
                  Desk
                </span>
              </div>
              <p className="max-w-[140px] truncate text-[10px] font-bold text-slate-400">
                Alliance Student Council
              </p>
            </div>
          </div>

          {/* Quick Primary Action */}
          <Link href="/dashboard/events/create" className="block">
            <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              <span>Create New Event</span>
            </button>
          </Link>

          {/* Grouped Sidebar Modules */}
          <div className="space-y-5">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter((item) =>
                item.roles.includes(currentUser.role),
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.group} className="space-y-1">
                  <h2 className="px-2.5 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {group.group}
                  </h2>

                  <div className="space-y-0.5 pt-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileNavOpen(false)}
                          className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[var(--uc-blue-container)] font-bold text-[var(--uc-blue-deep)]'
                              : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                isActive ? 'text-[var(--uc-blue-deep)]' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span className="py-0.2 rounded-full border border-red-200 bg-red-50 px-1.5 text-[9px] font-bold text-red-600">
                              {item.badge}
                            </span>
                          )}
                          {item.count && item.count > 0 ? (
                            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-amber-500 px-1 font-mono text-[10px] font-bold text-white">
                              {item.count}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: User Details & Switch to Consumer Portal */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--uc-blue)] text-xs font-bold text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-bold text-slate-800">{currentUser.name}</p>
              <p className="font-mono text-[10px] text-slate-400 capitalize">{currentUser.role}</p>
            </div>
          </div>

          <Link
            href="/events"
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Student Portal</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* Main Back-Office Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Slim Top Bar: Breadcrumb + Mobile Toggle */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="mr-2 rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 md:hidden"
            >
              {isMobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="text-xs font-semibold text-slate-400">Portal</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">{currentTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 uppercase sm:inline-block">
              {currentUser.role} Mode
            </span>
          </div>
        </div>

        {/* Page Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
