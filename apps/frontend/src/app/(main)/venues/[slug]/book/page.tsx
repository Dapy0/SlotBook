'use client';
import BookingSummaryCard from '@/components/layout/BookingSummaryCard';
import BreadCrumbs from '@/components/layout/BreadCrumbs';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
const staffWorkers = [
  { label: 'Marek W. — Barber', value: 'marek' },
  { label: 'Maria K. — Stylist', value: 'maria' },
  { label: 'Andrew P. — Barber', value: 'andrew' },
];

const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      key: date.toISOString(),
      weekday: weekdayShort[date.getDay()],
      day: date.getDate(),
    };
  });
}

const days = buildDays(14);

const timeSlots = [
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: true },
  { time: '10:30', available: false },
  { time: '11:00', available: true },
  { time: '11:30', available: true },
  { time: '12:00', available: true },
  { time: '12:30', available: false },
  { time: '13:00', available: true },
  { time: '13:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: false },
  { time: '15:00', available: true },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: false },
  { time: '17:00', available: true },
  { time: '17:30', available: true },
];

function Page() {
  const [selectedStaff, setSelectedStaff] = useState<string>('marek');
  const [selectedDay, setSelectedDay] = useState<string>(days[0].key);
  const [selectedTime, setSelectedTime] = useState<string>('15:30');

  const availableCount = timeSlots.filter((s) => s.available).length;

  return (
    <div>
      <BreadCrumbs crumbsList={['categories', 'hair', 'Padel Club', 'Booking']} />
      <div className="flex gap-10">
        <div className="flex flex-col gap-6">
          <header>
            <h1 className="text-3xl font-bold text-gray-900">Men's Haircut</h1>
            <p className="mt-1 text-sm text-gray-600">Studio Nord · 30 min · 90,00 zł</p>
          </header>

          {/* Staff select */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Staff member</p>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-full max-w-72">
                <SelectValue placeholder="Select a staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {staffWorkers.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Date picker */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Date · Booking open for the next 30 days
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => {
                const isSelected = d.key === selectedDay;
                return (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDay(d.key)}
                    className={`flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm transition ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium uppercase ${
                        isSelected ? 'text-orange-100' : 'text-gray-400'
                      }`}
                    >
                      {d.weekday}
                    </span>
                    <span className="text-base font-semibold">{d.day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Available time
              </p>
              <p className="text-xs text-gray-400">
                {availableCount} of {timeSlots.length} available
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => {
                const isSelected = slot.time === selectedTime;
                return (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      !slot.available
                        ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                        : isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Booked slots are unavailable. Booking closes one hour before the start time.
            </p>
          </div>
        </div>
        <div className="w-72 shrink-0">
          <BookingSummaryCard
            businessName="Studio Nord"
            city="Kraków"
            address="Długa 12"
            score={4.8}
            reviewsCount={126}
            service="Men's Haircut"
            duration="30 min"
            date="28 Aug 2026"
            time={selectedTime}
            price="90,00 zł"
            onConfirm={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

export default Page;
