import type { Metadata } from "next";
import { Bricolage_Grotesque, Onest } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/authContext";
import { Toaster } from "@/components/ui/toast";

// Headings: a grotesque with character. UI and body: one workhorse family (see DESIGN.md).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
});

const onest = Onest({
  subsets: ["latin", "latin-ext"],
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: {
    default: "SlotBook · Book local services in real free slots",
    template: "%s · SlotBook",
  },
  description:
    "Find a venue, pick a service and staff member, and book a time that is actually free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", bricolage.variable, onest.variable, "font-sans")}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
