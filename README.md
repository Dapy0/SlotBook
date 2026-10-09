# SlotBook

**Online appointment booking for service businesses.** Salons, clinics, gyms, auto shops and tutors publish their venue, services and staff, and clients book a free slot in a few clicks, without a phone call.

![SlotBook: home page, booking flow and owner dashboard](docs/screenshots/collage.jpg)

<!-- Live demo: add the link here once deployed -->

**🔗 Live demo: [slotbook-app.vercel.app](https://slotbook-app.vercel.app)**

Demo accounts (password `password123`): client `client@slotbook.test` · owner `owner@slotbook.test`

SlotBook is a full-stack TypeScript monorepo: a Fastify + PostgreSQL API, a Next.js App Router frontend, and a shared package of Zod contracts that both sides import, so the request and response types are defined once.

<details>
<summary><b>Full-size screenshots</b></summary>

| Home: search and discover venues        |
| --------------------------------------- |
| ![Home page](docs/screenshots/main.jpg) |

| Booking: pick a service, specialist and free slot |
| ------------------------------------------------- |
| ![Booking flow](docs/screenshots/booking.jpg)     |

| Owner dashboard: pending confirmations, today's bookings, revenue |
| ----------------------------------------------------------------- |
| ![Owner dashboard](docs/screenshots/dashboard.jpg)                |

</details>

---

## Features

### For clients

- **Search and catalog.** Browse venues by country, city, category (beauty, sport & fitness, medical, auto, education), rating and free text, with pagination and filters kept in the URL so every result page is shareable.
- **Venue page.** Description, photos, services with prices and durations, staff, working hours, reviews and an interactive Mapbox map.
- **Real-time availability.** Pick a service, then a specialist, and see only the slots that are actually free for the next 30 days, grouped into morning, afternoon and evening.
- **Booking that survives login.** If a guest starts booking and has to sign in, their choice is restored after login (with open-redirect protection on the `next` parameter).
- **My appointments.** Upcoming and past bookings, cancellation before the visit starts, and a review for a confirmed visit (one review per booking).

### For staff

- **Work area.** A personal schedule and a list of their own bookings.
- **Confirm or cancel** incoming bookings.

### For owners

- **Dashboard for each venue** with bookings grouped by day, week navigation, status tabs, a staff filter and revenue calculation.
- **Services.** Create, edit, deactivate (soft delete) and delete services with price, currency and duration.
- **Staff management.** Hire a team member by email, fire and rehire them, assign the services they perform, and edit their weekly schedule. The schedule is validated against the venue's opening hours.
- **Venue schedule.** Weekly opening hours with several intervals per day.

### Under the hood

- **No double booking, guaranteed by the database.** A PostgreSQL `EXCLUDE USING GIST` constraint on `(staff_member_id, time_range)` rejects overlapping bookings for the same staff member, even under concurrent requests.
- **Booking lifecycle as a state machine.** `pending → confirmed → canceled`, with each transition allowed only for specific roles (client, staff, owner). The rules live in the shared package and are unit-tested.
- **Automatic expiry.** A Fastify plugin cancels unconfirmed bookings whose start time has passed (runs on startup and every 5 minutes).
- **Timezone-correct slots.** Each venue has its own IANA timezone; the slot engine computes local days and converts to UTC with `date-fns-tz`, so DST changes do not shift appointments.
- **Price snapshot.** A booking stores the price and currency at the moment of booking, so later price changes do not rewrite history.

---

## Tech stack

| Layer        | Technologies                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**  | Node.js 24, Fastify 5, Drizzle ORM, PostgreSQL 16, Zod 4 + `fastify-type-provider-zod`, `@fastify/jwt` (JWT in an HTTP-only cookie), bcrypt                          |
| **Frontend** | Next.js 16 (App Router, Server Components, Server Actions, typed routes), React 19, Tailwind CSS 4, shadcn/ui on Base UI, React Hook Form + Zod, date-fns, Mapbox GL |
| **Shared**   | `@slotbook/shared`: Zod schemas, inferred types, booking status rules, date utilities                                                                                |
| **Testing**  | Vitest, Testcontainers (real PostgreSQL in Docker for integration tests)                                                                                             |
| **Tooling**  | npm workspaces, TypeScript (strict), ESLint, Prettier, GitHub Actions CI, Docker Compose                                                                             |

---

## Architecture

```
slotbook/
├── apps/
│   ├── backend/          Fastify REST API
│   │   ├── src/modules/  feature modules: auth, facility, service, staff,
│   │   │                 schedule, availability, booking, review
│   │   ├── src/plugins/  JWT verification, booking expiry job
│   │   ├── src/db/       Drizzle schema, relations, seed
│   │   └── drizzle/      SQL migrations
│   └── frontend/         Next.js app
│       ├── src/app/      routes: (main), (auth), dashboard, work, account, venues
│       ├── src/services/ API clients (*.server.ts for Server Components)
│       └── src/components/ UI kit and feature components
└── packages/
    └── shared/           Zod contracts shared by both apps
```

**Backend layering.** Each module is split into `routes → service → repository`:

- **routes** declare the Zod schemas for params, body and response. Fastify validates input and also serializes output against the schema, so the API cannot leak a field that is not in the contract.
- **service** holds business rules and authorization (`assertFacilityOwner`, `assertFacilityStaffMember`).
- **repository** is the only layer that talks to Drizzle.

Errors are typed (`NotFoundError`, `ForbiddenError`, `ConflictError`, ...) and mapped to a single JSON shape `{ code, message, details }` by one error handler. PostgreSQL error codes (unique and exclusion violations) are recognized and turned into clear 409 Conflict responses.

**Frontend.** Pages are Server Components that fetch data with the user's cookie; interactive parts (forms, filters, booking actions) are small client components. Routes under `/dashboard` and `/account` are protected in `proxy.ts`.

### Data model

```
users ─┬─< facilities ─┬─< services ─┐
       │               ├─< facility_schedule
       │               └─< staff_members ─┬─< staff_schedule
       │                                  └─< staff_services >── services
       └─< bookings >── facilities, staff_members, services
                └──< reviews
```

---

## API overview

All routes are JSON. Authenticated routes read the JWT from the `token` cookie.

| Method                              | Route                                                   | Description                                            |
| ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `POST`                              | `/auth/register`, `/auth/login`                         | Create account / sign in                               |
| `GET` / `DELETE`                    | `/auth/me`                                              | Current user / delete account                          |
| `GET`                               | `/auth/logout`                                          | Clear session                                          |
| `GET`                               | `/facilities/search`                                    | Search venues by country, city, category, rating, text |
| `GET`                               | `/facilities/by-slug/:slug`                             | Venue details                                          |
| `GET`                               | `/facilities/mine`                                      | Venues owned by the current user                       |
| `POST` / `PATCH` / `DELETE`         | `/facilities`, `/facilities/:id`                        | Manage a venue                                         |
| `GET` / `PUT`                       | `/facilities/:id/schedule`                              | Venue opening hours                                    |
| `GET` / `POST` / `PATCH` / `DELETE` | `/facilities/:id/services[/:serviceId]`                 | Services                                               |
| `GET`                               | `/facilities/:id/staff`, `/facilities/:id/staff/manage` | Public staff list / owner view incl. fired staff       |
| `POST` / `PATCH`                    | `/facilities/:id/staff[/:staffId]`                      | Hire, rehire, fire                                     |
| `PUT`                               | `/facilities/:id/staff/:staffId/services`               | Assign services                                        |
| `GET` / `PUT`                       | `/facilities/:id/staff/:staffId/schedule`               | Staff weekly schedule                                  |
| `GET`                               | `/facilities/:id/availability`                          | Free slots for a service + staff member                |
| `GET` / `POST` / `PATCH`            | `/facilities/:id/bookings[/:bookingId]`                 | Venue bookings, create, change status                  |
| `POST`                              | `/facilities/:id/bookings/:bookingId/reviews`           | Leave a review                                         |
| `GET`                               | `/bookings/mine`                                        | Client's own bookings                                  |
| `GET`                               | `/staff/me`, `/staff/me/bookings`                       | Staff member's workplace and bookings                  |

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
```

`apps/frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 4. Migrate and seed

```bash
npm run backend:migrate
npm run db:seed --workspace=apps/backend
```

The seed creates venues in several countries, services, staff with schedules and sample bookings.

### 5. Run

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

### Demo accounts

| Role   | Email                  | Password      |
| ------ | ---------------------- | ------------- |
| Client | `client@slotbook.test` | `password123` |
| Owner  | `owner@slotbook.test`  | `password123` |

---

## Scripts

| Command                                     | What it does                                 |
| ------------------------------------------- | -------------------------------------------- |
| `npm run dev`                               | Backend and frontend together                |
| `npm test`                                  | All unit and integration tests               |
| `npm run typecheck`                         | TypeScript in every workspace                |
| `npm run lint` / `npm run format:check`     | ESLint / Prettier                            |
| `npm run backend:generate`                  | Generate a migration from the Drizzle schema |
| `npm run db:reset --workspace=apps/backend` | Drop, migrate and reseed the database        |

CI (GitHub Actions) runs typecheck, format check, lint and tests on every push and pull request.

---

## Design

The UI follows an **"appointment book"** concept, inspired by the paper booking journal at a salon reception: a warm sand-gold accent used only as a fill, an ink-navy contrast color for text, Bricolage Grotesque for headings and Onest for the interface, with tabular figures for every time and price. The selected slot is marked with a gold "highlighter", the same mark used on the landing page headline.

Accessibility work includes visible focus rings, 44px touch targets on mobile, contrast-checked status badges, loading skeletons and error boundaries, and animations that fall back to simple fades under `prefers-reduced-motion`.

---

## What I learned

- Designing a **contract-first API** with Zod shared between client and server.
- Enforcing business invariants **in the database** (exclusion constraints, unique indexes) instead of only in application code.
- Working with **time zones and time ranges** (`tstzrange`) correctly.
- Building the project in **vertical slices**: each feature goes from the database to the UI before the next one starts.
- Writing **integration tests against a real PostgreSQL** with Testcontainers.

## Possible next steps

- Email / Telegram notifications for new and confirmed bookings
- Dark theme toggle (design tokens are already in place)
- Configurable cancellation policy per venue
- Online payments

---

## Author

**Daniel** · [GitHub @Dapy0](https://github.com/Dapy0)
