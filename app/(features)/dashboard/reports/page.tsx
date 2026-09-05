'use client';

import React, { useState } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BarChart3, Users, CheckCircle2, UserX, PieChart, Download, Calendar } from 'lucide-react';

export default function EventReportsPage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const registrations = useEventStore((s) => s.registrations);

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const eventRegistrations = registrations.filter((r) => r.eventId === selectedEventId);

  const totalRegistered = eventRegistrations.length;
  const attendedCount = eventRegistrations.filter((r) => r.checkedIn).length;
  const noShowCount = totalRegistered - attendedCount;
  const attendanceRate =
    totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;

  // Course distribution breakdown calculation
  const courseCounts: Record<string, number> = {};
  eventRegistrations.forEach((r) => {
    const course = r.courseAndYear.split(' - ')[0] || 'Other';
    courseCounts[course] = (courseCounts[course] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Analytics & Reports</Badge>
              <span className="font-mono text-xs text-slate-500">Officer Post-Event Audit</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Event Participation Report
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Audit attendance yield, track no-shows, and inspect participant course demographics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-[var(--uc-blue)] focus:outline-none"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => alert(`Exported complete report for ${activeEvent?.title}`)}
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* High-Level Metric Tiles */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold tracking-wider uppercase">Total Signups</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {totalRegistered}
            </p>
            <span className="text-[11px] text-slate-400">
              Capacity: {activeEvent?.participantLimit}
            </span>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/30 p-4">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-bold tracking-wider uppercase">Verified Present</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-mono text-2xl font-extrabold text-emerald-700 sm:text-3xl">
              {attendedCount}
            </p>
            <span className="text-[11px] font-semibold text-emerald-600">Scanned at Gate</span>
          </Card>

          <Card className="border-amber-200 bg-amber-50/30 p-4">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-bold tracking-wider uppercase">No-Show List</span>
              <UserX className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 font-mono text-2xl font-extrabold text-amber-700 sm:text-3xl">
              {noShowCount}
            </p>
            <span className="text-[11px] font-semibold text-amber-600">Absent Registered</span>
          </Card>

          <Card className="border-[var(--uc-blue)]/30 bg-[var(--uc-blue-container)]/30 p-4">
            <div className="flex items-center justify-between text-[var(--uc-blue-deep)]">
              <span className="text-xs font-bold tracking-wider uppercase">Attendance Rate</span>
              <BarChart3 className="h-4 w-4 text-[var(--uc-blue)]" />
            </div>
            <p className="mt-2 font-mono text-2xl font-extrabold text-[var(--uc-blue-deep)] sm:text-3xl">
              {attendanceRate}%
            </p>
            <span className="text-[11px] font-semibold text-[var(--uc-blue-deep)]">
              Turnout Yield
            </span>
          </Card>
        </div>

        {/* Detailed Demographics & No-Show Tables */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Demographic Breakdown (6 Cols) */}
          <div className="lg:col-span-6">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                <PieChart className="h-4 w-4 text-[var(--uc-blue)]" /> Course & Program Distribution
              </h2>
              <div className="mt-4 space-y-3">
                {Object.entries(courseCounts).map(([course, count]) => {
                  const percentage = Math.round((count / totalRegistered) * 100);
                  return (
                    <div key={course} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{course}</span>
                        <span className="font-mono">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[var(--uc-blue)] transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* No-Show Roster (6 Cols) */}
          <div className="lg:col-span-6">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                <UserX className="h-4 w-4 text-amber-500" /> Absentee / No-Show Roster
              </h2>
              <div className="mt-3 max-h-[300px] divide-y divide-slate-100 overflow-y-auto">
                {eventRegistrations
                  .filter((r) => !r.checkedIn)
                  .map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{r.studentName}</p>
                        <p className="font-mono text-[11px] text-slate-400">
                          {r.studentNumber} • {r.courseAndYear}
                        </p>
                      </div>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700">
                        No Check-In
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
