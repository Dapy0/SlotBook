# SlotBook

![SlotBook: home page, booking flow and owner dashboard](docs/screenshots/banner.jpg)

[![Live demo](https://img.shields.io/badge/Live_demo-slotbook--app.vercel.app-EBB84E?style=for-the-badge)](https://slotbook-app.vercel.app)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?style=flat-square&logo=fastify)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)

**Online appointment booking for service businesses.** Salons, clinics, gyms, auto shops and tutors publish their venue, services, staff and photos. Clients find a venue, pick a free slot and book it in a few clicks, without a phone call.

**🔗 Live demo: [slotbook-app.vercel.app](https://slotbook-app.vercel.app)** · demo accounts (password `password123`): client `client@slotbook.test`, owner `owner@slotbook.test`

---

## About

I built SlotBook on my own as a full-stack TypeScript project: a Fastify + PostgreSQL API, a Next.js frontend, and a shared package of Zod schemas that both sides use. It has three roles. Clients book and review visits, staff confirm bookings and ask for schedule changes, and owners run their venue. The app is deployed on Vercel (frontend) and Railway (API and database).

---

<details>
<summary><b>Screenshots</b></summary>

| Home: search and discover venues |
|---|
| ![Home page](docs/screenshots/main.jpg) |

| Booking: pick a service, specialist and free slot |
|---|
| ![Booking flow](docs/screenshots/booking.jpg) |

| Owner dashboard: pending confirmations, today's bookings, revenue |
|---|
| ![Owner dashboard](docs/screenshots/dashboard.jpg) |

</details>

## Features

### For clients
- **Catalog search.** Free-text search across venue name, description, city and service names, with filters for city, category, minimum rating and maximum price. Six sort modes, including a "recommended" order that uses a Bayesian average so a venue with one 5-star review does not outrank one with fifty 4.8-star reviews. Filters, sort and page live in the URL, so every result page can be shared.
- **Venue page.** Photo gallery, description, services with prices and durations, staff, opening hours, an interactive Mapbox map, rating summary and reviews.
- **Real-time availability.** Pick a service, then a specialist, and see only the slots that are actually free, grouped into morning, afternoon and evening. Lead time and booking horizon come from the venue's own policy.
- **Booking that survives login.** A guest who has to sign in mid-booking gets their selection back afterwards (with open-redirect protection on the `next` parameter).
- **My appointments.** Upcoming and past visits, cancellation with a reason (allowed until the venue's cancellation cutoff), and a 1–5 star review for a completed visit.

### For staff
- **Work area** with a personal schedule and a list of their own bookings.
- **Confirm or cancel** incoming bookings, with a cancellation reason.
- **Schedule change requests.** Staff propose a new weekly schedule with a comment; the owner approves or rejects it, and staff can withdraw a pending request.

### For owners
- **Venue setup.** Create and edit a venue (category, address, map location, IANA timezone), set weekly opening hours with several intervals per day (breaks are allowed, overlaps are rejected).
- **Readiness check and publishing.** A venue goes live only when it has opening hours, at least one active service, at least one bookable staff member and a location. The dashboard shows which checks are still missing.
- **Photos.** Upload up to 10 images (JPEG, PNG, WebP, max 5 MB), and reorder them (the first one is the cover). A database check caps the list at 10. File type is checked by content (magic bytes), not by the extension the browser sends.
- **Booking policy.** Manual or automatic confirmation, cancellation cutoff for clients, minimum lead time and booking horizon.
- **Services and team.** Create, edit, deactivate and delete services. Hire staff by email, fire and rehire them, assign the services they perform and edit their weekly schedule (validated against the venue's opening hours).
- **Dashboard** with bookings grouped by day, week navigation, status tabs, a staff filter and revenue for the period.

---

## Interesting parts

A few problems that took the most thought:

- **Double booking.** Two people can try to book the same specialist at the same moment. Instead of only checking in code, the database itself refuses overlapping bookings (a PostgreSQL exclusion constraint on the booking's time range), and the API returns a clear "slot already taken" error.
- **Time zones.** Each venue has its own time zone, so slots are calculated in the venue's local time. Appointments don't move when clocks change for summer time.
- **One source of truth for the API.** Request and response shapes are written once as Zod schemas and shared by the frontend and backend, so a change on one side shows up as a type error on the other.
- **Ratings that stay correct.** Saving a review and updating the venue's average rating happen together in one transaction, and each visit can be reviewed only once.

---

## Tech stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js 24, Fastify 5, Drizzle ORM, PostgreSQL 16, Zod 4 + `fastify-type-provider-zod`, `@fastify/jwt` (HTTP-only cookie), `@fastify/multipart`, bcrypt, date-fns-tz |
| **Frontend** | Next.js 16 (App Router, Server Components, Server Actions, typed routes), React 19, Tailwind CSS 4, shadcn/ui on Base UI, React Hook Form + Zod, date-fns, Mapbox GL |
| **Shared** | `@slotbook/shared`: Zod schemas, inferred types, booking status rules, policy limits, date utilities |
| **Testing** | Vitest, Testcontainers (real PostgreSQL in Docker for integration tests) |
| **Tooling** | npm workspaces, strict TypeScript, ESLint, Prettier, GitHub Actions CI, Docker Compose |
| **Hosting** | Vercel (frontend), Railway (API + PostgreSQL) |

---

## Architecture

```
slotbook/
├── apps/
│   ├── backend/            Fastify REST API
│   │   ├── src/modules/    auth, facility, facilityImage, service, staff, schedule,
│   │   │                   scheduleRequest, availability, booking, review
│   │   ├── src/plugins/    JWT verification, file storage, booking expiry job
│   │   ├── src/lib/        typed errors, PostgreSQL error mapping, storage
│   │   ├── src/db/         Drizzle schema, relations, seed
│   │   └── drizzle/        SQL migrations
│   └── frontend/           Next.js app
│       ├── src/app/        (main): home, venues, account, dashboard, work
│       │                   (auth): login, register
│       ├── src/services/   API clients (*.server.ts for Server Components)
│       └── src/components/ UI kit and feature components
└── packages/
    └── shared/             Zod contracts shared by both apps
```

**Backend layering.** Each module is split into `routes → service → repository`:

- **routes** declare Zod schemas for params, query, body and response.
- **service** holds business rules and authorization (`assertFacilityOwner`, `assertFacilityStaffMember`), and opens transactions where several writes must succeed together.
- **repository** is the only layer that talks to Drizzle.

Errors are typed (`NotFoundError`, `ForbiddenError`, `ConflictError`, ...) and mapped by one error handler to a single JSON shape `{ code, message, details }`. Unique and exclusion violations from PostgreSQL become readable `409` responses.

**Frontend.** Pages are Server Components that fetch data with the user's cookie; interactive parts (forms, filters, booking actions, image manager) are small client components. Routes under `/dashboard` and `/account` are protected in `proxy.ts`.

### Data model

```
users ─┬─< facilities ─┬─< services ──────────────┐
       │               ├─< facility_schedule      │
       │               └─< staff_members ─┬─< staff_schedule
       │                                  ├─< staff_services >── services
       │                                  └─< schedule_change_requests
       └─< bookings >── facilities, staff_members, services
                └──< reviews (one per booking)
```

Venue photos are stored as an ordered list of storage keys on the venue; the first one is the cover.

---

## API overview

JSON over HTTP. Authenticated routes read the JWT from the `token` cookie. Every route has a Zod schema for input and output.

| Area | Routes |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `DELETE /auth/me`, `GET /auth/logout` |
| **Catalog** | `GET /facilities/search`, `GET /facilities/search/facets`, `GET /facilities/categories`, `GET /facilities/cities`, `GET /geo/countries` |
| **Venue (public)** | `GET /facilities/by-slug/:slug`, `GET /facilities/by-slug/:slug/schedule`, `GET /facilities/:slug/bookingData`, `GET /facilities/:id/reviews`, `GET /facilities/:id/staff`, `GET /facilities/:id/services`, `GET /facilities/:id/availability` |
| **Venue (owner)** | `GET /facilities/mine`, `POST /facilities`, `PATCH` / `DELETE /facilities/:id`, `GET /facilities/:id/manage`, `GET /facilities/:id/readiness`, `POST /facilities/:id/publish`, `POST /facilities/:id/unpublish`, `GET` / `PUT /facilities/:id/schedule`, `GET` / `PATCH /facilities/:id/booking-policy` |
| **Photos** | `POST` / `PUT` / `DELETE /facilities/:id/images` (upload, reorder, delete) |
| **Services** | `GET /facilities/:id/services/manage`, `POST /facilities/:id/services`, `GET` / `PATCH` / `DELETE /facilities/:id/services/:serviceId` |
| **Staff** | `GET /facilities/:id/staff/manage`, `POST /facilities/:id/staff`, `PATCH /facilities/:id/staff/:staffId`, `PUT /facilities/:id/staff/:staffId/services`, `GET` / `PUT /facilities/:id/staff/:staffId/schedule` |
| **Schedule requests** | Staff: `POST` / `GET /staff/me/schedule-requests`, `POST /staff/me/schedule-requests/:requestId/withdraw`. Owner: `GET /facilities/:id/schedule-requests[/:requestId]`, `POST .../approve`, `POST .../reject` |
| **Bookings** | `GET` / `POST /facilities/:id/bookings`, `PATCH /facilities/:id/bookings/:bookingId` (confirm / cancel), `POST /facilities/:id/bookings/:bookingId/reviews`, `GET /bookings/mine` |
| **Staff area** | `GET /staff/me`, `GET /staff/me/bookings` |

---

## Getting started

### Prerequisites
- Node.js 24+
- Docker (for PostgreSQL and integration tests)

### 1. Install

```bash
git clone https://github.com/Dapy0/SlotBook.git
cd SlotBook
npm install
```

### 2. Start the database

```bash
docker compose up -d
```

PostgreSQL 16 starts on port `5433` with the `btree_gist` extension enabled.

### 3. Configure environment

`apps/backend/.env`:

```env
DATABASE_URL=postgres://slotbook_admin:slotbook_TEMPPAS@localhost:5433/slotbook_db
PORT=3001
JWT_SECRET_KEY=change-me
APP_HOST=localhost
UPLOAD_DIR=uploads
FILES_PUBLIC_BASE_URL=http://localhost:3001/uploads
```

`apps/frontend/.env.local`:

```env
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 4. Migrate and seed

```bash
npm run backend:migrate
npm run db:seed --workspace=apps/backend
```

The seed creates venues in several countries with photos, services, staff with schedules, bookings and reviews.

### 5. Run

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Client | `client@slotbook.test` | `password123` |
| Owner | `owner@slotbook.test` | `password123` |

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Backend and frontend together |
| `npm test` | Unit and integration tests in every workspace |
| `npm run typecheck` | TypeScript in every workspace |
| `npm run lint` / `npm run format:check` | ESLint / Prettier |
| `npm run backend:generate` | Generate a migration from the Drizzle schema |
| `npm run db:reset --workspace=apps/backend` | Drop, migrate and reseed the database |

CI (GitHub Actions) runs typecheck, format check, lint and tests on every push to `main` and every pull request.

---

## Testing

- **Shared package:** unit tests for the Zod contracts (auth, users, staff, reviews).
- **Backend:** unit tests for the booking state machine and PostgreSQL error mapping; integration tests for auth routes that run against a real PostgreSQL started by Testcontainers.

---

## Design

The UI follows an **"appointment book"** concept, inspired by the paper booking journal at a salon reception: a warm sand-gold accent used only as a fill, an ink-navy color for text, Bricolage Grotesque for headings and Onest for the interface, with tabular figures for every time and price. The selected slot is marked with a gold "highlighter", the same mark used on the landing page headline.

Accessibility work includes visible focus rings, 44px touch targets on mobile, contrast-checked status badges, loading skeletons and error boundaries, and animations that fall back to simple fades under `prefers-reduced-motion`.

---

## What I learned

- Designing a **contract-first API** with Zod shared between client and server, including response serialization as a safety net.
- Putting business invariants **in the database** (exclusion constraints, unique indexes, transactions) instead of trusting application code alone.
- Working with **time zones and time ranges** (`tstzrange`, IANA zones, DST) correctly.
- Modelling **workflows with several roles**: booking statuses, schedule change approval, venue publishing.
- Handling **file uploads** safely: size limits, content-based type detection, storage behind an interface.
- Writing **SQL-level ranking** (Bayesian average) and search with Drizzle without dropping to raw queries everywhere.
- Planning each feature from database to UI before starting the next one, and deploying a split frontend / backend setup.

## Roadmap

- More tests for booking, availability and owner flows
- Email / Telegram notifications for new and confirmed bookings
- Owner replies to reviews
- Fuzzy search with `pg_trgm`
- S3-compatible storage for photos
- Online payments

---

## Author

**Daniel** · [GitHub @Dapy0](https://github.com/Dapy0) · open to junior full-stack (TypeScript / React / Node.js) roles
