"""Build the live-eye layers from your own photos.

Everything here is measured, not guessed:

  * the eye openings are exactly the pixels that differ between
    `me.png` and `me noeyes.png` (193 of them), so the clip window is
    literally the shape you painted out;
  * the irises are cut from your untouched photo, so they are your
    real eyes, not something drawn;
  * the eye-white tone is sampled from the bright pixels inside that
    same opening, so the bed matches your skin lighting.

Outputs (1440x1440, head-and-shoulders crop so the face fills a circle):

  public/portrait-base.png   eyeless photo, opening filled with eye-white
  public/portrait-iris.png   both real irises, feathered, transparent elsewhere
  public/eyes-mask.png       the two openings, used as a CSS clip on the irises
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

REAL = r"D:\.PORTFOLIO\.hormachuelos\attachments\me.png"
BLANK = r"D:\.PORTFOLIO\.hormachuelos\attachments\me noeyes.png"
OUT_BASE = r"D:\.PORTFOLIO\portfolio\public\portrait-base.png"
OUT_IRIS = r"D:\.PORTFOLIO\portfolio\public\portrait-iris.png"
OUT_MASK = r"D:\.PORTFOLIO\portfolio\public\eyes-mask.png"
PREVIEW = r"D:\.PORTFOLIO\portfolio\tools\eyes-preview.png"

# The WHOLE photo, uncropped: head, shoulders, shirt, tie and suit all stay
# inside the circular frame, so the body is visible instead of a tight face crop.
CROP = (0, 0, 360, 360)           # the full 360 x 360 original
N = 1440
S = N / 360                       # scale factor for every coordinate below

real = Image.open(REAL).convert("RGB").crop(CROP)
blank = Image.open(BLANK).convert("RGB").crop(CROP)
ra = np.asarray(real).astype(np.float32)
ba = np.asarray(blank).astype(np.float32)
lum = ra.mean(axis=2)

# --------------------------------------------------------------- openings
# Where the blank differs from the real photo is where the eyes were painted out.
diff = np.abs(ra - ba).max(axis=2) > 9
print("painted px:", int(diff.sum()))

opening = Image.fromarray((diff * 255).astype(np.uint8))
opening = opening.filter(ImageFilter.MaxFilter(3))      # grow 1 px: no white rim leaks
# Feather in the ORIGINAL 360 px space, before enlarging, so the edge never
# becomes a pixel staircase when it is scaled up 4x.
opening = opening.filter(ImageFilter.GaussianBlur(1.6))
op = np.asarray(opening) > 12

# Eye-white: the real sclera is never pure white — it is a warm off-white, so the
# sampled tone is pulled toward a neutral eye-white instead of kept raw (the raw
# sample lands on lid skin and reads as a muddy patch).
sel = op & (lum > np.percentile(lum[op], 78))
sampled = np.median(ra[sel], axis=0) if sel.any() else np.array([198.0, 190.0, 182.0])
NEUTRAL = np.array([186.0, 180.0, 174.0])
tone = np.clip(0.35 * sampled + 0.65 * NEUTRAL, 0, 255)
print("eye-white tone:", tone.round(1), "from", int(sel.sum()), "px")

# --------------------------------------------------------------- base layer
blank_big = blank.resize((N, N), Image.LANCZOS)
mask_big = opening.resize((N, N), Image.LANCZOS)

bn = np.asarray(blank_big).astype(np.float32)
m = np.asarray(mask_big).astype(np.float32) / 255.0

# Replace the pure-white fill with your own eye-white.
# Replace the pure-white fill with a shaded eye-white:
#   core      = the middle of the opening, full tone
#   edges     = fall off toward the lids, where sclera sits in shadow
# A hard flat patch is exactly what makes a composited eye look fake.
mask_big_f = mask_big.filter(ImageFilter.GaussianBlur(10))
m_core = np.asarray(mask_big_f).astype(np.float32) / 255.0
m_soft = np.asarray(mask_big.filter(ImageFilter.GaussianBlur(22))).astype(np.float32) / 255.0
shade = 0.42 + 0.58 * np.clip(m_core / np.maximum(m_soft, 1e-3), 0.0, 1.0)
bn = bn * (1.0 - m[..., None]) + tone * (shade[..., None] * m[..., None])

# A whisper of lid shadow just inside the rim, heavier along the top edge where the
# upper lid sits, so the opening reads as an eye and not a painted patch.
inner = mask_big.filter(ImageFilter.MinFilter(5))
rim = np.clip(m - np.asarray(inner).astype(np.float32) / 255.0, 0.0, 1.0)
rim = Image.fromarray((rim * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))
rim = np.asarray(rim).astype(np.float32) / 255.0 * 0.22

# Top bias: the same mask shifted down, so the overlap only covers the upper lid line.
top = np.asarray(
    Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))
).astype(np.float32) / 255.0
shifted = np.zeros_like(top)
shifted[6:] = top[:-6]
rim += np.clip(top - shifted, 0.0, 1.0) * 0.55
rim = np.clip(rim, 0.0, 0.75)
bn = bn * (1.0 - rim[..., None])

base = Image.fromarray(np.clip(bn, 0, 255).astype(np.uint8))
base.save(OUT_BASE)
print("wrote", OUT_BASE, base.size)

# --------------------------------------------------------------- iris layer
# Centres in CROP coordinates, from the painted openings in the original.
EYES = [dict(label="L", cx=150.7, cy=132.0), dict(label="R", cx=208.6, cy=132.5)]
IRIS_RX, IRIS_RY = 6.8, 5.6

real_big = real.resize((N, N), Image.LANCZOS)
iris = Image.new("RGBA", (N, N), (0, 0, 0, 0))

for e in EYES:
    cx, cy = e["cx"] * S, e["cy"] * S
    rx, ry = IRIS_RX * S, IRIS_RY * S
    box = (int(cx - rx), int(cy - ry), int(cx + rx), int(cy + ry))
    patch = real_big.crop(box).convert("RGBA")

    a = Image.new("L", patch.size, 0)
    ImageDraw.Draw(a).ellipse([0, 0, patch.size[0] - 1, patch.size[1] - 1], fill=255)
    a = a.filter(ImageFilter.GaussianBlur(1.2))
    patch.putalpha(a)

    iris.alpha_composite(patch, box[:2])
    print(f"iris {e['label']}: centre ({e['cx']},{e['cy']}) box {box}")

iris.save(OUT_IRIS)
print("wrote", OUT_IRIS)

# --------------------------------------------------------------- clip window
# CSS mask-image uses the ALPHA channel, so the soft shape is written as alpha.
rgba = Image.new("RGBA", (N, N), (255, 255, 255, 0))
rgba.putalpha(mask_big)
rgba.save(OUT_MASK)
print("wrote", OUT_MASK, "(alpha mask)")

# --------------------------------------------------------------- preview sheet
band = (int(130 * S), int(120 * S), int(230 * S), int(145 * S))
cm = np.asarray(mask_big).astype(np.float32) / 255.0


def compose(dx, dy):
    shifted = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    shifted.paste(iris, (int(round(dx * S)), int(round(dy * S))))
    al = np.asarray(shifted.getchannel("A")).astype(np.float32) / 255.0
    shifted.putalpha(Image.fromarray((al * cm * 255).astype(np.uint8)))
    comp = base.convert("RGBA")
    comp.alpha_composite(shifted)
    return comp.convert("RGB").crop(band)


# Circular framing check: exactly what the hero will clip.
CIRC = r"D:\\.PORTFOLIO\\portfolio\\tools\\circle-preview.png"
D = 370
fg = base.convert("RGB").resize((D, D), Image.LANCZOS)
mask = Image.new("L", (D, D), 0)
ImageDraw.Draw(mask).ellipse([0, 0, D - 1, D - 1], fill=255)
plate = Image.new("RGB", (D + 16, D + 16), (8, 11, 18))
plate.paste(fg, (8, 8), mask)
plate.save(CIRC)
print("circle preview", CIRC)

tiles = [("rest", 0, 0), ("left", -2.9, 0), ("right", 2.9, 0), ("up", 0, -0.8), ("down", 0, 0.9)]
tw, th = band[2] - band[0], band[3] - band[1]
sheet = Image.new("RGB", (tw, th * len(tiles)), (8, 11, 18))
for i, (_, dx, dy) in enumerate(tiles):
    sheet.paste(compose(dx, dy), (0, i * th))
sheet.save(PREVIEW)
print("preview", PREVIEW, sheet.size)
