'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/Badge';
import {
  CalendarDays,
  Ticket,
  LayoutDashboard,
  QrCode,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function Navbar(): React.ReactElement {
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOfficerOrAdmin = currentUser.role === 'officer' || currentUser.role === 'admin';
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/checkin');

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5 select-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--uc-blue)] text-white shadow-xs transition-colors group-hover:bg-[var(--uc-blue-deep)]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-lg font-bold tracking-tight text-slate-900">
                  UC<span className="text-[var(--uc-blue)]">Events</span>
                </span>
                <span className="py-0.2 rounded-full bg-[var(--uc-blue-container)] px-2 text-[9px] font-extrabold tracking-wider text-[var(--uc-blue-deep)] uppercase">
                  Alliance
                </span>
              </div>
            </div>
          </Link>

          {/* Clean Primary Navigation Links (Only Core Consumer Links) */}
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/events"
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                pathname === '/events'
                  ? 'bg-slate-100 font-bold text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Explore Events
            </Link>

            <Link
              href="/my-tickets"
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                pathname === '/my-tickets'
                  ? 'bg-slate-100 font-bold text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Ticket className="h-3.5 w-3.5" />
              My Tickets
            </Link>
          </nav>
        </div>

        {/* Right: Quick Operational Jump + Clean User Profile */}
        <div className="flex items-center gap-3">
          {/* Officers / Admins: Quick Jump to Management Desk */}
          {isOfficerOrAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href="/checkin"
                className={`hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all md:flex ${
                  pathname === '/checkin'
                    ? 'bg-[var(--uc-gold)] text-slate-900 shadow-xs'
                    : 'bg-[var(--uc-blue)] text-white shadow-xs hover:bg-[var(--uc-blue-deep)]'
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Check-In Desk</span>
              </Link>

              <Link
                href="/dashboard/members"
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                  isDashboardRoute && pathname !== '/checkin'
                    ? 'border-[var(--uc-blue)] bg-[var(--uc-blue-container)] text-[var(--uc-blue-deep)]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Officer</span> Portal
              </Link>
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200/80 bg-white p-1 pr-2.5 shadow-2xs transition-all hover:border-slate-300"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--uc-blue)] text-xs font-bold text-white shadow-2xs">
                {currentUser.name.charAt(0)}
              </div>
              <span className="hidden max-w-[120px] truncate text-xs font-bold text-slate-800 sm:block">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl duration-100">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="truncate font-mono text-[11px] text-slate-500">
                    {currentUser.studentNumber}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : currentUser.role === 'officer'
                            ? 'bg-[var(--uc-gold-container)] text-[var(--uc-gold-deep)]'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                    <span className="truncate text-[10px] text-slate-400">
                      {currentUser.section}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5 p-1 text-xs">
                  <Link
                    href="/my-tickets"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Ticket className="h-4 w-4 text-slate-400" /> My Passes & History
                  </Link>

                  {isOfficerOrAdmin && (
                    <Link
                      href="/dashboard/members"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400" /> Organization Dashboard
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
