'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Download, Search, XCircle, Calendar, MapPin, X, GraduationCap } from 'lucide-react';

export default function EventReportsPage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const registrations = useEventStore((s) => s.registrations);

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [noShowSearch, setNoShowSearch] = useState('');
  const [visibleLimit, setVisibleLimit] = useState<number>(50);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const eventRegistrations = useMemo(() => {
    return registrations.filter((r) => r.eventId === selectedEventId);
  }, [registrations, selectedEventId]);

  const totalRegistered = eventRegistrations.length;
  const attendedCount = eventRegistrations.filter((r) => r.checkedIn).length;
  const noShowCount = totalRegistered - attendedCount;
  const attendanceRate =
    totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;
  const capacityLimit = activeEvent?.participantLimit || 1;
  const capacityFillRate = Math.round((totalRegistered / capacityLimit) * 100);

  // Demographics breakdown: Course / Program
  const programDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    eventRegistrations.forEach((r) => {
      const prog = r.courseAndYear.split(' - ')[0] || 'Other Program';
      counts[prog] = (counts[prog] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [eventRegistrations, totalRegistered]);

  // Demographics breakdown: Academic Year
  const yearDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      '1st Year': 0,
      '2nd Year': 0,
      '3rd Year': 0,
      '4th Year': 0,
    };

    eventRegistrations.forEach((r) => {
      if (r.courseAndYear.includes('1st Year')) counts['1st Year']++;
      else if (r.courseAndYear.includes('2nd Year')) counts['2nd Year']++;
      else if (r.courseAndYear.includes('3rd Year')) counts['3rd Year']++;
      else if (r.courseAndYear.includes('4th Year')) counts['4th Year']++;
    });

    return Object.entries(counts).map(([year, count]) => ({
      year,
      count,
      percentage: totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0,
    }));
  }, [eventRegistrations, totalRegistered]);

  // Filtered No-Shows for the audit table
  const noShowList = useMemo(() => {
    const q = noShowSearch.trim().toLowerCase();
    const absentees = eventRegistrations.filter((r) => !r.checkedIn);
    if (!q) return absentees;
    return absentees.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentNumber.toLowerCase().includes(q) ||
        r.courseAndYear.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }, [eventRegistrations, noShowSearch]);

  const visibleNoShows = useMemo(() => {
    return noShowList.slice(0, visibleLimit);
  }, [noShowList, visibleLimit]);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [selectedEventId, noShowSearch]);

  const handleExportEvaluationCSV = (): void => {
    if (!activeEvent) return;

    const headers =
      'Student Number,Attendee Name,Email,Course & Year,Status,Checked In,Checked In Time\n';
    const rows = eventRegistrations
      .map(
        (r) =>
          `"${r.studentNumber}","${r.studentName}","${r.email}","${r.courseAndYear}","${r.status}","${r.checkedIn ? 'YES' : 'NO'}","${r.checkedInAt || ''}"`,
      )
      .join('\n');

    const summaryBlock = `"EVENT PARTICIPATION AUDIT REPORT"\n"Event Title","${activeEvent.title}"\n"Schedule Date","${activeEvent.scheduleDate}"\n"Venue","${activeEvent.venueName}"\n"Total Registered",${totalRegistered}\n"Verified Present",${attendedCount}\n"No-Shows",${noShowCount}\n"Turnout Rate","${attendanceRate}%"\n\n`;

    const blob = new Blob([summaryBlock + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `event-audit-${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Standard Event Selector */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">Analytics & Reports</Badge>
            <span className="font-mono text-xs text-slate-500">Officer Post-Event Audit</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Event Participation Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Audit attendance yield, evaluate no-shows, and review participant demographics.
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center md:w-auto">
          <div className="w-full sm:w-80">
            <Dropdown
              value={selectedEventId}
              onChange={(val) => {
                setSelectedEventId(val);
                setNoShowSearch('');
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
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExportEvaluationCSV}
            className="shrink-0 font-semibold"
          >
            Export Audit CSV
          </Button>
        </div>
      </div>

      {/* Executive Attendance Yield & Capacity Card (Replaces 4 disjointed pastel boxes) */}
      <Card className="overflow-hidden border border-slate-200 shadow-2xs">
        <div className="border-b border-slate-100 bg-slate-50/60 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs font-bold tracking-wider text-[var(--uc-blue-deep)] uppercase">
                Event Performance Overview
              </span>
              <h2 className="mt-0.5 text-lg font-bold text-slate-900">{activeEvent?.title}</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {activeEvent?.scheduleDate}
              </span>
              <span className="inline-flex max-w-[220px] items-center gap-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {activeEvent?.venueName}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {/* Turnout Rate KPI */}
          <div className="p-5">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Turnout Yield
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-slate-900">
                {attendanceRate}%
              </span>
              <span className="text-xs font-medium text-slate-500">of signups</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              <strong className="font-bold text-emerald-700">{attendedCount}</strong> verified out
              of {totalRegistered}
            </p>
          </div>

          {/* Verified Present */}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Verified Present
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-2 font-mono text-3xl font-extrabold text-emerald-700">
              {attendedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">Admitted at entrance gate</p>
          </div>

          {/* No-Shows */}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Absentee / No-Show
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <p className="mt-2 font-mono text-3xl font-extrabold text-amber-700">{noShowCount}</p>
            <p className="mt-1 text-xs text-slate-500">
              {totalRegistered > 0 ? Math.round((noShowCount / totalRegistered) * 100) : 0}% absent
              rate
            </p>
          </div>

          {/* Venue Fill Rate */}
          <div className="p-5">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Venue Capacity
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-slate-900">
                {capacityFillRate}%
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({totalRegistered} / {capacityLimit})
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Max seating allocation</p>
          </div>
        </div>

        {/* Proportional Attendance Segment Bar */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Attendance Composition Breakdown</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
                Verified Present ({attendedCount})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-amber-400" />
                No-Shows ({noShowCount})
              </span>
            </div>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{
                width: `${totalRegistered > 0 ? (attendedCount / totalRegistered) * 100 : 0}%`,
              }}
              title={`Verified Present: ${attendedCount}`}
            />
            <div
              className="bg-amber-400 transition-all duration-300"
              style={{
                width: `${totalRegistered > 0 ? (noShowCount / totalRegistered) * 100 : 0}%`,
              }}
              title={`No-Shows: ${noShowCount}`}
            />
          </div>
        </div>
      </Card>

      {/* Demographics Row (Programs & Academic Years) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Academic Program Breakdown (7 Cols) */}
        <Card className="border border-slate-200 p-6 shadow-2xs lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Program Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution across college departments</p>
            </div>
            <GraduationCap className="h-4 w-4 text-[var(--uc-blue)]" />
          </div>

          <div className="mt-4 space-y-3.5">
            {programDistribution.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="max-w-[280px] truncate">{item.name}</span>
                  <span className="font-mono text-slate-600">
                    {item.count} attendee{item.count !== 1 ? 's' : ''} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[var(--uc-blue)] transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Academic Year Distribution (5 Cols) */}
        <Card className="border border-slate-200 p-6 shadow-2xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Year-Level Representation</h3>
              <p className="text-xs text-slate-500">Attendee standing progression</p>
            </div>
            <Badge variant="neutral">{totalRegistered} total</Badge>
          </div>

          <div className="mt-4 space-y-3.5">
            {yearDistribution.map((item) => (
              <div key={item.year} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{item.year}</span>
                  <span className="font-mono text-slate-600">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[var(--uc-gold-deep)] transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Searchable No-Show / Absentee Audit Table */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Absentee / No-Show Audit Roster</h3>
            <p className="text-xs text-slate-500">
              Registered students who did not present a verified check-in pass at the gate.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Input
              placeholder="Search no-show by name, ID, or program..."
              value={noShowSearch}
              onChange={(e) => {
                setNoShowSearch(e.target.value);
                setVisibleLimit(50);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            {noShowSearch && (
              <button
                type="button"
                onClick={() => {
                  setNoShowSearch('');
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

        <Card className="overflow-hidden border border-slate-200 shadow-2xs">
          <div ref={tableContainerRef} className="max-h-[440px] overflow-x-auto overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5 pl-5">Student Number</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Email Contact</th>
                  <th className="p-3.5">Course & Year</th>
                  <th className="p-3.5">Registration Time</th>
                  <th className="p-3.5 pr-5 text-right">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {noShowList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      {noShowSearch
                        ? `No absentees matched "${noShowSearch}".`
                        : 'Zero no-shows recorded! 100% turnout yield.'}
                    </td>
                  </tr>
                ) : (
                  visibleNoShows.map((reg) => (
                    <tr key={reg.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="p-3.5 pl-5 font-mono font-bold whitespace-nowrap text-[var(--uc-blue-deep)]">
                        {reg.studentNumber}
                      </td>
                      <td className="p-3.5 font-bold whitespace-nowrap text-slate-800">
                        {reg.studentName}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] whitespace-nowrap text-slate-500">
                        {reg.email}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-600">
                        {reg.courseAndYear}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] whitespace-nowrap text-slate-400">
                        {reg.registeredAt}
                      </td>
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-800">
                          <XCircle className="h-3 w-3 text-amber-600" /> Absent (No Scan)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            {visibleLimit < noShowList.length && (
              <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-600">
                <span>
                  Showing first <strong>{visibleLimit}</strong> of{' '}
                  <strong>{noShowList.length}</strong> absent attendees
                </span>
                <button
                  type="button"
                  onClick={() => setVisibleLimit((prev) => Math.min(prev + 50, noShowList.length))}
                  className="font-semibold text-[var(--uc-blue)] hover:underline"
                >
                  Load Next 50 ↓
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
