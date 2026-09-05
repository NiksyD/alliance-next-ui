'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '@/stores/eventStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, MapPin, Users, Award, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { EventType } from '@/types/events';

export default function CreateEventPage(): React.ReactElement {
  const router = useRouter();
  const eventTypes = useEventStore((s) => s.eventTypes);
  const venues = useEventStore((s) => s.venues);
  const createEvent = useEventStore((s) => s.createEvent);

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
  const [organizer, setOrganizer] = useState('Alliance Student Committee');

  const selectedVenue = venues.find((v) => v.id === venueId);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!title.trim() || !venueId) return;

    createEvent({
      title,
      description,
      type,
      venueId,
      venueName: selectedVenue?.name || 'TBD',
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
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/events"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Event Catalog
        </Link>

        <div className="border-b border-slate-200 pb-6">
          <Badge variant="primary">Transaction Form</Badge>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Create & Post Event
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure event details, validate venue room capacity, and publish registration slots.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <Card className="space-y-5 p-6">
            <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              1. Event Overview & Classification
            </h2>

            <Input
              label="Event Title *"
              placeholder="e.g. Alliance HackFest 2026: Campus Solutions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase">
                Detailed Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--uc-blue)] focus:ring-2 focus:ring-[var(--uc-blue)]/20 focus:outline-none"
                placeholder="Explain the objectives, expected speakers, and agenda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase">
                  Event Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-800 shadow-xs focus:border-[var(--uc-blue)] focus:ring-2 focus:ring-[var(--uc-blue)]/20 focus:outline-none"
                >
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Host Committee / Organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              2. Venue & Room Scheduling
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-700 uppercase">
                Designated Campus Venue *
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-800 shadow-xs focus:border-[var(--uc-blue)] focus:ring-2 focus:ring-[var(--uc-blue)]/20 focus:outline-none"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.roomNumber}) — Max Capacity: {v.capacity} pax
                  </option>
                ))}
              </select>
            </div>

            {selectedVenue && (
              <div className="flex items-start justify-between rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900">
                <div>
                  <span className="font-bold">{selectedVenue.location}</span>
                  <p className="mt-0.5 text-[11px] text-blue-700">
                    {selectedVenue.availabilityNotes}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs font-bold text-[var(--uc-blue-deep)]">
                  Cap: {selectedVenue.capacity}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                type="date"
                label="Event Date"
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
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              3. Registration Rules & Certificate Criteria
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                type="number"
                label="Participant Limit (Capacity)"
                value={participantLimit}
                onChange={(e) => setParticipantLimit(Number(e.target.value))}
                min={1}
                max={selectedVenue?.capacity || 1000}
                required
              />

              <Input
                label="Registration Deadline"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                required
              />
            </div>

            <div className="pt-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={certificateEligible}
                  onChange={(e) => setCertificateEligible(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded-sm text-[var(--uc-blue)] focus:ring-[var(--uc-blue)]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Enable Certificate of Participation Eligibility
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Attendees who successfully check in at the door desk will be auto-marked as
                    certificate eligible.
                  </p>
                </div>
              </label>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/events">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" leftIcon={<CheckCircle className="h-4 w-4" />}>
              Publish Event to Members
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
