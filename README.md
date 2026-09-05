# CoachMed

Medication check-ins that reach the practice before the review.

A GP's medication review currently starts with "are you taking these?" and a guess. CoachMed turns the guess into a record: patients log doses on a blister-pack screen that mirrors the object in their hand, and the practice sees adherence, stopped medicines, and the patient's own words — before the appointment.

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000/demo](http://localhost:3000/demo).

## Routes

| Route | What it is |
|---|---|
| `/demo` | The pitch view — patient phone and GP dashboard side by side, one shared store. Tap a dose on the left, watch the GP numbers move on the right. |
| `/patient` | The patient app alone (Ellen Harkin, the demo patient). |
| `/gp` | The GP dashboard alone. |

**Demo controls:** press `R` on `/demo` to reset all data. Add `?scripted=1` to play the demo sequence hands-free.

## The demo script

1. Tap the 8am metformin on Ellen's blister pack — it pops, logs, and the GP adherence figure moves on the right. One tap, no typing.
2. Open gliclazide → "Something doesn't feel right" → type how it made her feel. That text is the information that currently never reaches anyone.
3. On the GP side, Ellen is pinned to the top with flags. Open her: metformin fine, gliclazide stopped with her exact words, atorvastatin scattered.
4. Assign the flag to a named duty GP. Audit trail, nothing auto-resolves.

## How it works

One Next.js app, no backend by design: both views read one Zustand store persisted to `localStorage`, so the demo cannot fail on stage networking. Flags are **derived, not stored** — `lib/adherence.ts` computes adherence, supply, and flags (e.g. three missed doses of one medicine in seven days ⇒ a `missed_pattern` flag) from the dose log alone. That derivation is the product.

Known limitation, named on purpose: no EHR write-back — the output is a structured summary the practice reads, not a record we edit.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Zustand · Framer Motion. Seed data lives in `lib/seed.ts` (four patients, all fictional; NHS numbers are fake).
