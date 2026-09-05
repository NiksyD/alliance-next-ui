'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { MapPin, Clock, ArrowUpRight, CheckCircle2, Ticket } from 'lucide-react';
import type { EventItem } from '@/types/events';

export type EventCardProps = {
  event: EventItem;
  hasPass?: boolean;
  onClaimPass?: (event: EventItem) => void;
  onViewTicket?: (event: EventItem) => void;
};

export function EventCard({
  event,
  hasPass = false,
  onClaimPass,
  onViewTicket,
}: EventCardProps): React.ReactElement {
  const percentFull = Math.min(
    100,
    Math.round((event.registeredCount / event.participantLimit) * 100),
  );
  const isFull = event.registeredCount >= event.participantLimit;

  // Format date parts (e.g. "2026-09-12" -> Month "SEP", Day "12")
  const dateObj = new Date(event.scheduleDate + 'T00:00:00');
  const monthStr = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dayStr = dateObj.getDate();

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      <div>
        {/* Top Header: Date Tile + Category & Availability */}
        <div className="flex items-start justify-between gap-4">
          {/* Calendar Anchor Tile */}
          <div className="flex h-13 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-mono shadow-2xs transition-colors group-hover:border-[var(--uc-blue-light)]">
            <span className="text-[10px] leading-none font-bold text-[var(--uc-blue)]">
              {monthStr}
            </span>
            <span className="text-lg leading-tight font-black text-slate-900">{dayStr}</span>
          </div>

          {/* Minimalist Status Signals */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 text-right">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {event.type}
            </span>
            {isFull ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                Waitlist
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {event.participantLimit - event.registeredCount} spots left
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <h3 className="line-clamp-2 font-sans text-base leading-snug font-bold tracking-tight text-slate-900 transition-colors group-hover:text-[var(--uc-blue)]">
            {event.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {event.description}
          </p>
        </div>

        {/* Metadata List */}
        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="font-medium text-slate-700">
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate text-slate-600">{event.venueName}</span>
          </div>
        </div>
      </div>

      {/* Footer: Capacity + Action */}
      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {/* Capacity Hairline Meter */}
        <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-slate-500">
          <span>Capacity Filled</span>
          <span className="font-bold text-slate-700">
            {event.registeredCount}/{event.participantLimit} ({percentFull}%)
          </span>
        </div>
        <div className="mb-3.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFull ? 'bg-amber-500' : 'bg-slate-800'
            }`}
            style={{ width: `${percentFull}%` }}
          />
        </div>

        {/* Action Button */}
        {hasPass ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-emerald-300 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100/70"
            onClick={() => onViewTicket?.(event)}
            leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
          >
            Pass Confirmed • View Ticket
          </Button>
        ) : (
          <Button
            variant={isFull ? 'outline' : 'primary'}
            size="sm"
            className={`w-full ${
              !isFull
                ? 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => onClaimPass?.(event)}
            rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
          >
            {isFull ? 'Join Waitlist' : 'Claim Free Pass'}
          </Button>
        )}
      </div>
    </div>
  );
}
