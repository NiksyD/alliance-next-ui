'use client';

import React, { useState } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Tags, Plus, MapPin, Users, Phone, UserCheck } from 'lucide-react';
import type { EventType } from '@/types/events';

export default function MasterDataPage(): React.ReactElement {
  const venues = useEventStore((s) => s.venues);
  const eventTypes = useEventStore((s) => s.eventTypes);
  const addVenue = useEventStore((s) => s.addVenue);
  const addEventType = useEventStore((s) => s.addEventType);

  const [activeTab, setActiveTab] = useState<'venues' | 'types'>('venues');

  // New Venue Form State
  const [vName, setVName] = useState('');
  const [vRoom, setVRoom] = useState('');
  const [vCapacity, setVCapacity] = useState(100);
  const [vLocation, setVLocation] = useState('');
  const [vNotes, setVNotes] = useState('');
  const [vContact, setVContact] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [isAddingVenue, setIsAddingVenue] = useState(false);

  // New Event Type Form State
  const [newTypeName, setNewTypeName] = useState('');

  const handleSaveVenue = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!vName.trim()) return;

    addVenue({
      name: vName,
      roomNumber: vRoom,
      capacity: Number(vCapacity),
      location: vLocation,
      availabilityNotes: vNotes,
      contactPerson: vContact,
      contactNumber: vPhone,
    });

    setIsAddingVenue(false);
    setVName('');
    setVRoom('');
    setVLocation('');
  };

  const handleAddType = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    addEventType(newTypeName as EventType);
    setNewTypeName('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Master Data Module</Badge>
              <span className="font-mono text-xs text-slate-500">
                Institutional Classifications
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Venues & Event Classifications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage physical room capacities, location contacts, and standard event type
              taxonomies.
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
            <button
              onClick={() => setActiveTab('venues')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'venues'
                  ? 'bg-[var(--uc-blue)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" /> Venues ({venues.length})
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'types'
                  ? 'bg-[var(--uc-blue)] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tags className="h-3.5 w-3.5" /> Event Types ({eventTypes.length})
            </button>
          </div>
        </div>

        {activeTab === 'venues' ? (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Registered Campus Venues</h2>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddingVenue(!isAddingVenue)}
              >
                {isAddingVenue ? 'Close Form' : 'Register New Venue'}
              </Button>
            </div>

            {isAddingVenue && (
              <Card className="border-2 border-[var(--uc-blue-container)] bg-blue-50/20 p-6">
                <form onSubmit={handleSaveVenue} className="space-y-4">
                  <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                    Add Campus Venue Record
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Venue / Hall Name *"
                      placeholder="e.g. Science & Tech Amphitheater"
                      value={vName}
                      onChange={(e) => setVName(e.target.value)}
                      required
                    />
                    <Input
                      label="Room Number / Identifier"
                      placeholder="e.g. SCI-301"
                      value={vRoom}
                      onChange={(e) => setVRoom(e.target.value)}
                    />
                    <Input
                      type="number"
                      label="Max Seating Capacity *"
                      value={vCapacity}
                      onChange={(e) => setVCapacity(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Campus Location"
                      placeholder="Building, Floor wing"
                      value={vLocation}
                      onChange={(e) => setVLocation(e.target.value)}
                    />
                    <Input
                      label="Contact Person / Coordinator"
                      placeholder="Name of hall manager"
                      value={vContact}
                      onChange={(e) => setVContact(e.target.value)}
                    />
                    <Input
                      label="Contact Hotline / Mobile"
                      placeholder="+63 9XX..."
                      value={vPhone}
                      onChange={(e) => setVPhone(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Availability & Equipment Notes"
                    placeholder="e.g. Sound system, AC controls, stage mic..."
                    value={vNotes}
                    onChange={(e) => setVNotes(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingVenue(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Save Venue
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {venues.map((v) => (
                <Card key={v.id} className="flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-sm bg-[var(--uc-blue-container)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--uc-blue-deep)]">
                          {v.roomNumber}
                        </span>
                        <h3 className="mt-2 text-base leading-snug font-bold text-slate-900">
                          {v.name}
                        </h3>
                      </div>
                      <Badge variant="neutral">
                        <Users className="mr-1 h-3 w-3" /> {v.capacity} pax
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{v.location}</span>
                      </p>
                      {v.availabilityNotes && (
                        <p className="rounded-md border border-slate-100 bg-slate-50 p-2 text-[11px] text-slate-500">
                          {v.availabilityNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">{v.contactPerson}</span>
                    <span className="block font-mono text-[10px]">{v.contactNumber}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 max-w-2xl space-y-6">
            <Card className="p-6">
              <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                Register New Event Classification
              </h2>
              <form onSubmit={handleAddType} className="mt-4 flex gap-2">
                <Input
                  placeholder="e.g. Hackathon, Job Fair, Induction..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="flex-1"
                />
                <Button variant="primary" type="submit" leftIcon={<Plus className="h-4 w-4" />}>
                  Add Classification
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="mb-3 text-sm font-bold tracking-wider text-slate-800 uppercase">
                Standard Event Classifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--uc-blue)]" />
                    {type}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
