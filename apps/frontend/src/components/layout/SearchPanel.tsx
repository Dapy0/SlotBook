"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

const CITIES = [
  { label: "All cities", value: "All cities" },
  { label: "Chisinau", value: "Chisinau" },
  { label: "Odessa", value: "Odessa" },
];

function SearchPanel() {
  const [date, setDate] = useState<Date>();
  return (
    <div className="flex flex-nowrap justify-center">
      <form
        id="search-panel-form"
        className="inline-flex items-stretch gap-6 rounded-l-lg border border-r-0 border-neutral-200 bg-white px-2 py-1 text-center whitespace-nowrap shadow-sm"
      >
        <label className="flex flex-col justify-start gap-0.5">
          <span className="text-xs font-medium tracking-wide text-neutral-600 uppercase">
            Facility, service
          </span>
          <Input
            type="text"
            placeholder="haircut, lesson"
            className="h-auto rounded-none border-0 px-0 py-0 pl-1 text-center text-sm text-black shadow-none focus-visible:ring-0"
          />
        </label>

        <div className="w-px shrink-0 bg-neutral-200" />

        <label className="flex flex-col justify-start gap-0.5">
          <span className="text-xs font-medium tracking-wide text-neutral-600 uppercase">City</span>
          <Select items={CITIES} defaultValue={"All cities"}>
            <SelectTrigger className="max-h-fit gap-1 self-center border-0 p-0 text-sm shadow-none focus-visible:ring-0 [&_svg]:text-neutral-400">
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

        <label className="flex flex-col justify-start gap-0.5">
          <span className="text-xs font-medium tracking-wide text-neutral-600 uppercase">
            Select date
          </span>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  data-empty={!date}
                  className="m-0 flex max-h-fit flex-0 items-center gap-1 self-center rounded-none border-0 p-0! pr-0 text-sm text-black shadow-none hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent data-[empty=true]:text-neutral-400"
                >
                  {date ? (
                    format(date, "PPP")
                  ) : (
                    <span className="p-0 text-sm text-black shadow-none">Pick a date</span>
                  )}
                  <ChevronDownIcon
                    className="size-3.5 p-0 text-neutral-400"
                    data-icon="inline-end"
                  />
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={date} />
            </PopoverContent>
          </Popover>
        </label>

        <div className="w-px shrink-0 bg-neutral-200" />

        <label className="flex flex-col justify-start gap-0.5">
          <span className="text-xs font-medium tracking-wide text-neutral-600 uppercase">Time</span>
          <Input
            type="time"
            id="time-picker-optional"
            step="0"
            defaultValue="10:30"
            className="flex-0 appearance-none self-center rounded-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </label>
      </form>
      <Button className={"m-0 h-auto rounded-l-none rounded-r-lg p-0 px-4"}>Search</Button>
    </div>
  );
}

export default SearchPanel;
