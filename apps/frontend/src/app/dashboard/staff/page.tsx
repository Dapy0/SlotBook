'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDownIcon } from 'lucide-react';

type Service = {
  id: string;
  title: string;
  duration: string;
  price: string;
};

type DaySchedule = {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

type StaffMember = {
  id: string;
  name: string;
  role: string;
  staffId: string;
  joined: string;
  active: boolean;
  services: Service[];
  schedule: DaySchedule[];
};

const defaultSchedule: DaySchedule[] = [
  { day: 'Monday', enabled: true, from: '09:00', to: '18:00' },
  { day: 'Tuesday', enabled: true, from: '09:00', to: '18:00' },
  { day: 'Wednesday', enabled: true, from: '09:00', to: '18:00' },
  { day: 'Thursday', enabled: true, from: '09:00', to: '18:00' },
  { day: 'Friday', enabled: true, from: '09:00', to: '18:00' },
  { day: 'Saturday', enabled: false, from: '10:00', to: '16:00' },
  { day: 'Sunday', enabled: false, from: '10:00', to: '16:00' },
];

const initialStaff: StaffMember[] = [
  {
    id: 'anna',
    name: 'Anna K.',
    role: 'Stylist',
    staffId: 'nord-st1',
    joined: 'Feb 4, 2026',
    active: true,
    services: [
      { id: 's1', title: 'Single Tone Coloring', duration: '120 min', price: '320,00 zł' },
      { id: 's2', title: 'Styling', duration: '40 min', price: '90,00 zł' },
      { id: 's3', title: 'Balayage', duration: '150 min', price: '450,00 zł' },
    ],
    schedule: defaultSchedule,
  },
  {
    id: 'marek',
    name: 'Marek W.',
    role: 'Barber',
    staffId: 'nord-st2',
    joined: 'Mar 18, 2026',
    active: true,
    services: [{ id: 's4', title: "Men's Haircut", duration: '30 min', price: '90,00 zł' }],
    schedule: defaultSchedule,
  },
  {
    id: 'julia',
    name: 'Julia S.',
    role: 'Masseuse',
    staffId: 'nord-st3',
    joined: 'Jun 2, 2026',
    active: false,
    services: [{ id: 's5', title: 'Classic Back Massage', duration: '60 min', price: '150,00 zł' }],
    schedule: defaultSchedule.map((d) => ({ ...d, enabled: false })),
  },
];

function ServicesPanel({
  staff,
  onAddService,
}: {
  staff: StaffMember;
  onAddService: (staffId: string, service: Service) => void;
}) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddService(staff.id, {
      id: `${staff.id}-${Date.now()}`,
      title: name,
      duration: duration ? `${duration} min` : '—',
      price: price ? `${price} zł` : '—',
    });
    setName('');
    setDuration('');
    setPrice('');
  };

  return (
    <div>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
        {staff.services.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-400">No services yet.</p>
        )}
        {staff.services.map((service) => (
          <div key={service.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{service.title}</p>
              <p className="text-xs text-gray-400">{service.duration}</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">{service.price}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[1.5fr_1fr_1fr_auto] items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`svc-name-${staff.id}`}>Name</Label>
          <Input
            id={`svc-name-${staff.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New service"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`svc-duration-${staff.id}`}>Duration (min)</Label>
          <Input
            id={`svc-duration-${staff.id}`}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`svc-price-${staff.id}`}>Price</Label>
          <Input
            id={`svc-price-${staff.id}`}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="150,00"
          />
        </div>
        <Button onClick={handleAdd} className="bg-primary text-white hover:bg-primary/90">
          Add
        </Button>
      </div>
    </div>
  );
}

function SchedulePanel({
  staff,
  onToggleDay,
  onUpdateTime,
}: {
  staff: StaffMember;
  onToggleDay: (staffId: string, day: string) => void;
  onUpdateTime: (staffId: string, day: string, field: 'from' | 'to', value: string) => void;
}) {
  return (
    <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
      {staff.schedule.map((d) => (
        <div
          key={d.day}
          className={`flex items-center justify-between px-4 py-2.5 ${
            !d.enabled ? 'bg-gray-50' : ''
          }`}
        >
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={d.enabled}
              onChange={() => onToggleDay(staff.id, d.day)}
              className="size-4 accent-primary"
            />
            <span className={`text-sm ${d.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
              {d.day}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="time"
              value={d.from}
              disabled={!d.enabled}
              onChange={(e) => onUpdateTime(staff.id, d.day, 'from', e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 focus:border-primary focus:outline-none"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="time"
              value={d.to}
              disabled={!d.enabled}
              onChange={(e) => onUpdateTime(staff.id, d.day, 'to', e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StaffPage() {
  const [staff, setStaff] = useState(initialStaff);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'services' | 'schedule'>('services');

  const toggleExpanded = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setSubTab('services');
    }
  };

  const toggleActive = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const addService = (staffId: string, service: Service) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, services: [...s.services, service] } : s)),
    );
  };

  const toggleDay = (staffId: string, day: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? {
              ...s,
              schedule: s.schedule.map((d) => (d.day === day ? { ...d, enabled: !d.enabled } : d)),
            }
          : s,
      ),
    );
  };

  const updateTime = (staffId: string, day: string, field: 'from' | 'to', value: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? {
              ...s,
              schedule: s.schedule.map((d) => (d.day === day ? { ...d, [field]: value } : d)),
            }
          : s,
      ),
    );
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Team</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Staff</h1>
        </div>
        <span className="text-sm text-gray-400">Total: {staff.length}</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {staff.map((member) => {
          const isExpanded = expandedId === member.id;
          return (
            <div key={member.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Row header */}
              <button
                onClick={() => toggleExpanded(member.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {member.role}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {member.services.length} services
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Staff ID: {member.staffId} · Joined {member.joined}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(member.id);
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    {member.active ? 'Disable' : 'Enable'}
                  </span>
                  <ChevronDownIcon
                    size={18}
                    className={`text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-6 py-5">
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => setSubTab('services')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        subTab === 'services'
                          ? 'bg-primary text-white'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Services
                    </button>
                    <button
                      onClick={() => setSubTab('schedule')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        subTab === 'schedule'
                          ? 'bg-primary text-white'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Schedule
                    </button>
                  </div>

                  {subTab === 'services' && (
                    <ServicesPanel staff={member} onAddService={addService} />
                  )}
                  {subTab === 'schedule' && (
                    <SchedulePanel
                      staff={member}
                      onToggleDay={toggleDay}
                      onUpdateTime={updateTime}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite staff */}
      <h2 className="mt-10 text-lg font-semibold text-gray-900">Invite Staff Member</h2>
      <div className="mt-3 flex max-w-md flex-col gap-1.5">
        <Label htmlFor="invite-email">Email</Label>
        <div className="flex gap-2">
          <Input id="invite-email" placeholder="master@example.com" className="flex-1" />
          <Button className="bg-primary text-white hover:bg-primary/90">Invite</Button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          The invite will be sent by email — the staff member sets their own password.
        </p>
      </div>
    </div>
  );
}
