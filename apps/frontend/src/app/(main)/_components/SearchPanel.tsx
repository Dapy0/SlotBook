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
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import type { FacilityCityResponse } from "@slotbook/shared";
import { createParams } from "@/lib/queryStrings";
import { redirect } from "next/navigation";
import { convertToSelectFormat } from "@/lib/utils";

// Search covers what the venues page can actually filter by: text and city.
function SearchPanel({ cities }: { cities: FacilityCityResponse[] }) {
  const [inputVal, setInputVal] = useState<string>();
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const formattedCities = convertToSelectFormat(cities, "city", "city");

  return (
    <form
      role="search"
      className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-md transition-[box-shadow,border-color] duration-150 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40 sm:flex-row sm:items-center sm:gap-0"
      onSubmit={(e) => {
        e.preventDefault();
        const query = createParams({
          q: inputVal,
          city: activeCity,
        });
        redirect(`/venues?${query}`);
      }}
    >
      <label className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">Venue or service</span>
        <Input
          type="text"
          placeholder="Venue or service, e.g. haircut"
          className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          value={inputVal ?? ""}
          onChange={(e) => setInputVal(e.target.value)}
        />
      </label>

      <div aria-hidden className="hidden h-8 w-px shrink-0 bg-border sm:block" />

      <div className="flex items-center gap-2 border-t border-border px-1 pt-2 sm:border-t-0 sm:pt-0">
        <Select
          value={activeCity}
          onValueChange={(el) => setActiveCity(el || null)}
          items={formattedCities}
        >
          <SelectTrigger
            aria-label="City"
            className="h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 sm:w-44 sm:flex-none dark:bg-transparent"
          >
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              <SelectItem value={null}>All cities</SelectItem>
              {formattedCities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label.toWellFormed()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button type="submit" size="lg" className="shrink-0">
          Search
        </Button>
      </div>
    </form>
  );
}

export default SearchPanel;
