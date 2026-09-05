'use client';

import React, { useState } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Zap,
  Building2,
} from 'lucide-react';

export default function CheckInDeskPage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const registrations = useEventStore((s) => s.registrations);
  const attendanceLogs = useEventStore((s) => s.attendanceLogs);
  const recordCheckIn = useEventStore((s) => s.recordCheckIn);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [inputToken, setInputToken] = useState('');
  const [feedback, setFeedback] = useState<{
    status: 'success' | 'error' | 'already';
    message: string;
    studentName?: string;
  } | null>(null);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const eventRegistrations = registrations.filter((r) => r.eventId === selectedEventId);
  const checkedInCount = eventRegistrations.filter((r) => r.checkedIn).length;
  const attendancePercentage =
    eventRegistrations.length > 0
      ? Math.round((checkedInCount / eventRegistrations.length) * 100)
      : 0;

  const handleProcessCheckIn = (
    identifier: string,
    method: 'QR_SCAN' | 'MANUAL_SEARCH' | 'STUDENT_NUMBER',
  ): void => {
    if (!identifier.trim()) return;

    const result = recordCheckIn(
      identifier,
      selectedEventId,
      method,
      `${currentUser.name} (${currentUser.role})`,
    );

    if (result.success) {
      setFeedback({
        status: 'success',
        message: result.message,
        studentName: result.record?.studentName,
      });
      setInputToken('');
    } else {
      const isAlready = result.message.includes('ALREADY');
      setFeedback({
        status: isAlready ? 'already' : 'error',
        message: result.message,
        studentName: result.record?.studentName,
      });
    }

    setTimeout(() => {
      setFeedback((prev) => (prev?.message === result.message ? null : prev));
    }, 5000);
  };

  const handleSimulateScan = (qrCode: string): void => {
    setInputToken(qrCode);
    handleProcessCheckIn(qrCode, 'QR_SCAN');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Header & Event Selector */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="live" pulse>
                LIVE DESK
              </Badge>
              <span className="font-mono text-xs text-slate-500">Gate Scanner v2.4</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Attendance Check-In HUD
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Scan attendee QR codes, search student numbers, and track real-time venue occupancy.
            </p>
          </div>

          {/* Active Event Selector */}
          <div className="w-full md:w-80">
            <label className="mb-1 block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Active Door Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-[var(--uc-blue)] focus:ring-2 focus:ring-[var(--uc-blue)]/20 focus:outline-none"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.scheduleDate})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-Time Live Metrics Ribbon */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Total Registrations
            </span>
            <p className="mt-1 font-mono text-2xl font-extrabold text-slate-900">
              {eventRegistrations.length}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <span className="text-[11px] font-semibold tracking-wider text-emerald-800 uppercase">
              Verified Inside Venue
            </span>
            <p className="mt-1 font-mono text-2xl font-extrabold text-emerald-700">
              {checkedInCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Current Turnout Rate
            </span>
            <p className="mt-1 font-mono text-2xl font-extrabold text-[var(--uc-blue-deep)]">
              {attendancePercentage}%
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Venue Room
            </span>
            <p className="mt-1 truncate text-sm font-bold text-slate-800">
              {activeEvent?.venueName || 'Main Auditorium'}
            </p>
          </div>
        </div>

        {/* Main Operational Split Screen */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: QR Scan HUD & Manual Entry (7 Cols) */}
          <div className="space-y-6 lg:col-span-7">
            <Card className="p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--uc-blue-container)] font-bold text-[var(--uc-blue-deep)]">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      High-Velocity Door Scanner
                    </h2>
                    <p className="text-xs text-slate-500">
                      Camera feed simulation with instant validation pulse
                    </p>
                  </div>
                </div>
                <Badge variant="verified">Audio / Visual Feedback</Badge>
              </div>

              {/* Animated QR Scanner Viewport HUD */}
              <div className="relative mt-5 flex min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 p-8 text-center text-white shadow-xl">
                {/* Visual Target Brackets */}
                <div className="relative flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-700/80">
                  {/* Corner Accent Brackets */}
                  <div className="absolute -top-1.5 -left-1.5 h-6 w-6 rounded-tl-sm border-t-4 border-l-4 border-[var(--uc-gold)]" />
                  <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-tr-sm border-t-4 border-r-4 border-[var(--uc-gold)]" />
                  <div className="absolute -bottom-1.5 -left-1.5 h-6 w-6 rounded-bl-sm border-b-4 border-l-4 border-[var(--uc-gold)]" />
                  <div className="absolute -right-1.5 -bottom-1.5 h-6 w-6 rounded-br-sm border-r-4 border-b-4 border-[var(--uc-gold)]" />

                  {/* Scanning sweep laser line */}
                  <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-linear-to-r from-transparent via-[var(--uc-gold)] to-transparent shadow-[0_0_12px_var(--uc-gold)]" />

                  <QrCode className="h-28 w-28 text-slate-700 opacity-60" />
                </div>

                <p className="mt-4 font-mono text-xs tracking-wider text-slate-400">
                  READY TO SCAN • ALIGN QR PASS WITHIN FRAME
                </p>
              </div>

              {/* Instant Verification Feedback Overlay */}
              {feedback && (
                <div
                  className={`mt-4 flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition-all ${
                    feedback.status === 'success'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : feedback.status === 'already'
                        ? 'border-amber-300 bg-amber-50 text-amber-900'
                        : 'border-red-300 bg-red-50 text-red-900'
                  }`}
                >
                  {feedback.status === 'success' ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
                  )}
                  <div>
                    <p className="font-bold">{feedback.message}</p>
                    {feedback.studentName && (
                      <p className="mt-0.5 text-xs opacity-80">Attendee: {feedback.studentName}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Input Search & Fast-Simulate Bar */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProcessCheckIn(inputToken, 'STUDENT_NUMBER');
                  }}
                  className="space-y-3"
                >
                  <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase">
                    Manual Student Number or Pass Token Entry
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. 2024-10842 or UC-TKT-2024-10842-101"
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                      className="font-mono"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      className="shrink-0"
                      disabled={!inputToken.trim()}
                    >
                      Verify Pass
                    </Button>
                  </div>
                </form>

                {/* Quick Simulation Clickers for Demo / Evaluation */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Quick-Scan Simulation Roster:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {eventRegistrations.map((reg) => (
                      <button
                        key={reg.id}
                        onClick={() => handleSimulateScan(reg.qrCodeToken)}
                        className={`cursor-pointer rounded-md border px-2.5 py-1 font-mono text-xs transition-all ${
                          reg.checkedIn
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-[var(--uc-blue)]'
                        }`}
                      >
                        {reg.checkedIn ? '✓ ' : '⚡ '}
                        {reg.studentName} ({reg.studentNumber})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Live Timestamped Activity Log (5 Cols) */}
          <div className="lg:col-span-5">
            <Card className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--uc-blue)]" />
                  <h3 className="text-base font-bold text-slate-900">Live Check-In Feed</h3>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-500">
                  {attendanceLogs.length} verified
                </span>
              </div>

              {/* Logs Stream */}
              <div className="mt-4 max-h-[500px] flex-1 space-y-2.5 overflow-y-auto pr-1">
                {attendanceLogs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No attendees checked in yet today.
                  </div>
                ) : (
                  attendanceLogs.map((log) => (
                    <div
                      key={log.id}
                      className="space-y-1 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.studentName}</span>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
                          {log.timestamp.slice(11)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono">{log.studentNumber}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          via {log.method.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-slate-400">
                        Verified by {log.verifiedBy}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
