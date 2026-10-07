# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Client (primary).** A person who wants to book a service (haircut, manicure, lessons, sports, etc.) at a local venue without calling or waiting for a callback. Finds a venue, picks a service and a staff member, books a free slot, later sees and cancels bookings in "My appointments" and leaves a review.
- **Venue owner (secondary, but important).** Runs a venue on SlotBook: manages bookings, services, staff, staff schedules and the venue profile from the dashboard.
- **Staff member.** Works at a venue; sees and confirms or cancels their own bookings.

When client and owner needs conflict, the client experience wins.

## Product Purpose

SlotBook is a booking marketplace for local services. Clients book real, free time slots online; venues get bookings without phone calls. Success means a client goes from search to a confirmed booking in a few steps, and an owner can set up services, staff and hours so the schedule builds itself.

## Positioning

Slots come straight from the venue's real staff schedules, so the client sees actual availability instead of "we'll call you back to confirm". This is the core difference from competitors (e.g. Booksy-style flows that end in a callback).

## Operating Context

- Default market: Poland (country detected by IP, switchable in the header); multi-country capable.
- Booking flow: search (city, category) → venue page (services, staff, working hours, reviews, map) → booking form (service, staff, date, slot) → booking created as `pending`, confirmed by the owner or the staff member.
- Bookings open 30 days ahead; cancellation up to 2 hours before the start.
- Owner works in `/dashboard/[slug]` (bookings, services, staff, schedules).

## Capabilities and Constraints

- Stack: Next.js (App Router) + Tailwind CSS v4 + shadcn/ui (Base UI), Fastify backend, shared Zod schemas in `packages/shared`.
- Interface language: English.
- Categories have their own metadata (label, slug, color) in `app/(main)/_common/types.ts`.
- Out of v1: email/Telegram notifications, online payment, "any staff member" booking, search by actual free slots, geo sorting, staff invite links.
- Redesign scope: markup, styles and UI components only; logic, hooks, API calls, state, routing, data types and tests stay unchanged.

## Brand Commitments

- Name: SlotBook. No logo yet.
- Stated preference (to be decided in the design-system phase, not binding yet): the current colors feel too bright; the owner likes yellow, but a more golden / sandy one, paired with contrasting colors.

## Evidence on Hand

- Seed data in the backend (venues, services, staff, clients, bookings, reviews) is the only real content.
- No real customers, testimonials, ratings, press or pricing claims exist. Do not fabricate them.

## Product Principles

1. Real availability first: show what is actually bookable, never imply a callback.
2. The client path to a booking stays short and obvious.
3. Owners should configure once and let the schedule do the work.
4. Honest content: no invented social proof or numbers.
