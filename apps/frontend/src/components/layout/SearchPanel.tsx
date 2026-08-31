'use client';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

const CITIES = [
  { label: 'All cities', value: 'All cities' },
  { label: 'Chisinau', value: 'Chisinau' },
  { label: 'Odessa', value: 'Odessa' },
];

function SearchPanel() {
  const [date, setDate] = useState<Date>();
  return (
    <form
      id="search-panel-form"
      className="inline-flex w-full items-stretch gap-6 rounded-xl border border-neutral-200 bg-white shadow-sm px-6 py-2.5 text-center"
    >
      <label className="flex flex-1 flex-col justify-start gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          Facility, service
        </span>
        <Input
          type="text"
          placeholder="haircut, lesson"
          className="h-auto text-center border-0 text-sm shadow-none focus-visible:ring-0 rounded-none"
        />
      </label>

      <div className="w-px shrink-0 bg-neutral-200" />

      <label className="flex flex-1 flex-col justify-start gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-600">City</span>
        <Select items={CITIES} defaultValue={'All cities'}>
          <SelectTrigger className="h-auto min-w-8 self-center gap-1 border-0 p-0 text-sm shadow-none focus-visible:ring-0 [&_svg]:text-neutral-400">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {CITIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </label>

      <div className="w-px shrink-0 bg-neutral-200" />

      <label className="flex flex-1 flex-col justify-start gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-600">
          Select date
        </span>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                data-empty={!date}
                className="flex items-center gap-1 self-center text-sm text-neutral-900 data-[empty=true]:text-neutral-400 border-0 shadow-none hover:bg-transparent hover:text-neutral-900 focus-visible:ring-0"
              >
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
                <ChevronDownIcon className="size-3.5 text-neutral-400" data-icon="inline-end" />
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={date} />
          </PopoverContent>
        </Popover>
      </label>

      <div className="w-px shrink-0 bg-neutral-200" />

      <label className="flex flex-1 flex-col justify-start gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-600">Time</span>
        <Input
          type="time"
          id="time-picker-optional"
          step="0"
          defaultValue="10:30"
          className="h-auto w-20 self-center appearance-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none rounded-none"
        />
      </label>
    </form>
  );
}

export default SearchPanel;
