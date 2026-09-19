'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { QrCode, CheckCircle2, Download, ShieldCheck, XCircle, Clock } from 'lucide-react';
import type { EventItem, EventRegistration } from '@/types/events';

export type TicketPassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  registration: EventRegistration | null;
  onCancelRegistration?: (eventId: string) => void;
};

export function TicketPassModal({
  isOpen,
  onClose,
  event,
  registration,
  onCancelRegistration,
}: TicketPassModalProps): React.ReactElement | null {
  if (!event || !registration) return null;

  const dateObj = new Date(event.scheduleDate + 'T00:00:00');
  const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        {/* Pass Header */}
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider text-[var(--uc-blue)] uppercase">
          <ShieldCheck className="h-4 w-4 text-[var(--uc-blue)]" />
          <span>Official Event Pass</span>
        </div>

        <h3 className="text-lg leading-snug font-black tracking-tight text-slate-900">
          {event.title}
        </h3>

        {/* Status Indicator Chip */}
        <div className="mt-2">
          {registration.status === 'confirmed' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Confirmed Registration
            </span>
          )}
          {registration.status === 'waitlisted' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              <Clock className="h-3.5 w-3.5 text-amber-600" /> Waitlisted Participant
            </span>
          )}
          {registration.status === 'pending' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              <Clock className="h-3.5 w-3.5 text-blue-600" /> Pending Review
            </span>
          )}
          {registration.status === 'cancelled' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-800">
              <XCircle className="h-3.5 w-3.5 text-red-600" /> Registration Cancelled
            </span>
          )}
        </div>

        {/* Digital Ticket Pass Stub */}
        <div className="relative mt-4 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Authentic QR Display Container */}
          <div className="mx-auto flex h-52 w-52 flex-col items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-950 p-4 shadow-md">
            <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-white p-2">
              <QrCode className="h-36 w-36 text-slate-950" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-md bg-slate-950 p-1 shadow-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-xs bg-[var(--uc-blue)] text-[10px] font-black text-white">
                    UC
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pass ID Token */}
          <div className="mt-4">
            <span className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs font-black tracking-widest text-slate-900">
              {registration.qrCodeToken}
            </span>
          </div>

          {/* Attendee Details Grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-left text-xs">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Attendee
              </span>
              <p className="leading-tight font-bold text-slate-900">{registration.studentName}</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                {registration.studentNumber}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Date & Time
              </span>
              <p className="font-bold text-slate-900">
                {month} {day}, 2026
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                {event.startTime} - {event.endTime}
              </p>
            </div>
          </div>

          {/* Verified Checked-In Banner if already scanned */}
          {registration.checkedIn && (
            <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Verified Entry: {registration.checkedInAt}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex w-full flex-col gap-2">
          <div className="flex w-full gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
              Done
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1 bg-slate-950 text-white hover:bg-slate-800"
              onClick={() => alert(`Saved digital ticket pass for ${registration.studentName}`)}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Save Pass
            </Button>
          </div>

          {/* Cancel Registration Option (Spec requirement: stored as cancelled, spot released) */}
          {!registration.checkedIn &&
            registration.status !== 'cancelled' &&
            onCancelRegistration && (
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to cancel your event registration? Your reserved spot will be released to other students.',
                    )
                  ) {
                    onCancelRegistration(event.id);
                  }
                }}
                className="mt-1 text-xs text-red-600 transition-colors hover:text-red-800 hover:underline"
              >
                Cancel Registration
              </button>
            )}
        </div>
      </div>
    </Modal>
  );
}
