'use client';

import React, { useState } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Award, CheckCircle2, XCircle, Search, Download, Filter } from 'lucide-react';

export default function CertificatesPage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const registrations = useEventStore((s) => s.registrations);
  const toggleCertificateEligibility = useEventStore((s) => s.toggleCertificateEligibility);

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [search, setSearch] = useState('');

  const eventRegistrations = registrations.filter((r) => r.eventId === selectedEventId);

  const filteredRegistrations = eventRegistrations.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const eligibleCount = eventRegistrations.filter((r) => r.certificateEligible).length;

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
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

          <div className="w-full md:w-80">
            <label className="mb-1 block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-[var(--uc-blue)] focus:outline-none"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              onClick={() => alert('Certificate recipient CSV downloaded successfully!')}
            >
              Export
            </Button>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mt-6 w-full md:w-80">
          <Input
            placeholder="Search attendee by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Attendee Eligibility Table */}
        <Card className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase">
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
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="p-3.5 pl-5 font-mono font-bold text-[var(--uc-blue-deep)]">
                    {reg.studentNumber}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{reg.studentName}</td>
                  <td className="p-3.5 text-slate-600">{reg.courseAndYear}</td>
                  <td className="p-3.5">
                    {reg.checkedIn ? (
                      <Badge variant="success">✓ Verified Present</Badge>
                    ) : (
                      <Badge variant="neutral">Not Checked In</Badge>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">
                    {reg.checkedInAt || '—'}
                  </td>
                  <td className="p-3.5">
                    {reg.certificateEligible ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--uc-gold)]/40 bg-[var(--uc-gold-container)] px-2.5 py-1 text-[11px] font-bold text-[var(--uc-gold-deep)]">
                        <Award className="h-3 w-3" /> Eligible
                      </span>
                    ) : (
                      <span className="font-medium text-slate-400">Ineligible</span>
                    )}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <Button
                      variant={reg.certificateEligible ? 'outline' : 'accent'}
                      size="sm"
                      onClick={() => toggleCertificateEligibility(reg.id)}
                    >
                      {reg.certificateEligible ? 'Revoke' : 'Grant Eligibility'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
