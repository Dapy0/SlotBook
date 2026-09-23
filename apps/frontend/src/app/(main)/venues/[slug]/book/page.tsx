import BookForm from "@/app/(main)/venues/[slug]/book/_components/BookForm";

import { ApiError } from "@/lib/api";
import { getDataForBooking } from "@/services/facilities";
import { notFound } from "next/navigation";

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service: string; staff?: string; date?: string; time?: string }>;
}) {
  const { slug } = await params;
  const { date, service, staff, time } = await searchParams;
  const [bookingData] = await Promise.all([
    getDataForBooking(slug).catch((err) => {
      if (err instanceof ApiError && err.status === 404) notFound();
      throw err;
    }),
  ]);

  return (
    <BookForm
      bookingData={bookingData}
      initialStaff={staff ?? null}
      initialService={service ?? null}
      initialDate={date ?? null}
      initialTime={time ?? null}
    />
  );
}

export default Page;
