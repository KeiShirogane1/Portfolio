# Mark John Rey F. Mana-ay — Portfolio

A dark, futuristic developer portfolio built with **React + Vite**, with a signature
**circular hero portrait**: your photo sits inside a ring and the pupils in your eyes follow the
pointer, in every direction, with no numbers on the dial.

---

## 1. The six featured projects (fixed lineup)

| # | Project | Group | Status |
|---|---------|-------|--------|
| 01 | Live Memories | QwerNFC | Developing Soon |
| 02 | QyorFoundMe | QwerNFC | Developing Soon |
| 03 | GReview | QwerNFC | Almost Done |
| 04 | QwerNFC Music | QwerNFC | Coming Soon |
| 05 | TimeCapsule | QwerNFC | In Development · ~70% Complete |
| 06 | Nexora | Internship Project | Internship Project |

Groups are rendered as two blocks: **A — QwerNFC Ecosystem** and **B — Internship Experience**.
Nexora is never presented as a QwerNFC product. The exact order, names and statuses live in one
place: `src/data/projects.js`.

---

## 2. Run it locally

```bash
cd portfolio
npm install        # only needed the first time
npm run dev
```

Open the URL the terminal prints (usually **http://localhost:5173/**).

Production build:

```bash
npm run build
npm run preview
```

---

## 3. Where things live

```
portfolio/
├─ index.html                  # SEO metadata, fonts, JSON-LD person schema
├─ public/
│  ├─ portrait.png             # the centre portrait
│  ├─ eyes/                    # 36 gaze frames generated from portrait.png
│  ├─ projects/
│  │  ├─ greview/              # product visual (card + capture)
│  │  ├─ qwernfc-music/        # product visual (card + capture)
│  │  ├─ timecapsule/          # product visual from the supplied sheet
│  │  ├─ live-memories/        # product visual from the supplied sheet
│  │  ├─ qyorfoundme/          # product visual from the supplied sheet
│  │  ├─ nexora/               # clearly-labelled illustrative mockups
│  │  └─ _unattributed/        # a reference tile that could not be matched to a product
│  └─ resume/                  # downloadable resume (PDF + text copy)
├─ src/
│  ├─ main.jsx  App.jsx
│  ├─ lib/        angle.js, motion.js, assets.js
│  ├─ hooks/      useRevealGroup, useParallax, useCardDepth, useMagnetic
│  ├─ components/ EyeProtractor, BootScreen, ParticleField, SplitText,
│  │              Nav, Hero, About, Skills, Projects, Experience,
│  │              Education, AIExperiments, Contact, Footer
│  ├─ data/       profile.js, skills.js, projects.js, experience.js, ai.js
│  └─ styles/     tokens.css, base.css, nav.css, protractor.css,
│                 sections.css, motion.css
├─ tools/                      # asset scripts (run once, not part of the site)
│  ├─ make_eyes.py             # rebuilds the 36 gaze frames from portrait.png
│  └─ slice_assets.py          # cuts the product sheet into card visuals
```

**Edit content, not components.** Name, email, resume path and tagline are in
`src/data/profile.js`. Skills in `src/lib`-free `src/data/skills.js`. Project copy in
`src/data/projects.js`. Experience, the internship block and education in
`src/data/experience.js`.

---

## 4. The interactive portrait (hero)

The portrait sits in a circular ring. There are **no degree numbers, no `0°`/`90°` labels and no
gaze read-out** — the only thing that moves is the eyes.

**How the pupils move**

| Step | What happens |
|------|--------------|
| 1 | The pointer position is read against the **centre of the ring** on every move. |
| 2 | Direction and distance from the centre give a target offset: `dx/d`, `dy/d`, scaled by distance so the pupils lean further the further away the cursor is. |
| 3 | Only `transform: translate3d(...)` is animated, eased with `requestAnimationFrame` — the photo, the ring and the page never move. |
| 4 | The iris layer is clipped by `eyes-mask.png`, the exact shape of the openings in the eyeless photo, so a pupil can never paint over an eyelid. |
| 5 | Pointer, mouse, touch and pen all drive the same code path. Leaving the page settles the eyes back to centre. |

**Layers, bottom to top** (`EyeProtractor.jsx`)

1. `portrait-base.png` — your photo with the eye openings filled to eye-white
2. `portrait-iris.png` — both irises cut from the real photo, moved by the pointer
3. the SVG ring — circular border and 5°/30° tick marks
4. the breathing halo — blue-violet light pulsing on the border

**Reduced motion:** the easing constant becomes 1, so the pupils jump straight to the pointer
position with no animation.

---

## 5. Motion system

| Layer | Where | What it does |
|-------|-------|--------------|
| Boot | `BootScreen.jsx` | Orbit rings assemble while a **measured** counter tracks the real preload of the portrait layers. No fake percentage. |
| Headlines | `SplitText.jsx` | Letters stagger in per word; the full string stays in `aria-label` for screen readers. |
| Reveals | `useRevealGroup` | Sections rise into place once, then stay. |
| Depth | `useCardDepth` | Project cards tilt in 3D with light that follows the cursor. |
| Magnetism | `useMagnetic` | Buttons lean toward the pointer, then snap back. |
| Parallax | `useParallax` | Hero atmosphere drifts slower than the page. |
| Atmosphere | `ParticleField.jsx` | Canvas 2D motes; paused off-screen and on hidden tabs. |
| Detail view | `Projects.jsx` | Cards emerge from depth; the dialog zooms in and plays a real exit animation. |

Hero rings, rim marker and read-out are CSS/SVG only, so nothing competes with the portrait and
the angle mapping is never disturbed.

---

## 6. Accuracy rules baked into the content

- **No invented features, dates, job titles or certificates.** Where something is unconfirmed the
  copy says so instead of guessing.
- **Statuses are honest:** Developing Soon, Coming Soon, Almost Done, ~70% Complete, Internship Project.
- **TimeCapsule's 70% is your own estimate** and is labelled as one — not test coverage.
- **Nexora's ML is described as ML-assisted.** A Naive Bayes classifier predicts the performance
  category; sentiment, competency and recommendations are *derived* from that label. The optional
  SVM comparison is mentioned only as an optional comparison model.
- **Screenshots are the real thing or clearly labelled.** GReview and QwerNFC Music are real
  captures. Nexora's visuals carry an on-image caption saying they are illustrative mockups.
- **No repository, deployment or social links that are not real.** Nexora links to its public
  repository at `github.com/KeiShirogane1/Nexora`; QwerNFC repos stay private and unlinked.

## 7. Accessibility

- Reveals are skipped under `prefers-reduced-motion: reduce`.
- The dial announces its current gaze direction.
- Skill categories are a real tablist with arrow-key movement.
- The project dialog traps focus, closes on Escape, and is labelled by its heading.
- A skip link is the first focusable element.
- Form fields use real labels, `aria-invalid` and `aria-describedby`.

## 8. Still missing from you

See **`MISSING-ASSETS.md`** for the exact files needed, and **`TESTING-REPORT.md`** for what was
checked and what is still open.
