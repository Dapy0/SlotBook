import { getMyFacilities } from "@/services/facilities";
import { cookies } from "next/headers";

import SchedulePageClient from "@/app/(main)/dashboard/schedule/_components/SchedulePageClient";

const entities = [
  { key: "business", label: "Business" },
  { key: "anna", label: "Anna K." },
  { key: "marek", label: "Marek W." },
];

type DaySchedule = {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

const initialSchedule: DaySchedule[] = [
  { day: "Monday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Tuesday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Wednesday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Thursday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Friday", enabled: true, from: "09:00", to: "18:00" },
  { day: "Saturday", enabled: false, from: "10:00", to: "16:00" },
  { day: "Sunday", enabled: false, from: "10:00", to: "16:00" },
];

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const myFacilities = await getMyFacilities(cookieStore.toString());

  // return <SchedulePageClient myFacilities={myFacilities} />;
}
