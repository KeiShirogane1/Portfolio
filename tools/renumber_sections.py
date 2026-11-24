"""Renumber the section eyebrows after inserting 05 — System.

Plain sequential replaceAll would renumber each other's work (06 → 07, then
07 → 08), so this does every mapping in one pass over each file instead.
"""
import re
import pathlib

BASE = pathlib.Path('D:/.PORTFOLIO/portfolio')

# id-agnostic: the number is the only thing that changes.
MAP = {
    '07': '08',  # ai
    '06': '07',  # experience
    '08': '09',  # education
    '09': '10',  # certifications
    '05': '06',  # skills
    '10': '11',  # contact
}

TARGETS = [
    ('src/data/profile.js', r"(eyebrow: ')(\d\d)"),
    ('src/data/experience.js', r"(eyebrow: ')(\d\d)"),
    ('src/data/certifications.js', r"(eyebrow: ')(\d\d)"),
    ('src/data/ai.js', r"(eyebrow: ')(\d\d)"),
    ('src/components/Skills.jsx', r'(<span className="eyebrow">)(\d\d)'),
    ('src/components/Contact.jsx', r'(<span className="eyebrow">)(\d\d)'),
]

for rel, pattern in TARGETS:
    path = BASE / rel
    text = path.read_text(encoding='utf-8')
    subs = []

    def swap(match, _subs=subs):
        old = match.group(2)
        new = MAP.get(old, old)
        if new != old:
            _subs.append(f'{old} -> {new}')
        return match.group(1) + new

    new_text = re.sub(pattern, swap, text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        print(f'{rel}: {", ".join(subs)}')
    else:
        print(f'{rel}: no change')

# The same single source of truth for the new section, instead of a literal.
sysflow = BASE / 'src/components/SystemFlow.jsx'
text = sysflow.read_text(encoding='utf-8')
if "import { eyebrow }" not in text:
    text = text.replace(
        "import useRevealGroup from '../hooks/useRevealGroup.js'",
        "import useRevealGroup from '../hooks/useRevealGroup.js'\nimport { eyebrow } from '../data/sections.js'",
    )
    text = text.replace('<span className="eyebrow">05 — System</span>', "<span className=\"eyebrow\">{eyebrow('system')}</span>")
    sysflow.write_text(text, encoding='utf-8')
    print('SystemFlow.jsx: eyebrow now comes from sections.js')

print('\n--- result ---')
for rel, pattern in TARGETS + [('src/components/SystemFlow.jsx', r'(<span className="eyebrow">)([^<]*)')]:
    path = BASE / rel
    for line in path.read_text(encoding='utf-8').splitlines():
        if 'eyebrow' in line and ('\\u2014' in line or ' — ' in line or ' - ' in line):
            print(f'{rel}: {line.strip()}')
