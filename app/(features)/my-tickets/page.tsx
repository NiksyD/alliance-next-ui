'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { TicketPassModal } from '../events/components/TicketPassModal';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  Ticket,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { EventItem, EventRegistration } from '@/types/events';

export default function MyTicketsPage(): React.ReactElement {
  const currentUser = useAuthStore((s) => s.currentUser);
  const registrations = useEventStore((s) => s.registrations);
  const events = useEventStore((s) => s.events);

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedReg, setSelectedReg] = useState<EventRegistration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const myRegistrations = registrations.filter((r) => r.studentId === currentUser.id);

  const handleOpenModal = (reg: EventRegistration): void => {
    const event = events.find((e) => e.id === reg.eventId) || null;
    setSelectedEvent(event);
    setSelectedReg(reg);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Wallet Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-[11px] font-bold tracking-wider text-[var(--uc-blue)] uppercase">
              Digital Passbook
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              My Event Tickets
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Present these verified passes at the venue entrance scanner for instant check-in.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-bold text-slate-700 shadow-2xs">
              {myRegistrations.length} {myRegistrations.length === 1 ? 'Pass' : 'Passes'} Available
            </span>
          </div>
        </div>

        {/* Empty State */}
        {myRegistrations.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Ticket className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No active passes in your wallet
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-xs text-slate-500">
              You haven&apos;t registered for any student organization events yet. Claim passes from
              the campus directory.
            </p>
            <Link href="/events" className="mt-5 inline-block">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Browse Campus Events
              </Button>
            </Link>
          </div>
        ) : (
          /* High-Craft Ticket Stub Grid */
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {myRegistrations.map((reg) => {
              const event = events.find((e) => e.id === reg.eventId);
              if (!event) return null;

              const dateObj = new Date(event.scheduleDate + 'T00:00:00');
              const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
              const day = dateObj.getDate();

              return (
                <div
                  key={reg.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:shadow-md ${
                    reg.checkedIn
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Ticket Header & Metadata */}
                  <div className="p-6 pb-5">
                    {/* Top Row: Event Type & Live Gate Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-[var(--uc-blue-container)]/70 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[var(--uc-blue)] uppercase">
                        {event.type}
                      </span>

                      {reg.checkedIn ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          Ready for Scan
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 line-clamp-2 font-sans text-lg leading-snug font-bold tracking-tight text-slate-900">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Host: {event.organizer}
                    </p>

                    {/* Date & Location Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          Date & Schedule
                        </span>
                        <p className="mt-0.5 font-bold text-slate-800">
                          {month} {day}, 2026
                        </p>
                        <p className="font-mono text-[11px] text-slate-500">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          Venue Room
                        </span>
                        <p className="mt-0.5 truncate font-bold text-slate-800">
                          {event.venueName}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          Capacity: {event.participantLimit}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Perforated Tear Line with Semicircular Notches */}
                  <div className="relative flex items-center justify-between px-3">
                    <div className="-ml-5 h-4 w-4 rounded-full border-r border-slate-200 bg-slate-100" />
                    <div className="w-full border-t-2 border-dashed border-slate-200" />
                    <div className="-mr-5 h-4 w-4 rounded-full border-l border-slate-200 bg-slate-100" />
                  </div>

                  {/* Ticket Stub Footer: QR Quick-Display & Token */}
                  <div className="flex items-center justify-between gap-4 bg-slate-50/50 p-6 pt-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Pass Code ID
                      </span>
                      <p className="font-mono text-xs font-bold text-slate-900">
                        {reg.qrCodeToken}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Issued to: <strong className="text-slate-700">{reg.studentName}</strong>
                      </p>
                    </div>

                    {/* Expand Pass Button */}
                    <Button
                      variant={reg.checkedIn ? 'outline' : 'primary'}
                      size="sm"
                      className={`shrink-0 ${
                        !reg.checkedIn ? 'bg-slate-950 text-white hover:bg-slate-800' : ''
                      }`}
                      onClick={() => handleOpenModal(reg)}
                      leftIcon={<QrCode className="h-4 w-4" />}
                    >
                      {reg.checkedIn ? 'View Pass' : 'Show Full QR'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TicketPassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        registration={selectedReg}
      />
    </div>
  );
}
