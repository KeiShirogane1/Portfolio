"""Slice the supplied product sheet into five sharp card visuals,
and make a zoomed preview of the portrait's eye region."""
import os

from PIL import Image

SHEET = r"D:\.PORTFOLIO\.hormachuelos\attachments\image 5.png"
OUT = r"D:\.PORTFOLIO\portfolio\public\projects"

sheet = Image.open(SHEET).convert("RGB")
print("sheet", sheet.size)

# (name, folder, left, top, right, bottom) -- inset a few px to clear the rounded corners
TILES = [
    ("greview-card", "greview", 20, 54, 543, 466),
    ("qwernfc-music-card", "qwernfc-music", 558, 54, 1092, 466),
    ("timecapsule-card", "timecapsule", 1108, 54, 1653, 466),
    ("live-memories-card", "live-memories", 20, 482, 820, 888),
    ("qyorfoundme-card", "qyorfoundme", 836, 482, 1653, 888),
]

for name, folder, l, t, r, b in TILES:
    crop = sheet.crop((l, t, r, b))
    os.makedirs(f"{OUT}/{folder}", exist_ok=True)
    path = f"{OUT}/{folder}/{name}.jpg"
    crop.save(path, "JPEG", quality=92, optimize=True, subsampling=0)
    print(f"{path}  {crop.size}")

# zoomed eye preview so the frame generator can be placed precisely
portrait = Image.open(r"D:\.PORTFOLIO\portfolio\public\portrait.png").convert("RGB")
print("portrait", portrait.size)
eye = portrait.crop((110, 110, 260, 200)).resize((600, 360), Image.LANCZOS)
eye.save(r"D:\.PORTFOLIO\portfolio\tools\eye-zoom.png")
print("eye zoom saved")
