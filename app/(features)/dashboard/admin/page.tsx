'use client';

import React, { useState } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ShieldAlert, History, UserCheck, Key } from 'lucide-react';
import type { User } from '@/types/auth';

export default function AdministrationPage(): React.ReactElement {
  const members = useEventStore((s) => s.members);
  const auditLogs = useEventStore((s) => s.auditLogs);
  const updateMemberRole = useEventStore((s) => s.updateMemberRole);
  const toggleMemberActive = useEventStore((s) => s.toggleMemberActive);

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Security & Access</Badge>
            <span className="font-mono text-xs text-slate-500">Super Administrator</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Officer Permissions & Audit Logs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Assign executive permissions, enforce multi-factor governance, and review system-wide
            audit activities.
          </p>
        </div>

        {/* Officers and Permissions Matrix */}
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Key className="h-4 w-4 text-[var(--uc-blue)]" /> Officer & Administrator Permissions
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Control which student leaders can publish events, manage check-in desks, or access
              member records.
            </p>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5 pl-5">User</th>
                  <th className="p-3.5">Assigned Level</th>
                  <th className="p-3.5">Event Publishing</th>
                  <th className="p-3.5">Attendance Gate Scan</th>
                  <th className="p-3.5">Member Master Edit</th>
                  <th className="p-3.5 pr-5 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="p-3.5 pl-5">
                      <p className="font-bold text-slate-900">{m.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {m.studentNumber} • {m.email}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={m.role}
                        onChange={(e) => updateMemberRole(m.id, e.target.value as User['role'])}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <option value="student">Student Member</option>
                        <option value="officer">Organization Officer</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      {m.role !== 'student' ? (
                        <span className="font-semibold text-emerald-700">✓ Allowed</span>
                      ) : (
                        <span className="text-slate-400">Restricted</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {m.role !== 'student' ? (
                        <span className="font-semibold text-emerald-700">✓ Allowed</span>
                      ) : (
                        <span className="text-slate-400">Restricted</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {m.role === 'admin' ? (
                        <span className="font-bold text-purple-700">Full Control</span>
                      ) : m.role === 'officer' ? (
                        <span className="font-semibold text-blue-700">Review & Approve</span>
                      ) : (
                        <span className="text-slate-400">View Only</span>
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        variant={m.isActive ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => toggleMemberActive(m.id)}
                      >
                        {m.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Audit Logs Trail */}
          <div className="pt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <History className="h-4 w-4 text-[var(--uc-gold-deep)]" /> System Audit Activity Trail
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Immutable audit events of permission elevations, account approvals, and event
              postings.
            </p>

            <Card className="mt-4 divide-y divide-slate-100 p-5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-4 py-3 text-xs first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.actorName}</span>
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                        ({log.actorRole})
                      </span>
                      <Badge variant="primary">{log.action}</Badge>
                    </div>
                    <p className="text-slate-700">{log.details}</p>
                    <p className="text-[10px] text-slate-400">Target: {log.target}</p>
                  </div>
                  <span className="font-mono text-[10px] whitespace-nowrap text-slate-400">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
