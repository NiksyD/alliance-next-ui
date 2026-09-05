'use client';

import React, { useState } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, UserCheck, UserX, Clock, Check, X, Shield, Plus } from 'lucide-react';
import type { User } from '@/types/auth';

export default function MembersManagementPage(): React.ReactElement {
  const members = useEventStore((s) => s.members);
  const registrationRequests = useEventStore((s) => s.registrationRequests);
  const approveMemberRequest = useEventStore((s) => s.approveMemberRequest);
  const rejectMemberRequest = useEventStore((s) => s.rejectMemberRequest);
  const toggleMemberActive = useEventStore((s) => s.toggleMemberActive);
  const updateMemberRole = useEventStore((s) => s.updateMemberRole);

  const [activeTab, setActiveTab] = useState<'members' | 'approvals'>('members');
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.courseAndYear.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Master Data</Badge>
              <span className="font-mono text-xs text-slate-500">
                {members.length} Registered Members
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Organization Members & Account Approvals
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage member profiles, course sections, membership types, and review pending
              sign-ups.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
            <button
              onClick={() => setActiveTab('members')}
              className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'members'
                  ? 'bg-[var(--uc-blue)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'approvals'
                  ? 'bg-[var(--uc-blue)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Approvals
              {registrationRequests.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 font-mono text-[10px] text-white">
                  {registrationRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'members' ? (
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="w-full md:w-80">
              <Input
                placeholder="Search member by name or student #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Members Master Table */}
            <Card className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="p-3.5 pl-5">Student Number</th>
                    <th className="p-3.5">Full Name & Email</th>
                    <th className="p-3.5">Course & Year</th>
                    <th className="p-3.5">Section</th>
                    <th className="p-3.5">Membership</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5 font-mono font-bold text-[var(--uc-blue-deep)]">
                        {member.studentNumber}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <p className="font-mono text-[11px] text-slate-400">{member.email}</p>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">{member.courseAndYear}</td>
                      <td className="p-3.5 font-mono font-semibold text-slate-500">
                        {member.section}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {member.membershipType}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateMemberRole(member.id, e.target.value as User['role'])
                          }
                          className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 shadow-2xs"
                        >
                          <option value="student">Student</option>
                          <option value="officer">Officer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <Badge variant={member.isActive ? 'success' : 'neutral'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <Button
                          variant={member.isActive ? 'ghost' : 'outline'}
                          size="sm"
                          onClick={() => toggleMemberActive(member.id)}
                        >
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Account Registration Approval Queue */}
            {registrationRequests.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                <UserCheck className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-3 text-lg font-bold text-slate-800">
                  No Pending Member Sign-Up Requests
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  All student organization registrations have been approved or processed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {registrationRequests.map((req) => (
                  <Card key={req.id} className="flex flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <Badge variant="warning">
                          <Clock className="mr-1 h-3 w-3" /> Pending Approval
                        </Badge>
                        <span className="font-mono text-[10px] text-slate-400">
                          {req.submittedAt}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1">
                        <h3 className="text-base font-bold text-slate-900">{req.fullName}</h3>
                        <p className="font-mono text-xs font-bold text-[var(--uc-blue-deep)]">
                          Student ID: {req.studentNumber}
                        </p>
                        <p className="text-xs text-slate-500">{req.email}</p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Course & Year:
                          </span>
                          <p className="font-medium text-slate-700">{req.courseAndYear}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Section:
                          </span>
                          <p className="font-medium text-slate-700">{req.section}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        leftIcon={<Check className="h-4 w-4" />}
                        onClick={() => approveMemberRequest(req.id)}
                      >
                        Approve Member
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<X className="h-4 w-4 text-red-500" />}
                        onClick={() => rejectMemberRequest(req.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
