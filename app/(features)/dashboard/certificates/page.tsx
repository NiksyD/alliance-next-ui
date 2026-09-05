'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useEventStore } from '@/stores/eventStore';
import type { EventRegistration } from '@/types/events';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { Award, Search, Download, Check, X, AlertTriangle, RotateCcw } from 'lucide-react';

export default function CertificatesPage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const registrations = useEventStore((s) => s.registrations);
  const toggleCertificateEligibility = useEventStore((s) => s.toggleCertificateEligibility);

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [search, setSearch] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible' | 'ineligible'>(
    'all',
  );

  // DOM Windowing for high-volume attendance lists (1,000+ attendees)
  const [visibleLimit, setVisibleLimit] = useState<number>(50);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  // Confirmation Modal state for Revocation (destructive action)
  const [revokeTarget, setRevokeTarget] = useState<EventRegistration | null>(null);

  // Undo Toast state for 1-click Grant
  const [grantToast, setGrantToast] = useState<{
    registrationId: string;
    studentName: string;
  } | null>(null);

  const eventRegistrations = useMemo(() => {
    return registrations.filter((r) => r.eventId === selectedEventId);
  }, [registrations, selectedEventId]);

  const eligibleCount = useMemo(() => {
    return eventRegistrations.filter((r) => r.certificateEligible).length;
  }, [eventRegistrations]);

  const ineligibleCount = eventRegistrations.length - eligibleCount;

  // Auto-dismiss grant toast after 5 seconds
  useEffect(() => {
    if (!grantToast) return;
    const timer = setTimeout(() => {
      setGrantToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [grantToast]);

  const handleGrant = (reg: EventRegistration): void => {
    toggleCertificateEligibility(reg.id);
    setGrantToast({
      registrationId: reg.id,
      studentName: reg.studentName,
    });
  };

  const handleConfirmRevoke = (): void => {
    if (revokeTarget) {
      toggleCertificateEligibility(revokeTarget.id);
      setRevokeTarget(null);
    }
  };

  const handleUndoGrant = (registrationId: string): void => {
    toggleCertificateEligibility(registrationId);
    setGrantToast(null);
  };

  // Filtered registrations based on search and eligibility status
  const filteredRegistrations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return eventRegistrations.filter((r) => {
      if (eligibilityFilter === 'eligible' && !r.certificateEligible) return false;
      if (eligibilityFilter === 'ineligible' && r.certificateEligible) return false;

      if (q) {
        return (
          r.studentName.toLowerCase().includes(q) ||
          r.studentNumber.toLowerCase().includes(q) ||
          r.courseAndYear.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [eventRegistrations, eligibilityFilter, search]);

  // Windowed slice of filtered registrations to maintain 60 FPS
  const visibleRegistrations = useMemo(() => {
    return filteredRegistrations.slice(0, visibleLimit);
  }, [filteredRegistrations, visibleLimit]);

  // Reset scroll position on filter or event change
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [selectedEventId, eligibilityFilter, search]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>): void => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (visibleLimit < filteredRegistrations.length) {
        setVisibleLimit((prev) => Math.min(prev + 50, filteredRegistrations.length));
      }
    }
  };

  const handleExportCSV = (): void => {
    const eligibleList = eventRegistrations.filter((r) => r.certificateEligible);
    if (eligibleList.length === 0) {
      alert('No attendees are currently eligible for certification.');
      return;
    }

    const headers = 'Student Number,Full Name,Course & Year,Checked In,Checked In Time\n';
    const rows = eligibleList
      .map(
        (r) =>
          `"${r.studentNumber}","${r.studentName}","${r.courseAndYear}","${r.checkedIn ? 'Yes' : 'No'}","${r.checkedInAt || ''}"`,
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificates-${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Event Selector */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="verified">Certification Module</Badge>
            <span className="font-mono text-xs text-slate-500">
              Attendance Completion Threshold
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Certificate Eligibility Tracking
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Audit attendees verified at door check-in and issue electronic participation
            certificates.
          </p>
        </div>

        <div className="w-full sm:w-96">
          <Dropdown
            value={selectedEventId}
            onChange={(val) => {
              setSelectedEventId(val);
              setSearch('');
              setVisibleLimit(50);
            }}
            options={events.map((e) => ({
              value: e.id,
              label: e.title,
              description: `${e.scheduleDate} • ${e.venueName.split('(')[0].trim()}`,
              badge: e.type,
            }))}
            align="right"
          />
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Total Event Attendees
          </span>
          <p className="mt-1 font-mono text-2xl font-extrabold text-slate-900">
            {eventRegistrations.length}
          </p>
        </Card>

        <Card className="border-[var(--uc-gold)]/40 bg-[var(--uc-gold-container)]/30 p-4">
          <span className="text-xs font-bold tracking-wider text-[var(--uc-gold-deep)] uppercase">
            Eligible for Certificate
          </span>
          <p className="mt-1 font-mono text-2xl font-extrabold text-[var(--uc-gold-deep)]">
            {eligibleCount} / {eventRegistrations.length}
          </p>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Batch Export
            </span>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Generate student certificate roster
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </Card>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Horizontal Status Tabs */}
        <div className="inline-flex items-center gap-1 self-start rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setEligibilityFilter('all');
              setVisibleLimit(50);
            }}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 whitespace-nowrap transition-all ${
              eligibilityFilter === 'all'
                ? 'bg-white font-bold text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Attendees
            <span className="py-0.2 rounded-full bg-slate-200/80 px-1.5 font-mono text-[10px] font-bold">
              {eventRegistrations.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEligibilityFilter('eligible');
              setVisibleLimit(50);
            }}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 whitespace-nowrap transition-all ${
              eligibilityFilter === 'eligible'
                ? 'bg-white font-bold text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Eligible
            <span className="py-0.2 rounded-full bg-emerald-100 px-1.5 font-mono text-[10px] font-bold text-emerald-800">
              {eligibleCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEligibilityFilter('ineligible');
              setVisibleLimit(50);
            }}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 whitespace-nowrap transition-all ${
              eligibilityFilter === 'ineligible'
                ? 'bg-white font-bold text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ineligible
            <span className="py-0.2 rounded-full bg-slate-200/80 px-1.5 font-mono text-[10px] font-bold">
              {ineligibleCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search attendee by name, ID, or course..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleLimit(50);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setVisibleLimit(50);
              }}
              className="absolute top-2.5 right-2.5 rounded p-0.5 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Attendee Eligibility Table with Windowed Scrolling */}
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
                <th className="p-3.5">Attendee Name</th>
                <th className="p-3.5">Course & Year</th>
                <th className="p-3.5">Door Check-In Status</th>
                <th className="p-3.5">Checked-In Timestamp</th>
                <th className="p-3.5">Certificate Status</th>
                <th className="p-3.5 pr-5 text-right">Officer Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    {search
                      ? `No attendees match "${search}".`
                      : 'No attendees found in this filter.'}
                  </td>
                </tr>
              ) : (
                visibleRegistrations.map((reg) => (
                  <tr key={reg.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="p-3.5 pl-5 font-mono font-bold whitespace-nowrap text-[var(--uc-blue-deep)]">
                      {reg.studentNumber}
                    </td>
                    <td className="p-3.5 font-bold whitespace-nowrap text-slate-800">
                      {reg.studentName}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-600">{reg.courseAndYear}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      {reg.checkedIn ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                          <Check className="h-3 w-3 stroke-[2.5]" /> Verified Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-500">
                          Not Checked In
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] whitespace-nowrap text-slate-500">
                      {reg.checkedInAt || '—'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {reg.certificateEligible ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--uc-gold)]/40 bg-[var(--uc-gold-container)] px-2.5 py-1 text-[11px] font-bold text-[var(--uc-gold-deep)]">
                          <Award className="h-3 w-3" /> Eligible
                        </span>
                      ) : (
                        <span className="font-medium text-slate-400">Ineligible</span>
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                      {reg.certificateEligible ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRevokeTarget(reg)}
                          className="h-7 px-2.5 text-xs font-semibold whitespace-nowrap text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleGrant(reg)}
                          className="h-7 px-2.5 text-xs font-semibold whitespace-nowrap"
                        >
                          Grant Eligibility
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Windowing Pagination Footer when roster is large (> visibleLimit) */}
          {visibleLimit < filteredRegistrations.length && (
            <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-600">
              <span>
                Showing first <strong>{visibleLimit}</strong> of{' '}
                <strong>{filteredRegistrations.length}</strong> loaded attendees
              </span>
              <button
                type="button"
                onClick={() =>
                  setVisibleLimit((prev) => Math.min(prev + 100, filteredRegistrations.length))
                }
                className="font-semibold text-[var(--uc-blue)] hover:underline"
              >
                Load Next 100 ↓
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Revocation Confirmation Modal (Destructive action safeguard) */}
      <Modal isOpen={!!revokeTarget} onClose={() => setRevokeTarget(null)} maxWidth="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pr-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Revoke Certificate Eligibility</h3>
              <p className="text-xs text-slate-500">Confirm override decision</p>
            </div>
          </div>

          <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p>Are you sure you want to revoke certificate eligibility for:</p>
            <p className="font-bold text-slate-900">{revokeTarget?.studentName}</p>
            <p className="font-mono text-slate-500">
              {revokeTarget?.studentNumber} • {revokeTarget?.courseAndYear}
            </p>
          </div>

          <p className="text-[11px] text-slate-500">
            This student will no longer appear on the certified distribution roster or be issued an
            official electronic credential.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRevokeTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmRevoke}>
              Revoke Eligibility
            </Button>
          </div>
        </div>
      </Modal>

      {/* Floating Undo Toast for 1-Click Grant */}
      {grantToast && (
        <div className="animate-in fade-in slide-in-from-bottom-3 fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white shadow-2xl duration-200">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </div>
          <div className="text-xs">
            <span className="font-bold">{grantToast.studentName}</span> is now eligible.
          </div>
          <button
            type="button"
            onClick={() => handleUndoGrant(grantToast.registrationId)}
            className="ml-2 inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            <RotateCcw className="h-3 w-3" />
            Undo
          </button>
          <button
            type="button"
            onClick={() => setGrantToast(null)}
            className="rounded p-0.5 text-slate-400 hover:text-white"
            title="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
