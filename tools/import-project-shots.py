"""Import the real TimeCapsule and GReview screenshots into the portfolio.

Screenshots are assigned by the product named in the app header, not by their
attachment order, so nothing is filed under the wrong project:

  green accent, header "QwerNFC GReview"     -> public/projects/greview/
  teal accent,  header "QwerNFC TimeCapsule" -> public/projects/timecapsule/

Each image is scaled down to a phone-friendly width and saved as JPEG so the
pages stay light. Originals are never modified.
"""
from pathlib import Path
from PIL import Image

SRC = Path(r"D:\.PORTFOLIO\.hormachuelos\attachments")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "projects"

GREVIEW = [
    ("Screenshot_20261117-175726.jpg", "greview-locations.jpg",
     "Business locations on the map, with managed QR and NFC counts"),
    ("Screenshot_20261117-175729.jpg", "greview-codes.jpg",
     "QR code dashboard: pending, active and disabled codes"),
    ("Screenshot_20261117-175732.jpg", "greview-recover.jpg",
     "Recover QR — secure and restore a code that stopped scanning"),
    ("Screenshot_20261117-175735.jpg", "greview-tools.jpg",
     "Tools screen: pick the QR or NFC working mode"),
    ("Screenshot_20261117-175737.jpg", "greview-storage.jpg",
     "Private storage: live Firebase database and backups"),
    ("Screenshot_20261117-175739.jpg", "greview-security.jpg",
     "Security and account: 6-digit PIN, biometrics, auto-lock"),
    ("Screenshot_20261117-175820.jpg", "greview-profile.jpg",
     "Profile and business details behind the scanned identity"),
]

TIMECAPSULE = [
    ("Screenshot_20261117-181037.jpg", "timecapsule-landing.jpg",
     "Launch screen — the camera starts on the back lens"),
    ("Screenshot_20261117-181116.jpg", "timecapsule-home.jpg",
     "Home: total events, current events and cloud sync state"),
    ("Screenshot_20261117-181118.jpg", "timecapsule-events.jpg",
     "Events: create an event and browse the recorded ones"),
    ("Screenshot_20261117-181119.jpg", "timecapsule-tools.jpg",
     "Tools: QR tools, NFC tools and QR tracking status"),
    ("Screenshot_20261117-181120.jpg", "timecapsule-storage.jpg",
     "Storage: Google Drive integration and automatic cloud sync"),
    ("Screenshot_20261117-181122.jpg", "timecapsule-settings.jpg",
     "Settings: administrator account and Google Drive state"),
    ("Screenshot_20261022-034830.jpg", "timecapsule-capture.jpg",
     "A photo taken through the app's own camera"),
]

MAX_W = 700
QUALITY = 82


def place(items, folder):
    dest = OUT / folder
    dest.mkdir(parents=True, exist_ok=True)
    made = []
    for src_name, out_name, _caption in items:
        src = SRC / src_name
        if not src.exists():
            print(f"  MISSING {src_name}")
            continue
        im = Image.open(src)
        im = im.convert("RGB")
        w, h = im.size
        if w > MAX_W:
            im = im.resize((MAX_W, round(h * MAX_W / w)), Image.LANCZOS)
        target = dest / out_name
        im.save(target, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        made.append((target.name, target.stat().st_size // 1024, im.size))
    return made


for folder, items in (("greview", GREVIEW), ("timecapsule", TIMECAPSULE)):
    print(f"[{folder}]")
    for name, kb, size in place(items, folder):
        print(f"  {name:32s} {kb:4d} KB  {size[0]}x{size[1]}")
