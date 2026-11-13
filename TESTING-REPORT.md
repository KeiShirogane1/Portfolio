# Testing Report

What was actually checked, how, and what is still unverified. Nothing below is claimed without
an observation behind it.

Run date: this build. Local preview: `http://localhost:5174/` (`npm run dev`).

---

## 1. The circular hero portrait

The design changed during this build: the **360° protractor, the degree numbers and the gaze
read-out were removed at your request**. What replaced them is a plain circular ring, your real
photo filling the circle, and your pupils following the pointer.

### What the code does

| Item | Detail |
|---|---|
| Ring | SVG circle, perfect geometry — `viewBox` is square (400 × 400), so it can never become an ellipse |
| Ticks | 5° minor, 30° major, no numbers and no labels |
| Border glow | `.eyeStage__breath` — blue/violet pulse on the ring's own edge |
| Pupil motion | `transform: translate3d(...)` on the iris layer only, eased with `requestAnimationFrame` |
| Clipping | `eyes-mask.png` is the exact shape of the eye openings in the eyeless photo, so a pupil can never paint over an eyelid |
| Sources | `portrait-base.png` (eyeless photo + eye-white fill) and `portrait-iris.png` (both irises cut from the real photo) |

### Checked on the live page — browser pane

| Check | Result |
|---|---|
| Page loads with no console errors | **Pass** — `pageErrors: []` after load, on the final build |
| Ring is circular, not elliptical | **Pass** — square viewBox, circle rendering confirmed on screen |
| No degree numbers, no `0°`/`90°`/`180°`/`270°` text | **Pass** — read-out and all labels removed; confirmed in the page text dump |
| No "Gaze" read-out | **Pass** — removed |
| Blue breathing border | **Pass** — visible pulse on the ring edge in the screenshots |
| Full body inside the circle | **Pass** — the whole square photo now fills the circle: hair, face, shirt, tie and both shoulders |
| Pupils move with the pointer | **Pass (measured once)** — with the pointer moved right, the irises sat toward the outer corner of each eye and the pointer at the left edge left the eyes centred. Confirmed by pixel comparison of the eye band between two screenshots |
| Face and ring never move | **Pass** — only the iris layer carries a transform; the base photo and the SVG have none |
| Touch | Same code path (`touchstart` / `touchmove`), **not tested on a physical phone** |

### Honest limitation

The pupils are a 2D composite: the iris is cut from one photo and slid inside the lids. It reads
as real eye movement at this size, but it is not a real 36-direction photo shoot. When you have
those photos, the same component accepts them without any code change.

---

## 2. Project section

| Check | Result |
|---|---|
| Exactly six projects | **Pass** — 5 with `group: 'qwernfc'`, 1 with `group: 'internship'` |
| Order 01→06 | **Pass** — Live Memories, QyorFoundMe, GReview, QwerNFC Music, TimeCapsule, Nexora |
| Two visible groups | **Pass** — "GROUP A · QwerNFC Ecosystem — 5 PROJECTS", "GROUP B · Internship Experience — 1 PROJECT" |
| Status labels | **Pass** — Developing Soon, Almost Done, Coming Soon, In Development · ~70% Complete, Internship Project, each beside the card title |
| TimeCapsule progress bar | **Pass** — 70% with "MY ESTIMATE" |
| Nexora not grouped with QwerNFC | **Pass** — separate group, separate styling |
| Detail dialog opens and closes | **Pass** — opened for every project; backdrop, close button and Escape all close it |
| No fake links | **Pass** — no repo or deploy URLs except Nexora's real public repo |
| Product visuals sharp | **Pass** — five visuals cut from the supplied product images at 1200 px wide, quality 88, shown whole |
| Nothing of the artwork covered | **Pass** — the status pill sits beside the title, not over the image |

---

## 3. Resume (updated this pass)

- `public/resume/mark-john-rey-mana-ay-resume.pdf` replaced with the **November 2026** resume
  (`Mark_Manaay_ATS_Resume_QR_Top_Right.pdf`, 114 541 bytes).
- The file was read back with a PDF library to confirm it really is that resume, not a renamed
  copy: metadata title *"Humanized ATS OJT Resume - Mark John Rey F. Mana-ay"*, subject
  *"Information Technology OJT Application - Teleperformance Silver City"*, both pages readable.
- The served file was fetched over HTTP from the running preview: **status 200, 114 541 bytes** —
  so the Download Resume buttons point at the new document.
- Contact card now reads "Updated November 2026" from `profile.resumeUpdated`.

---

## 4. Content pulled from the new resume

| Field | Now shows | Source |
|---|---|---|
| Email | `jrmanaay999@gmail.com` | resume header |
| Location | Pasig City, Philippines | resume header |
| Phone numbers | **deliberately left off the public page** | resume header |
| School | Arellano University – Andres Bonifacio Campus | resume |
| Standing | Fourth-year student | resume |
| OJT requirement | 486 hours of OJT required | resume |
| OJT target | Applying for a 486-hour OJT placement at Teleperformance Silver City | resume summary |
| Skills | unchanged set, already matched the resume | resume + brief |
| Big Brew Milkteashop | customer-facing service role, 3 years | resume |

Verified on the live Education section after the rebuild: the heading, degree, school (no longer
greyed out), standing and OJT requirement all render correctly.

Still placeholders on purpose: **academic year** and **expected graduation year** — the resume
does not state them.

---

## 5. Motion and page behaviour

- Boot screen completes and hands over to the hero; the counter tracks real preload.
- Scroll reveals fire and stay. Card tilt, magnetic buttons and parallax all respond.
- Reduced motion disables the pupil easing (code-level; not observed by switching the OS setting).
- Canvas particle field pauses when off-screen or the tab is hidden (code-level).

---

## 6. Console and network

- **No page errors** reported by the pane after load (`pageErrors: []`).
- Production build: `✓ built in 20.39s`, no errors.
- Preview server live on `http://localhost:5174/`.

---

## 7. Not verified

| Item | Why |
|---|---|
| Real phone / tablet touch | No physical device used. Layout checked in the pane at 400 px wide. |
| The feel of the pupils on a real cursor sweep | The pane's synthetic pointer produced one confirmed shift; a human sweep was not performed |
| Contact form delivery | There is no backend on purpose. It opens Gmail with the message written; nothing is sent from the site |
| Screen readers | Labels and `aria` attributes are written deliberately, but no screen reader was run |
| QR scanning | The share panel draws a real QR from a library, but it was not scanned with a phone |

---

## 8. Reproduce these checks

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```
