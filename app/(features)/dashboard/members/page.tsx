'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Search, UserCheck, Clock, Check, X } from 'lucide-react';
import type { User } from '@/types/auth';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'officer', label: 'Officer' },
  { value: 'admin', label: 'Admin' },
];

export default function MembersManagementPage(): React.ReactElement {
  const members = useEventStore((s) => s.members);
  const registrationRequests = useEventStore((s) => s.registrationRequests);
  const approveMemberRequest = useEventStore((s) => s.approveMemberRequest);
  const rejectMemberRequest = useEventStore((s) => s.rejectMemberRequest);
  const toggleMemberActive = useEventStore((s) => s.toggleMemberActive);
  const updateMemberRole = useEventStore((s) => s.updateMemberRole);

  const [activeTab, setActiveTab] = useState<'members' | 'approvals'>('members');
  const [search, setSearch] = useState('');

  // DOM Windowing for high-volume members roster (1,000+ members)
  const [visibleLimit, setVisibleLimit] = useState<number>(50);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.studentNumber.toLowerCase().includes(q) ||
        m.courseAndYear.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [members, search]);

  const visibleMembers = useMemo(() => {
    return filteredMembers.slice(0, visibleLimit);
  }, [filteredMembers, visibleLimit]);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [search, activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (visibleLimit < filteredMembers.length) {
        setVisibleLimit((prev) => Math.min(prev + 50, filteredMembers.length));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
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
            Manage member profiles, course sections, membership types, and review pending sign-ups.
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

          {/* Members Master Table with Windowed Scrolling */}
          <Card className="overflow-hidden border border-slate-200 shadow-2xs">
            <div
              ref={tableContainerRef}
              onScroll={handleScroll}
              className="max-h-[520px] overflow-x-auto overflow-y-auto"
            >
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="p-3.5 pl-5">Student Number</th>
                    <th className="p-3.5">Full Name & Email</th>
                    <th className="p-3.5">Course & Year</th>
                    <th className="p-3.5">Section</th>
                    <th className="p-3.5">Membership</th>
                    <th className="min-w-[150px] p-3.5">Assigned Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                        {search
                          ? `No members found matching "${search}".`
                          : 'No registered members in the organization.'}
                      </td>
                    </tr>
                  ) : (
                    visibleMembers.map((member) => (
                      <tr key={member.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="p-3.5 pl-5 font-mono font-bold whitespace-nowrap text-[var(--uc-blue-deep)]">
                          {member.studentNumber}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <p className="font-bold text-slate-800">{member.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">{member.email}</p>
                        </td>
                        <td className="p-3.5 font-medium whitespace-nowrap text-slate-600">
                          {member.courseAndYear}
                        </td>
                        <td className="p-3.5 font-mono font-semibold whitespace-nowrap text-slate-500">
                          {member.section}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {member.membershipType}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="w-32">
                            <Dropdown
                              size="sm"
                              value={member.role}
                              onChange={(val) => updateMemberRole(member.id, val as User['role'])}
                              options={ROLE_OPTIONS}
                            />
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <Badge variant={member.isActive ? 'success' : 'neutral'}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                          <Button
                            variant={member.isActive ? 'ghost' : 'outline'}
                            size="sm"
                            onClick={() => toggleMemberActive(member.id)}
                            className="h-7 px-2.5 text-xs font-semibold whitespace-nowrap"
                          >
                            {member.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Windowing Pagination Footer when members roster is large (> visibleLimit) */}
              {visibleLimit < filteredMembers.length && (
                <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-600">
                  <span>
                    Showing first <strong>{visibleLimit}</strong> of{' '}
                    <strong>{filteredMembers.length}</strong> loaded members
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleLimit((prev) => Math.min(prev + 100, filteredMembers.length))
                    }
                    className="font-semibold text-[var(--uc-blue)] hover:underline"
                  >
                    Load Next 100 ↓
                  </button>
                </div>
              )}
            </div>
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
  );
}
