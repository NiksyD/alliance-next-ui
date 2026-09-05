'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { EventCard } from './components/EventCard';
import { TicketPassModal } from './components/TicketPassModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Calendar, Filter } from 'lucide-react';
import type { EventItem, EventType } from '@/types/events';

export default function EventsPage(): React.ReactElement {
  const events = useEventStore((s) => s.events);
  const eventTypes = useEventStore((s) => s.eventTypes);
  const registrations = useEventStore((s) => s.registrations);
  const registerForEvent = useEventStore((s) => s.registerForEvent);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || e.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleClaimPass = (event: EventItem): void => {
    const result = registerForEvent(event.id, currentUser);
    setNotification({
      message: result.message,
      type: result.success ? 'success' : 'info',
    });
    setTimeout(() => setNotification(null), 4000);

    if (result.success) {
      setSelectedEventForModal(event);
      setIsTicketModalOpen(true);
    }
  };

  const handleViewTicket = (event: EventItem): void => {
    setSelectedEventForModal(event);
    setIsTicketModalOpen(true);
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
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Campus Life</Badge>
              <span className="font-mono text-xs text-slate-500">
                {events.length} Events Listed
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
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

        {/* Notification Alert Bar */}
        {notification && (
          <div
            className={`my-4 flex items-center justify-between rounded-xl border p-3.5 text-sm font-semibold ${
              notification.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-blue-200 bg-blue-50 text-blue-800'
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="cursor-pointer text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="w-full md:w-96">
            <Input
              placeholder="Search by event title, venue, or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Event Type Filter Pills */}
          <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-2 md:w-auto md:pb-0">
            <button
              onClick={() => setSelectedType('All')}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === 'All'
                  ? 'bg-[var(--uc-blue)] text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Types
            </button>
            {eventTypes.map((type) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[var(--uc-blue)] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const hasPass = registrations.some(
              (r) => r.eventId === event.id && r.studentId === currentUser.id,
            );
            return (
              <EventCard
                key={event.id}
                event={event}
                hasPass={hasPass}
                onClaimPass={handleClaimPass}
                onViewTicket={handleViewTicket}
              />
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <Calendar className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-bold text-slate-800">No events matched your search</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your keyword filter or view all categories.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Ticket Pass Modal */}
      <TicketPassModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        event={selectedEventForModal}
        registration={activeRegistration}
      />
    </div>
  );
}
