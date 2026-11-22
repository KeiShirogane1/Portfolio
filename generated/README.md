# System flow — what was built, and how to check it

This folder holds the result of the node-graph UI work and the notes on how the
site talks to Cloudflare and its data.

| File | What it is |
|---|---|
| `system-flow.png` | Screenshot of the live section |
| `connection-notes.md` | Request flow, deployment, config and where credentials live |

---

## What the page now shows

A new section, **05 — System**, sits between Projects (04) and Skills (06) in
the portfolio. It renders one node graph, styled from the reference image:

- **Nodes** are rounded dark plates carrying a real brand icon — a bolt for the
  trigger, GitHub for the build, Cloudflare for the host, React for the outcome.
- **Solid hairlines** join the main chain; **dashed blue lines** drop to the
  three resources a deploy depends on.
- **Words on the lines** (`source`, `role`, `deployed`) say what travels along
  each hop.
- **The fork** ends in a Success node and a Failure node side by side.

### No borders

The requirement was no borders, so the plates are defined by **fill, radius and
shadow only**. Verified by grepping the two files this work touched:

```
src/styles/flows.css        → only border-radius declarations
src/components/SystemFlow.jsx → no border at all
```

`border-radius` is a corner curve, not a border; nothing draws a line around a
shape.

### Reference vs result

| Reference detail | In the build |
|---|---|
| Lightning-bolt trigger on a rounded plate | Rust-toned bolt on a tall rounded plate |
| Labelled plate in the middle | "Build — Vite compiles the site" |
| Word printed on the connector | `source`, `role`, `deployed` |
| true / false fork into two outcomes | Success / Failure stack |
| Dashed drops to tools underneath | Three dashed drops to Actions, data, local builder |
| Dark, near-black canvas | Same page background as the rest of the site |

Difference worth knowing: the reference used colourful Slack/GitHub marks at
full saturation. Here the icons are the project's own local SVGs, so they match
the palette already in use.

---

## Files changed

- `src/components/SystemFlow.jsx` — new component
- `src/styles/flows.css` — new stylesheet
- `src/App.jsx` — renders `<SystemFlow />` between Projects and Skills
- `src/main.jsx` — imports `flows.css`
- `src/data/sections.js` — adds `system` at 05 and renumbers the rest
- `src/components/IDEShell.jsx` — `system-flow.jsx` appears in the explorer
- `src/components/Skills.jsx`, `src/components/Contact.jsx`,
  `src/data/experience.js`, `src/data/certifications.js`, `src/data/ai.js` —
  eyebrow numbers bumped to match the new order
- `tools/renumber_sections.py` — the one-pass renumbering script

Everything else in the project was left as it was.

---

## How to check it

```bash
cd portfolio
npm run dev          # http://localhost:5173
```

Then scroll past Projects, or open the explorer file `system-flow.jsx`.

Production build check:

```bash
npm run build        # 117 modules, no errors
npm run preview      # runs the Worker locally via wrangler dev
```

The build was run after the changes and passed. The live page was opened and
reported **0 page errors**.

---

## What I could not verify

- **Desktop width.** Only a ~520 px pane was available on this machine, so the
  wide layout of the graph is unverified. The graph keeps a minimum width and
  scrolls sideways inside its own card, so it cannot overflow the page.
- **No automated tests.** This project has no test suite; the checks were the
  Vite build, a live page read, and greps for the no-border rule.
