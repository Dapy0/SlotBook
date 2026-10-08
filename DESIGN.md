# SlotBook Design System

Direction: **"Appointment book"** (Terminarz). The world is the paper appointment book at a barber's or salon's reception: a ruled day, times in a firm column, and a golden highlighter marking the slot that is yours. It lends the product four things only: a golden sand + ink palette, a confident grotesque for headings, timetable-style numerals, and one signature move. Layout, navigation and controls stay standard web patterns.

**Signature move: the highlighted slot.** Times are always set in tabular numerals in a column rhythm. The selected or upcoming slot is marked with the gold "highlighter" (solid primary fill, ink text). Gold means "this is your time / your action" and is never used for decoration.

The home page may be bolder (large type and an ink band). Everything else stays restrained: one family, dense where useful.

## Color

Strategy: Restrained neutrals tinted toward sand + one committed brand color (gold) + ink as the contrasting color. Ink bands (secondary) carry emphasis regions: footer CTA, booking summary on mobile, dashboard rail headings.

Tokens live in `apps/frontend/src/app/globals.css` (`:root` and `.dark`). Use tokens, never raw `gray-*`, `neutral-*`, `teal-*`.

| Token                    | Light                             | Dark                         | Use                                         |
| ------------------------ | --------------------------------- | ---------------------------- | ------------------------------------------- |
| `--background`           | `oklch(0.985 0.004 85)`           | `oklch(0.17 0.02 265)`       | page ground                                 |
| `--foreground`           | `oklch(0.22 0.025 265)` ink       | `oklch(0.96 0.01 85)`        | body text                                   |
| `--card`                 | `oklch(1 0 0)`                    | `oklch(0.21 0.022 265)`      | raised surfaces                             |
| `--primary`              | `oklch(0.81 0.13 82)` golden sand | `oklch(0.82 0.13 82)`        | primary action, selected slot, current nav  |
| `--primary-foreground`   | `oklch(0.22 0.025 265)`           | `oklch(0.2 0.025 265)`       | text on gold                                |
| `--brand-ink`            | `oklch(0.5 0.1 68)`               | `oklch(0.84 0.12 82)`        | gold-family text/links on light ground (AA) |
| `--secondary`            | `oklch(0.27 0.05 262)` ink navy   | `oklch(0.3 0.04 262)`        | contrast bands, dark buttons                |
| `--secondary-foreground` | `oklch(0.97 0.01 85)`             | `oklch(0.97 0.01 85)`        | text on ink                                 |
| `--muted`                | `oklch(0.955 0.012 85)`           | `oklch(0.25 0.02 265)`       | quiet fills, table heads                    |
| `--muted-foreground`     | `oklch(0.47 0.02 265)`            | `oklch(0.74 0.02 85)`        | secondary text (≥4.5:1)                     |
| `--accent`               | `oklch(0.94 0.045 85)`            | `oklch(0.3 0.03 265)`        | hover / soft selection                      |
| `--border` / `--input`   | `oklch(0.9 0.012 85)`             | `oklch(1 0 0 / 10%)` / `15%` | hairlines, fields                           |
| `--ring`                 | `oklch(0.6 0.12 72)`              | `oklch(0.8 0.12 82)`         | focus                                       |
| `--success`              | `oklch(0.47 0.11 155)`            | `oklch(0.75 0.13 155)`       | confirmed                                   |
| `--warning`              | `oklch(0.5 0.12 60)`              | `oklch(0.82 0.13 80)`        | pending                                     |
| `--destructive`          | `oklch(0.52 0.2 28)`              | `oklch(0.7 0.18 25)`         | cancel, errors                              |

Status mapping: `pending` → warning tint, `confirmed` → success tint, `cancelled` → muted, `completed` → ink outline.
Category colors: a single muted family (low-chroma tints, same lightness), used only as a small dot.

## Typography

- **Display / headings:** Bricolage Grotesque (600–700), `font-heading`. Tracking -0.02em on ≥2xl.
- **UI / body:** Onest (400/500/600), `font-sans`. One family across controls, labels, data.
- **Numerals:** `tabular-nums` for every time, price, count (`.nums` utility).

Scale (rem, product ratio ~1.2; home hero may go to 4.5rem):
`xs 0.75` · `sm 0.875` · `base 1` · `lg 1.125` · `xl 1.25` · `2xl 1.5` · `3xl 1.875` · `4xl 2.25` · `display clamp(2.5rem, 6vw, 4.5rem)` (home only).
Body line-height 1.55, headings 1.15. Prose max 68ch.

## Spacing

Tailwind 4px grid. Rhythm: inside components 2–4, between related groups 4–6, between sections 12–16 (home 20–24). More space above a heading than below it. Page gutter: `px-4` mobile, `px-6` md, `px-8` lg; content max `max-w-6xl`.

## Radius

`--radius: 0.625rem` (10px). Inputs/buttons `rounded-md` (8px), cards `rounded-xl` (14px), chips & slot pills `rounded-full`, modals `rounded-2xl`. No other radii.

## Shadow

Ink-tinted, offset + blur, never zero-offset halos:

- `--shadow-sm: 0 1px 2px oklch(0.22 0.025 265 / 0.06)` — fields, buttons outline
- `--shadow-md: 0 6px 16px -6px oklch(0.22 0.025 265 / 0.12)` — cards on hover, popovers
- `--shadow-lg: 0 18px 40px -12px oklch(0.22 0.025 265 / 0.22)` — modals, sticky mobile bar

## Components

- **Button:** `default` gold fill + ink text (one per view region); `secondary` ink fill; `outline` white + border; `ghost`; `destructive` tinted; `link` uses `--brand-ink`. Height 36px (sm 32, lg 44 for mobile primary). Focus: 3px ring at `--ring/50`. Loading: spinner + verb in progress ("Booking…").
- **Input / Select:** 36px, `rounded-md`, `--input` border, white fill on light, placeholder `muted-foreground`. Errors: destructive border + message under the field naming the fix.
- **Card:** white, 1px `--border`, `rounded-xl`, no shadow at rest; `--shadow-md` on hover only if the whole card is a link.
- **Slot pill (signature):** `rounded-full`, tabular numerals, outline at rest, gold fill when selected, struck-through muted when unavailable.
- **Navigation:** top bar on white with bottom hairline; logo wordmark "slot" ink + "book" in `--brand-ink`; current item underlined with a 2px gold bar. Mobile: logo + menu button; links in a sheet. Dashboard: left rail on `--muted` (collapses into a horizontal scroll tab bar under `md`).
- **Tabs:** one style everywhere: underline tabs (2px gold bar on active).
- **Badge:** status tints only (see Status mapping). No decorative badges.
- **Modal / dialog:** `rounded-2xl`, `--shadow-lg`, ink scrim at 40%. Prefer inline confirmation; modals only for destructive confirmation that needs focus.
- **Empty state:** one sentence of what's missing + one action.

## Motion

150–250ms, ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`). Motion conveys state only. All motion respects `prefers-reduced-motion`.
