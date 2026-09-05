'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/auth';
import { UserCog, ChevronDown, Check } from 'lucide-react';

export function DevPersonaPill(): React.ReactElement {
  const currentUser = useAuthStore((s) => s.currentUser);
  const switchRole = useAuthStore((s) => s.switchRole);
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'student', label: 'Student Member', desc: 'Browse events & claim passes' },
    { role: 'officer', label: 'Organization Officer', desc: 'Manage events, door scan, members' },
    { role: 'admin', label: 'System Admin', desc: 'Permissions, master data, audit logs' },
  ];

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-900 active:scale-95"
        >
          <UserCog className="h-3.5 w-3.5 text-[var(--uc-gold)]" />
          <span>
            Preview Role:{' '}
            <strong className="font-bold text-[var(--uc-gold)] capitalize">
              {currentUser.role}
            </strong>
          </span>
          <ChevronDown
            className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-2 absolute right-0 bottom-12 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl duration-150">
            <div className="border-b border-slate-100 px-2.5 py-1.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Evaluation Persona Switcher
              </span>
            </div>
            <div className="mt-1 space-y-1">
              {roles.map((item) => {
                const isSelected = currentUser.role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchRole(item.role);
                      setIsOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-start justify-between rounded-lg p-2 text-left transition-colors ${
                      isSelected
                        ? 'bg-[var(--uc-blue-container)] text-[var(--uc-blue-deep)]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs leading-tight font-bold">{item.label}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                    {isSelected && (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uc-blue)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
