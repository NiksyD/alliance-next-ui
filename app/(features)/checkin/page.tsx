'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import type { EventRegistration } from '@/types/events';
import Link from 'next/link';
import {
  QrCode,
  Search,
  AlertCircle,
  Clock,
  Camera,
  RotateCcw,
  UserCheck,
  X,
  Check,
  TrendingUp,
} from 'lucide-react';

type VerificationResult = {
  status: 'success' | 'already' | 'not_found';
  message: string;
  registration?: EventRegistration;
  timestamp: string;
};

export default function CheckInDeskPage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const registrations = useEventStore((s) => s.registrations);
  const attendanceLogs = useEventStore((s) => s.attendanceLogs);
  const recordCheckIn = useEventStore((s) => s.recordCheckIn);
  const undoCheckIn = useEventStore((s) => s.undoCheckIn);
  const currentUser = useAuthStore((s) => s.currentUser);

  // Active event selection
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Unified Search / Scan input
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Camera scanner drawer state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Door Roster filter state: 'all' | 'pending' | 'checked_in'
  const [rosterFilter, setRosterFilter] = useState<'all' | 'pending' | 'checked_in'>('all');

  // Performance Windowing: progressive loading for high-volume rosters (1,000+ attendees)
  const [visibleLimit, setVisibleLimit] = useState<number>(50);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Filter registrations for active event
  const eventRegistrations = useMemo(() => {
    return registrations.filter((r) => r.eventId === selectedEventId);
  }, [registrations, selectedEventId]);

  const checkedInCount = eventRegistrations.filter((r) => r.checkedIn).length;
  const remainingCount = eventRegistrations.length - checkedInCount;
  const attendancePercentage =
    eventRegistrations.length > 0
      ? Math.round((checkedInCount / eventRegistrations.length) * 100)
      : 0;

  // Active event logs and rolling 5-scan buffer
  const activeEventLogs = useMemo(() => {
    return attendanceLogs.filter((l) => l.eventId === selectedEventId);
  }, [attendanceLogs, selectedEventId]);

  const recentLogs = useMemo(() => {
    return activeEventLogs.slice(0, 5);
  }, [activeEventLogs]);

  const myScansCount = useMemo(() => {
    return activeEventLogs.filter((l) => l.verifiedBy.includes(currentUser.name)).length;
  }, [activeEventLogs, currentUser.name]);

  // Filtered Door Roster: reactive to both status tab AND the unified search input
  const filteredRoster = useMemo(() => {
    return eventRegistrations.filter((reg) => {
      if (rosterFilter === 'pending' && reg.checkedIn) return false;
      if (rosterFilter === 'checked_in' && !reg.checkedIn) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          reg.studentName.toLowerCase().includes(q) ||
          reg.studentNumber.toLowerCase().includes(q) ||
          reg.courseAndYear.toLowerCase().includes(q) ||
          reg.qrCodeToken.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [eventRegistrations, rosterFilter, searchTerm]);

  // Reset scroll position when search, filter, or event changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [rosterFilter, searchTerm, selectedEventId]);

  // Windowed slice of filtered roster to keep DOM node count low and maintain 60 FPS
  const visibleRoster = useMemo(() => {
    return filteredRoster.slice(0, visibleLimit);
  }, [filteredRoster, visibleLimit]);

  const handleScrollRoster = (e: React.UIEvent<HTMLDivElement>): void => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (visibleLimit < filteredRoster.length) {
        setVisibleLimit((prev) => Math.min(prev + 50, filteredRoster.length));
      }
    }
  };

  // Handle Check-in processing
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

    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    if (result.success && result.record) {
      setVerificationResult({
        status: 'success',
        message: result.message,
        registration: result.record,
        timestamp: now,
      });
      setSearchTerm('');
    } else {
      const isAlready = result.message.includes('ALREADY');
      setVerificationResult({
        status: isAlready ? 'already' : 'not_found',
        message: result.message,
        registration: result.record,
        timestamp: now,
      });
    }

    // Refocus input for continuous operator scanning
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Quick 1-click Check-in from Door Roster
  const handleRosterCheckIn = (reg: EventRegistration): void => {
    handleProcessCheckIn(reg.studentNumber, 'MANUAL_SEARCH');
  };

  // Undo check-in action
  const handleUndo = (registrationId: string): void => {
    undoCheckIn(registrationId);
    if (verificationResult?.registration?.id === registrationId) {
      setVerificationResult(null);
    }
  };

  // Camera stream handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    if (cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          if (!isMounted) {
            s.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
            setCameraError(null);
          }
        })
        .catch((err: Error) => {
          if (!isMounted) return;
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Camera access permission was denied by browser.'
              : 'No compatible camera found on this device.',
          );
        });
    }

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Keyboard shortcut listener (Esc to dismiss verification or clear search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (verificationResult) {
          setVerificationResult(null);
        } else if (searchTerm) {
          setSearchTerm('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [verificationResult, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Header & Event Selector */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="live" pulse>
              LIVE GATE DESK
            </Badge>
            <span className="font-mono text-xs text-slate-500">Fast-Pass Attendance Terminal</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Door Check-In Desk
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            High-speed barcode, QR pass scanning, and verified door guest list management.
          </p>
        </div>

        {/* Active Event Selector */}
        <div className="w-full sm:w-96">
          <Dropdown
            value={selectedEventId}
            onChange={(val) => {
              setSelectedEventId(val);
              setVerificationResult(null);
              setSearchTerm('');
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

      {/* Operational Metrics Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Total Registered
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="font-mono text-2xl font-extrabold text-slate-900">
              {eventRegistrations.length}
            </p>
            <span className="text-xs text-slate-400">Passes Issued</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
            Inside Venue
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="font-mono text-2xl font-extrabold text-emerald-700">{checkedInCount}</p>
            <span className="font-mono text-xs font-bold text-emerald-600">
              {attendancePercentage}% Turnout
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Awaiting Arrival
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="font-mono text-2xl font-extrabold text-slate-700">{remainingCount}</p>
            <span className="text-xs text-slate-400">Pending Door</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Venue & Capacity
          </span>
          <p className="mt-1 truncate text-xs font-bold text-slate-800 sm:text-sm">
            {activeEvent?.venueName || 'Main Hall'}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[var(--uc-blue)] transition-all duration-500"
              style={{ width: `${Math.min(100, attendancePercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Operational Split Screen */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Unified Check-In Station & Attendee Roster (8 Cols) */}
        <div className="space-y-6 xl:col-span-8">
          <Card className="overflow-hidden p-0">
            {/* Unified Station Command Deck */}
            <div className="border-b border-slate-100 bg-white p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--uc-blue-container)] text-[var(--uc-blue-deep)]">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Attendee Door Roster</h2>
                    <p className="text-xs text-slate-500">
                      Scan barcodes, enter student IDs, or search guest list
                    </p>
                  </div>
                </div>

                {/* Camera Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setCameraActive((prev) => !prev);
                    setCameraError(null);
                  }}
                  className={`inline-flex items-center gap-1.5 self-start rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all sm:self-auto ${
                    cameraActive
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5 text-slate-500" />
                  {cameraActive ? 'Close Camera' : 'Camera Scanner'}
                </button>
              </div>

              {/* Single Omni Search & Scan Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcessCheckIn(searchTerm, 'QR_SCAN');
                }}
                className="mt-4"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <input
                      ref={inputRef}
                      autoFocus
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setVisibleLimit(50);
                      }}
                      placeholder="Search attendee name, student #, or scan pass token..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-9 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--uc-blue)] focus:ring-2 focus:ring-[var(--uc-blue)]/20 focus:outline-none"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setVisibleLimit(50);
                          inputRef.current?.focus();
                        }}
                        className="absolute top-2.5 right-2.5 rounded p-0.5 text-slate-400 hover:text-slate-600"
                        title="Clear input"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!searchTerm.trim()}
                    className="shrink-0 px-4 text-xs font-semibold"
                  >
                    Check In
                  </Button>
                </div>
              </form>
            </div>

            {/* Expandable Camera Viewfinder */}
            {cameraActive && (
              <div className="relative border-b border-slate-800 bg-slate-950 p-4 text-white">
                <div className="mx-auto flex max-w-sm flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-black p-3">
                  {!cameraError ? (
                    <div className="relative flex h-48 w-full items-center justify-center">
                      <video
                        ref={videoRef}
                        className="h-full w-full rounded-lg object-cover"
                        playsInline
                        muted
                      />
                      {/* Viewfinder Target Framing */}
                      <div className="pointer-events-none absolute h-36 w-36 rounded-xl border-2 border-[var(--uc-gold)]/80">
                        <div className="absolute -top-1 -left-1 h-3.5 w-3.5 border-t-2 border-l-2 border-[var(--uc-gold)]" />
                        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 border-t-2 border-r-2 border-[var(--uc-gold)]" />
                        <div className="absolute -bottom-1 -left-1 h-3.5 w-3.5 border-b-2 border-l-2 border-[var(--uc-gold)]" />
                        <div className="absolute -right-1 -bottom-1 h-3.5 w-3.5 border-r-2 border-b-2 border-[var(--uc-gold)]" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <Camera className="mx-auto h-8 w-8 text-slate-600" />
                      <p className="mt-2 text-xs font-semibold text-slate-300">{cameraError}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setCameraActive(false)}
                    className="mt-2 text-[11px] text-slate-400 hover:text-white"
                  >
                    Hide Camera Viewfinder
                  </button>
                </div>
              </div>
            )}

            {/* Instant Verification Feedback Banner */}
            {verificationResult && (
              <div
                className={`border-b p-4 transition-all duration-200 ${
                  verificationResult.status === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    : verificationResult.status === 'already'
                      ? 'border-amber-200 bg-amber-50 text-amber-950'
                      : 'border-red-200 bg-red-50 text-red-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {verificationResult.status === 'success' ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-xs ${
                          verificationResult.status === 'already' ? 'bg-amber-600' : 'bg-red-600'
                        }`}
                      >
                        <AlertCircle className="h-4 w-4 stroke-[2.5]" />
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`py-0.2 inline-block rounded px-1.5 text-[10px] font-extrabold tracking-wide uppercase ${
                            verificationResult.status === 'success'
                              ? 'bg-emerald-200/80 text-emerald-900'
                              : verificationResult.status === 'already'
                                ? 'bg-amber-200/80 text-amber-900'
                                : 'bg-red-200/80 text-red-900'
                          }`}
                        >
                          {verificationResult.status === 'success'
                            ? 'Verified & Admitted'
                            : verificationResult.status === 'already'
                              ? 'Duplicate Entry Attempt'
                              : 'Check-In Declined'}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {verificationResult.timestamp}
                        </span>
                      </div>

                      {verificationResult.registration ? (
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {verificationResult.registration.studentName}
                          </h3>
                          <p className="text-xs text-slate-600">
                            <span className="font-mono font-semibold">
                              {verificationResult.registration.studentNumber}
                            </span>{' '}
                            • {verificationResult.registration.courseAndYear}
                          </p>
                          {verificationResult.status === 'already' && (
                            <p className="mt-0.5 text-xs font-semibold text-amber-900">
                              Previously admitted at{' '}
                              <span className="font-mono">
                                {verificationResult.registration.checkedInAt}
                              </span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-red-800">
                          {verificationResult.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Undo / Dismiss */}
                  <div className="flex items-center gap-1.5">
                    {verificationResult.status === 'success' && verificationResult.registration && (
                      <button
                        type="button"
                        onClick={() => handleUndo(verificationResult.registration!.id)}
                        className="flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Undo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setVerificationResult(null)}
                      className="rounded-md p-1 text-slate-400 hover:bg-black/5 hover:text-slate-600"
                      title="Dismiss notification (Esc)"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Roster Table Toolbar: Horizontal Segmented Filter Tabs & Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5">
              {/* Clean Horizontal Tabs (Prevents vertical squishing) */}
              <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setRosterFilter('all');
                    setVisibleLimit(50);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 whitespace-nowrap transition-all ${
                    rosterFilter === 'all'
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
                    setRosterFilter('pending');
                    setVisibleLimit(50);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 whitespace-nowrap transition-all ${
                    rosterFilter === 'pending'
                      ? 'bg-white font-bold text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending Gate
                  <span className="py-0.2 rounded-full bg-amber-100 px-1.5 font-mono text-[10px] font-bold text-amber-800">
                    {remainingCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRosterFilter('checked_in');
                    setVisibleLimit(50);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 whitespace-nowrap transition-all ${
                    rosterFilter === 'checked_in'
                      ? 'bg-white font-bold text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admitted Inside
                  <span className="py-0.2 rounded-full bg-emerald-100 px-1.5 font-mono text-[10px] font-bold text-emerald-800">
                    {checkedInCount}
                  </span>
                </button>
              </div>

              <span className="text-[11px] font-medium text-slate-500">
                Showing <strong className="text-slate-800">{filteredRoster.length}</strong> of{' '}
                {eventRegistrations.length}
              </span>
            </div>

            {/* Attendee Roster Rows (Windowed DOM rendering for high-scale performance) */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScrollRoster}
              className="max-h-[440px] divide-y divide-slate-100 overflow-y-auto"
            >
              {filteredRoster.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  {searchTerm
                    ? `No registered attendees match "${searchTerm}".`
                    : 'No attendees found in this filter.'}
                </div>
              ) : (
                <>
                  {visibleRoster.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50/70"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Initials Avatar */}
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            reg.checkedIn
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[var(--uc-blue-container)] text-[var(--uc-blue-deep)]'
                          }`}
                        >
                          {reg.studentName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {reg.studentName}
                            </p>
                            {reg.checkedIn ? (
                              <span className="py-0.2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 font-mono text-[10px] font-bold text-emerald-700">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                                Inside
                              </span>
                            ) : (
                              <span className="py-0.2 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 font-mono text-[10px] font-medium text-slate-500">
                                Pending
                              </span>
                            )}
                          </div>

                          <p className="truncate text-[11px] text-slate-500">
                            <span className="font-mono font-semibold text-slate-700">
                              {reg.studentNumber}
                            </span>{' '}
                            • {reg.courseAndYear}
                          </p>
                        </div>
                      </div>

                      {/* Action: Refined 1-Click Check In or Quiet Undo */}
                      <div className="shrink-0 pl-3">
                        {reg.checkedIn ? (
                          <button
                            type="button"
                            onClick={() => handleUndo(reg.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
                            title="Revert check-in status"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Undo</span>
                          </button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRosterCheckIn(reg)}
                            className="h-8 px-3.5 text-xs font-semibold whitespace-nowrap shadow-2xs"
                          >
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Windowing Footer when roster is large (> visibleLimit) */}
                  {visibleLimit < filteredRoster.length && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500">
                      <span>
                        Showing first <strong>{visibleLimit}</strong> of{' '}
                        <strong>{filteredRoster.length}</strong> loaded attendees
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleLimit((prev) => Math.min(prev + 100, filteredRoster.length))
                        }
                        className="font-semibold text-[var(--uc-blue)] hover:underline"
                      >
                        Load Next 100 ↓
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Gate Operations HUD & Rolling Admissions (4 Cols) */}
        <div className="space-y-6 xl:col-span-4">
          {/* Shift Gate Summary */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--uc-blue)]" />
                <h3 className="text-sm font-bold text-slate-900">Shift Gate Velocity</h3>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                Live
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Inside / Total Registered</span>
                <span className="font-mono font-bold text-slate-900">
                  {checkedInCount} of {eventRegistrations.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[var(--uc-blue)] transition-all duration-500"
                  style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100/80 pt-2 text-[11px] text-slate-500">
                <span>Verified by you</span>
                <span className="font-mono font-bold text-[var(--uc-blue-deep)]">
                  {myScansCount} attendees
                </span>
              </div>
            </div>
          </Card>

          {/* Rolling Buffer: Recent Admissions (Max 5) */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--uc-blue)]" />
                <h3 className="text-sm font-bold text-slate-900">Recent Admissions</h3>
              </div>
              <span className="font-mono text-[10px] font-semibold text-slate-400">
                Rolling 5 of {activeEventLogs.length}
              </span>
            </div>

            {/* Rolling Feed List */}
            <div className="mt-3 space-y-2">
              {recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <UserCheck className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-2 font-medium">No admissions recorded yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Latest 5 verified scans will stream here.
                  </p>
                </div>
              ) : (
                recentLogs.map((log) => {
                  const reg = eventRegistrations.find((r) => r.studentNumber === log.studentNumber);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 text-xs transition-all hover:border-slate-300 hover:bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-bold text-slate-900">
                            {log.studentName}
                          </span>
                          <span className="py-0.2 shrink-0 rounded bg-slate-100 px-1.5 font-mono text-[10px] text-slate-500">
                            {log.timestamp.slice(11, 16)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-1 text-[10px] text-slate-500">
                          <span className="truncate font-mono">{log.studentNumber}</span>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase">
                            {log.method.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {reg && (
                        <button
                          type="button"
                          onClick={() => handleUndo(reg.id)}
                          className="shrink-0 rounded px-1.5 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                          title="Revert check-in"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {activeEventLogs.length > 0 && (
              <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                <span>Capped at 5 entries</span>
                <Link
                  href="/dashboard/reports"
                  className="font-semibold text-[var(--uc-blue)] hover:underline"
                >
                  Full Reports →
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
