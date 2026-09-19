'use client';

import React from 'react';
import Link from 'next/link';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { EventCard } from './(features)/events/components/EventCard';
import { Button } from '@/components/ui/Button';
import {
  CalendarDays,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const currentUser = useAuthStore((s) => s.currentUser);
  const registrations = useEventStore((s) => s.registrations);

  const upcomingEvents = events.slice(0, 3);
  const isOfficerOrAdmin = currentUser.role === 'officer' || currentUser.role === 'admin';

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative border-b border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Subtle institutional eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--uc-blue)]" />
            <span>Alliance Student Organization Network</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[11px] text-slate-500">AY 2026-2027</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="font-sans text-3xl leading-[1.12] font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            University Event Registration <br className="hidden sm:inline" />
            <span className="text-[var(--uc-blue)]">& Instant Gate Check-In</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Eliminate paper sign-in sheets. Register for accredited campus seminars, receive
            verifiable digital passes, and streamline doorway check-in desks with real-time QR
            validation.
          </p>

          {/* Clean Dual CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/events">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="h-11 w-full bg-[var(--uc-blue)] px-6 text-sm hover:bg-[var(--uc-blue-deep)] sm:w-auto"
              >
                Browse Upcoming Events
              </Button>
            </Link>

            {isOfficerOrAdmin && (
              <Link href="/checkin">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<QrCode className="h-4 w-4 text-[var(--uc-blue)]" />}
                  className="h-11 w-full border-slate-300 px-6 text-sm text-slate-800 hover:bg-slate-50 sm:w-auto"
                >
                  Open Door Check-In HUD
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Live Operational Metrics Ticker (Replacing generic AI slop cards) */}
        <div className="mx-auto mt-12 max-w-4xl px-4">
          <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 text-center text-xs">
            <div>
              <p className="font-mono text-lg font-extrabold text-slate-900 sm:text-xl">
                {events.length}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">Active Campus Events</p>
            </div>
            <div>
              <p className="font-mono text-lg font-extrabold text-[var(--uc-blue-deep)] sm:text-xl">
                {registrations.length}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Student Passes Claimed
              </p>
            </div>
            <div>
              <p className="font-mono text-lg font-extrabold text-emerald-700 sm:text-xl">
                &lt; 3 sec
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Door Gate Verification
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="flex-1 bg-slate-50/60 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Upcoming Events & Workshops
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Accredited student organization assemblies and training sessions.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--uc-blue)] transition-colors hover:text-[var(--uc-blue-deep)]"
            >
              View All Events <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} onClaimPass={() => {}} />
            ))}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <p>© 2026 UCEvents — Student Organization Event Registration & Attendance System</p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>UC Blue #1875BA</span>
            <span>•</span>
            <span>Alliance System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
