# Testing Report

What was actually checked, how, and what is still unverified. Nothing below is claimed without
an observation behind it.

Run date: this build. Local preview: `http://localhost:5174/` (`npm run dev`).

---

## 1. The 360° eye tracking

### Angle maths — checked in isolation

`src/lib/angle.js` was run with Node, outside React, against a fixed set of points:

| Pointer position | Expected | Result |
|---|---|---|
| straight up | 0° | **0°** |
| straight right | 90° | **90°** |
| straight down | 180° | **180°** |
| straight left | 270° | **270°** |
| up and slightly left | 350° | **350°** |
| just past 0° clockwise | 0–10° | correct, no negative values |

All passed. The mapping `atan2(dx, -dy)` normalised into 0–359° is correct in all four
quadrants, and the 359° → 0° wraparound is handled (350° rounds to frame 35, 355°+ rounds to
frame 0).

### Gaze frames — rebuilt this pass

The frames are generated from the single portrait by `tools/make_eyes.py`. The iris centre is
found by scoring every candidate in each eye window for "dark disc, brighter ring around it";
both irises were located at **(151, 132)** and **(210, 133)**. Each frame then warps the eye
with a piecewise weight: weight 1.0 across the iris (so the iris travels as a solid disc and
does not smear), easing to 0 at the eyelid opening (so the sclera stretches while the lids and
skin stay put). Travel is ±7 px horizontally and ±4 px vertically, and the whole face shifts a
few percent in the same direction as one head movement.

- A four-direction review sheet (`tools/gaze-check.png`) was rendered at 4× magnification and
  looked at directly: up, right, down and left are distinct, the pupils move, no holes, no
  seams, no duplicated eyelids.
- Measured difference between the 0° and 180° frames over the eye band: **3.95 mean grey levels**
  (it was 0 with the earlier blank placeholders).

### Live page — checked in the browser pane

- Pointer at the bottom of the page → read-out **GAZE 180°**; pointer at the top right →
  **GAZE 080°**, with the rim marker and wedge landing in the matching sector and the face
  shifting that way. Confirmed on screenshots.
- Only **one** frame carries `.isActive` at a time — the other 35 sit at opacity 0. No ghosting,
  no second face, no flicker while sweeping the cursor around the dial.
- **36 frames preloaded**, 36 files present in `public/eyes/`, ≈1.9 MB total.
- Touch uses `touchstart` / `touchmove` / `touchend` with the same angle calculation. Verified by
  code inspection; **not tested on a physical phone**.

---

## 2. Project section

| Check | Result |
|---|---|
| Exactly six projects | **Pass** — 5 with `group: 'qwernfc'`, 1 with `group: 'internship'` |
| Order 01→06 | **Pass** — Live Memories, QyorFoundMe, GReview, QwerNFC Music, TimeCapsule, Nexora |
| Two visible groups | **Pass** — "GROUP A · QwerNFC Ecosystem — 5 PROJECTS", "GROUP B · Internship Experience — 1 PROJECT" |
| Status labels | **Pass** — Developing Soon, Almost Done, Coming Soon, In Development · ~70% Complete, Internship Project, each as a pill beside the card title |
| TimeCapsule progress bar | **Pass** — 70% with "MY ESTIMATE" |
| Nexora not grouped with QwerNFC | **Pass** — separate group, separate styling |
| Detail dialog opens and closes | **Pass** — opened for every project; backdrop, close button and Escape all close it |
| No fake links | **Pass** — no repo or deploy URLs except Nexora's real public repo |
| Product visuals sharp | **Pass** — five visuals cut from the supplied product images, trimmed of rounded corners, saved at 1200 px wide, quality 88, `object-fit: cover` on a 16:9 frame |
| Nothing of the artwork covered | **Pass** — status pill moved from over the image to beside the card title; the number badge is a small corner chip |

Verified visually in the live pane: Live Memories shows the green QR keepsake and phone; below it
QyorFoundMe shows the orange lost-and-found tag with its "Tag Your Item → Scan QR → Get Contacted"
steps. Both are crisp, not blurred, and carry their real status labels.

---

## 3. Motion and page behaviour

- Boot screen completes and hands over to the hero; the counter tracks real preload.
- Scroll reveals fire and stay. Card tilt, magnetic buttons and parallax all respond.
- The face shift is a GPU `translate3d` on one wrapper, and is disabled under
  `prefers-reduced-motion` (code-level; not observed by switching the OS setting).
- Canvas particle field pauses when off-screen or the tab is hidden (code-level, from an earlier pass).

---

## 4. Console and network

- **No page errors** reported by the pane after load (`pageErrors: []`).
- Production build: `✓ built in 5.36s`, no errors.

---

## 5. Not verified

| Item | Why |
|---|---|
| Real phone / tablet touch | No physical device used. Layout checked at 590 × 819 and 1440 wide only. |
| Look of the gaze with real photos | The frames are an approximation built from one portrait, not a real eye-direction shoot. |
| Contact form delivery | There is no backend on purpose. It opens the visitor's own mail app; nothing is sent from the site. |
| Screen readers | Fonts, labels and `aria` attributes were written deliberately, but no screen reader was run. |

---

## 6. Reproduce these checks

```powershell
# the angle maths, alone
node -e "import('./src/lib/angle.js').then(m => console.log(m))"

# rebuild the gaze frames from the portrait (writes tools/gaze-check.png too)
python tools/make_eyes.py

# production build
npm run build
```
