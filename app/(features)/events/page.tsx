'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { EventCard } from './components/EventCard';
import { TicketPassModal } from './components/TicketPassModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { Search, Plus, Calendar, Ticket, CheckCircle2, Info, X } from 'lucide-react';
import type { EventItem } from '@/types/events';

type EventViewScope = 'all' | 'my_passes';

export default function EventsPage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const eventTypes = useEventStore((s) => s.eventTypes);
  const registrations = useEventStore((s) => s.registrations);
  const registerForEvent = useEventStore((s) => s.registerForEvent);
  const cancelRegistration = useEventStore((s) => s.cancelRegistration);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [scopeTab, setScopeTab] = useState<EventViewScope>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  // Active user registrations
  const userRegistrations = useMemo(() => {
    return registrations.filter((r) => r.studentId === currentUser.id && r.status !== 'cancelled');
  }, [registrations, currentUser.id]);

  const myPassesCount = userRegistrations.length;
  const userRegisteredEventIds = useMemo(() => {
    return new Set(userRegistrations.map((r) => r.eventId));
  }, [userRegistrations]);

  // Filter options for Dropdown
  const typeDropdownOptions = useMemo(() => {
    return [
      { value: 'All', label: 'All Categories' },
      ...eventTypes.map((type) => ({ value: type, label: type })),
    ];
  }, [eventTypes]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Scope filter
      if (scopeTab === 'my_passes' && !userRegisteredEventIds.has(e.id)) {
        return false;
      }

      // Keyword search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q);

      // Type dropdown filter
      const matchesType = selectedType === 'All' || e.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [events, scopeTab, userRegisteredEventIds, searchQuery, selectedType]);

  const showToast = (message: string, type: 'success' | 'info'): void => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleClaimPass = (event: EventItem): void => {
    const result = registerForEvent(event.id, currentUser);
    showToast(result.message, result.success ? 'success' : 'info');

    if (result.success) {
      setSelectedEventForModal(event);
      setIsTicketModalOpen(true);
    }
  };

  const handleViewTicket = (event: EventItem): void => {
    setSelectedEventForModal(event);
    setIsTicketModalOpen(true);
  };

  const handleCancelRegistration = (eventId: string): void => {
    cancelRegistration(eventId, currentUser.id);
    setIsTicketModalOpen(false);
    showToast('Registration cancelled. Your reserved spot has been released.', 'info');
  };

  const activeRegistration = selectedEventForModal
    ? registrations.find(
        (r) => r.eventId === selectedEventForModal.id && r.studentId === currentUser.id,
      ) || null
    : null;

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header with Title and Create Action for Officers */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-7 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Campus Life</Badge>
              <span className="font-mono text-xs text-slate-500">
                {events.length} Events Listed
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Student Organization Events
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Explore accredited workshops, general assemblies, and student competitions.
            </p>
          </div>

          {currentUser.role !== 'student' && (
            <Link href="/dashboard/events/create">
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                className="w-full md:w-auto"
              >
                Create New Event
              </Button>
            </Link>
          )}
        </div>

        {/* Floating Toast Notification (Zero Layout Shift) */}
        {toast && (
          <aside
            aria-label="Notification Alert"
            className="fixed right-6 bottom-6 z-50 flex max-w-md items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5"
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <Info className="h-5 w-5 shrink-0 text-[var(--uc-blue)]" />
              )}
              <span className="text-xs leading-snug font-semibold text-slate-800">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </aside>
        )}

        {/* Filter Controls Toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Segmented Scope Tab Buttons */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            <button
              onClick={() => setScopeTab('all')}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                scopeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Events</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                  scopeTab === 'all'
                    ? 'bg-slate-100 text-slate-800'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setScopeTab('my_passes')}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                scopeTab === 'my_passes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket className="h-3.5 w-3.5 text-[var(--uc-blue)]" />
              <span>My Passes</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                  scopeTab === 'my_passes'
                    ? 'bg-[var(--uc-blue)] text-white'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {myPassesCount}
              </span>
            </button>
          </div>

          {/* Search Bar + Standardized Category Dropdown */}
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>

            <div className="w-full sm:w-48">
              <Dropdown
                options={typeDropdownOptions}
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                placeholder="All Categories"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const userReg = registrations.find(
              (r) => r.eventId === event.id && r.studentId === currentUser.id,
            );
            return (
              <EventCard
                key={event.id}
                event={event}
                registration={userReg}
                onClaimPass={handleClaimPass}
                onViewTicket={handleViewTicket}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              {scopeTab === 'my_passes' ? (
                <Ticket className="h-6 w-6" />
              ) : (
                <Calendar className="h-6 w-6" />
              )}
            </div>
            <h3 className="mt-3.5 text-base font-bold text-slate-900">
              {scopeTab === 'my_passes'
                ? 'No Event Passes Claimed Yet'
                : 'No Matching Events Found'}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              {scopeTab === 'my_passes'
                ? 'You have not registered for any upcoming events yet. Browse all events to secure your pass.'
                : 'Try adjusting your keyword filter or select a different category to see available events.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              {scopeTab === 'my_passes' ? (
                <Button variant="primary" size="sm" onClick={() => setScopeTab('all')}>
                  Browse All Events
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('All');
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Pass Modal */}
      <TicketPassModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        event={selectedEventForModal}
        registration={activeRegistration}
        onCancelRegistration={handleCancelRegistration}
      />
    </div>
  );
}
