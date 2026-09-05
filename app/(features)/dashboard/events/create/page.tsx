'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEventStore } from '@/stores/eventStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  CalendarCheck,
  Eye,
} from 'lucide-react';
import type { EventType } from '@/types/events';

export default function CreateEventPage(): React.ReactElement {
  const router = useRouter();
  const eventTypes = useEventStore((s) => s.eventTypes);
  const venues = useEventStore((s) => s.venues);
  const createEvent = useEventStore((s) => s.createEvent);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('Workshop');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [scheduleDate, setScheduleDate] = useState('2026-09-30');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('16:00');
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-09-29 23:59');
  const [participantLimit, setParticipantLimit] = useState(100);
  const [certificateEligible, setCertificateEligible] = useState(true);
  const [organizer, setOrganizer] = useState('Alliance Student Council');

  const selectedVenue = venues.find((v) => v.id === venueId) || venues[0];
  const isOverCapacity = participantLimit > (selectedVenue?.capacity || 0);

  // Computed Date for Preview
  const dateObj = new Date(scheduleDate + 'T00:00:00');
  const monthStr = isNaN(dateObj.getTime())
    ? 'TBD'
    : dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dayStr = isNaN(dateObj.getTime()) ? '--' : dateObj.getDate();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!title.trim()) return;

    createEvent({
      title,
      description,
      type,
      venueId,
      venueName: selectedVenue ? `${selectedVenue.name} (${selectedVenue.roomNumber})` : 'TBD',
      scheduleDate,
      startTime,
      endTime,
      registrationDeadline,
      participantLimit: Number(participantLimit),
      status: 'Published',
      organizer,
      certificateEligible,
    });

    router.push('/events');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Create & Publish Event
            </h1>
            <p className="text-xs text-slate-500">
              Set event parameters, validate room capacity, and publish to campus roster.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/events">
            <Button variant="outline" size="sm">
              Discard
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim() || isOverCapacity}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            Publish Event
          </Button>
        </div>
      </div>

      {/* 2-Column Creator Studio Layout (Jakob's Law: Form Left + Live Preview Right) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Form Column (7 Cols) */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-7">
          {/* Section 1: Core Details */}
          <div className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alliance Annual Hackathon: Campus Solutions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-b-2 border-slate-200 pb-2 text-lg font-bold tracking-tight text-slate-900 transition-colors placeholder:text-slate-300 focus:border-[var(--uc-blue)] focus:outline-none sm:text-xl"
              />
            </div>

            {/* Event Category Interactive Selector */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                Event Classification *
              </label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((t) => {
                  const isSelected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[var(--uc-blue)] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
                Summary / Objectives
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe the topics covered, guest speakers, and eligibility..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-xs text-slate-900 transition-all placeholder:text-slate-400 focus:border-[var(--uc-blue)] focus:ring-2 focus:ring-[var(--uc-blue)]/20 focus:outline-none sm:text-sm"
              />
            </div>

            {/* Organizer */}
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                Host Committee / Student Org
              </label>
              <Input
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. Alliance Computer Society"
              />
            </div>
          </div>

          {/* Section 2: Date, Time & Venue Scheduling */}
          <div className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold tracking-wider text-slate-900 uppercase">
              <CalendarCheck className="h-4 w-4 text-[var(--uc-blue)]" /> Venue & Scheduling
            </h2>

            {/* Venue Selector */}
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                Select Campus Venue *
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {venues.map((v) => {
                  const isSelected = venueId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVenueId(v.id)}
                      className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-[var(--uc-blue)] bg-[var(--uc-blue-container)]/30 ring-2 ring-[var(--uc-blue)]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-[var(--uc-blue-deep)]">
                          {v.roomNumber}
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-slate-400">
                          Cap: {v.capacity}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs leading-snug font-bold text-slate-800">
                        {v.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Inputs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                type="date"
                label="Date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                required
              />
              <Input
                type="time"
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <Input
                type="time"
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 3: Capacity & Certificate Automation */}
          <div className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold tracking-wider text-slate-900 uppercase">
              <Users className="h-4 w-4 text-[var(--uc-gold-deep)]" /> Capacity & Ticketing Rules
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  type="number"
                  label="Target Attendance Cap *"
                  min={1}
                  value={participantLimit}
                  onChange={(e) => setParticipantLimit(Number(e.target.value))}
                  error={
                    isOverCapacity
                      ? `Exceeds room capacity (${selectedVenue?.capacity} pax)`
                      : undefined
                  }
                  helperText={
                    !isOverCapacity
                      ? `Max safe capacity: ${selectedVenue?.capacity} seats`
                      : undefined
                  }
                  required
                />
              </div>

              <div>
                <Input
                  label="Registration Deadline"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm"
                />
              </div>
            </div>

            {/* Certificate Toggle */}
            <div className="border-t border-slate-100 pt-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={certificateEligible}
                  onChange={(e) => setCertificateEligible(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded-sm text-[var(--uc-blue)] focus:ring-[var(--uc-blue)]"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Award className="h-3.5 w-3.5 text-[var(--uc-gold-deep)]" />
                    Automatic Participation Certificate Eligibility
                  </span>
                  <p className="mt-0.5 text-[11px] leading-normal text-slate-500">
                    Students verified at the door scanner will be automatically granted eligibility
                    for certificates.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Right Preview Column: Live Event Card Preview (5 Cols, Sticky) */}
        <div className="sticky top-24 space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between pb-1">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
              <Eye className="h-3.5 w-3.5" /> Live Student View Preview
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500">
              Updates in Real-Time
            </span>
          </div>

          {/* Live Rendered Event Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            {/* Top Date Tile & Category */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-13 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-mono shadow-2xs">
                <span className="text-[10px] leading-none font-bold text-[var(--uc-blue)]">
                  {monthStr}
                </span>
                <span className="text-lg leading-tight font-black text-slate-900">{dayStr}</span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-1.5 text-right">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {type}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {participantLimit} spots open
                </span>
              </div>
            </div>

            {/* Event Title */}
            <div className="mt-4">
              <h3 className="line-clamp-2 font-sans text-base leading-snug font-bold tracking-tight text-slate-900">
                {title || 'Untitled Campus Event'}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                {description || 'Event description will appear here as you type...'}
              </p>
            </div>

            {/* Metadata */}
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="font-medium text-slate-700">
                  {startTime} - {endTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate text-slate-600">
                  {selectedVenue?.name} ({selectedVenue?.roomNumber})
                </span>
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="mt-5 border-t border-slate-100 pt-3.5">
              <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-slate-500">
                <span>Registration Limit</span>
                <span className="font-bold text-slate-800">0 / {participantLimit} (0%)</span>
              </div>
              <div className="h-1 w-full rounded-full bg-slate-100" />
            </div>

            {/* Simulated Action Button */}
            <div className="mt-4">
              <div className="w-full rounded-lg bg-slate-900 py-2 text-center text-xs font-bold text-white shadow-xs">
                Claim Free Pass ↗
              </div>
            </div>
          </div>

          {/* Capacity Safeguard Notice */}
          {selectedVenue && (
            <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Building2 className="h-4 w-4 text-[var(--uc-blue)]" />
                <span>Venue Specification: {selectedVenue.roomNumber}</span>
              </div>
              <p className="text-[11px] text-slate-500">{selectedVenue.location}</p>
              <p className="font-mono text-[11px] text-slate-500">
                Physical Capacity Limit: <strong>{selectedVenue.capacity} attendees</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
