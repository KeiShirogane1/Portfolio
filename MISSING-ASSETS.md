# Missing Assets — what to drop in, and where

Everything the site needs to look finished. Each item lists the exact path and the format.

---

## 1. The eyes (the signature feature)

The hero is **not** 36 images any more. It is three layers built from your own two photos:

| File | What it is |
| --- | --- |
| `public/portrait-base.png` | your eyeless photo, with the two eye openings filled using your own eye-white tone |
| `public/portrait-iris.png` | both irises cut from your untouched photo, feathered, transparent elsewhere |
| `public/eyes-mask.png` | the two eye openings, used as a CSS clip so a pupil can never paint over your lids |

All three are generated — never hand-edited — by:

```
python tools/build_live_eyes.py
```

It reads `me.png` and `me noeyes.png`, takes the difference between them to find the
openings (193 px, exact), cuts the irises at the measured centres, and writes the three files
at 1440 × 1440.

The pupils slide inside the openings as the pointer moves, and the ring's degree labels,
active tick and glowing arc follow the same angle. **Nothing else in the photo moves.**

To swap in better eye photos later, keep these rules:

- Both photos the same framing, same crop, same lighting, same size.
- Eyes open, looking straight ahead, in the untouched photo.
- Only the eyes painted out in the second photo — nothing else changed.
- Then re-run the script above. No code changes needed.

**Nothing is missing here right now.** If you later shoot a real 36-frame session, the hero
could be switched back to image-swapping, but the layer approach looks more natural with one photo.

---

## 2. Portrait photo (used by the hero)

`public/portrait-base.png` — already built from your photo.

What the hero expects: a head-and-shoulders crop, face centred, plain background.
`tools/build_live_eyes.py` crops with `CROP = (44, 6, 316, 278)` from the 360 px original and
scales to 1440 px. Change that one tuple if you send a higher-resolution photo.

---

## 3. Project images

`public/projects/<project>/` — one folder per project.

| Project | Folder | Status of the image |
| --- | --- | --- |
| Live Memories | `live-memories/` | real panel from your sheet, sharp, 1200 px JPEG |
| QyorFoundMe | `qyorfoundme/` | real panel from your sheet, sharp, 1200 px JPEG |
| GReview | `greview/` | real panel from your sheet, sharp, 1200 px JPEG |
| QwerNFC Music | `qwernfc-music/` | real panel from your sheet, sharp, 1200 px JPEG |
| TimeCapsule | `timecapsule/` | real panel from your sheet, sharp, 1200 px JPEG |
| Nexora | `nexora/` | **illustrative layouts** based on the real Flask app, labelled as such |

TimeCapsule has only one verified visual. Its other reference images (the bottom tiles of your
sheet) showed a different app, so they were left out rather than mislabelled. Add more
TimeCapsule screenshots and they can go into `timecapsule/`.

---

## 4. Resume

`public/resume/mark-john-rey-mana-ay-resume.pdf` — **updated November 2026** with the new
`Mark_Manaay_ATS_Resume_QR_Top_Right.pdf` (114 KB, includes the QR profile block).

`public/resume/mark-john-rey-mana-ay-resume.txt` is a text copy extracted from that same PDF,
kept so the content can be checked without opening the PDF.

To update the site with a newer resume later, replace the PDF and keep the same filename, or change
`resumeHref` in `src/data/profile.js`. The card in Contact also shows `resumeUpdated`, so update
that date at the same time.

---

## 5. Contact details

`src/data/profile.js`

- `email: 'jrmanaay999@gmail.com'`
- `location: 'Pasig City, Philippines'`

Both come from the current resume. The two mobile numbers on the resume (`0934 827 238` and
`0945 886 6105`) were deliberately kept off the public page — email is the contact route on the site.

---

## 6. Facts still open (on purpose)

These are left blank or general rather than invented:

- **Big Brew Milkteashop** — exact job title and start/end dates.
- **Education** — academic year and expected graduation date (school is confirmed:
  Arellano University – Andres Bonifacio Campus).
- **GitHub and LinkedIn** — no links published. The QwerNFC repositories are private, and there
  is no LinkedIn profile. Add them to `src/data/profile.js` when they exist.
- **TimeCapsule** — the "~70%" figure is your own estimate and is labelled that way on the card.

---

## Quick checklist

- [x] Hero portrait and eye layers built
- [x] Five QwerNFC product panels in place, sharp
- [x] Nexora illustrative layouts, clearly labelled
- [x] Resume PDF present
- [ ] Job title and dates for Big Brew
- [ ] Academic year and graduation date
- [ ] Decide whether to publish GitHub
