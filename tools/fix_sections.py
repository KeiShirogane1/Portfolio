"""Fix the section eyebrows: one number source (src/data/sections.js) and
clean UTF-8 dashes instead of the byte that the earlier in-place edit left
behind. Run from the portfolio folder: python tools/fix_sections.py"""

import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def read(path):
    with io.open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def write(path, text):
    with io.open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(text)

changed = []

# --- 1. Data files: plain escape, so no dash byte can ever corrupt again ---
DATA_EYEBROWS = {
    'src/data/profile.js': [('Identity', '02')],
    'src/data/experience.js': [('Experience', '06'), ('Education', '08')],
    'src/data/ai.js': [('AI & Experiments', '07')],
    'src/data/certifications.js': [('Certifications & Professional Development', '09')],
}

for path, items in DATA_EYEBROWS.items():
    text = read(path)
    original = text
    for label, num in items:
        pattern = r"eyebrow:\s*'[^']*" + re.escape(label) + r"[^']*'"
        replacement = "eyebrow: '" + num + " \\u2014 " + label.replace('&', '&') + "'"
        text = re.sub(pattern, replacement.replace('\\', '\\\\'), text, count=1)
    if text != original:
        write(path, text)
        changed.append(path)

# --- 2. Components: pull the number from sections.js ---
COMPONENT_EYEBROWS = {
    'src/components/Skills.jsx': ('skills', 'eyebrow'),
    'src/components/Projects.jsx': ('projects', 'eyebrow'),
    'src/components/Contact.jsx': ('contact', 'eyebrow'),
    'src/components/ContributionGraph.jsx': ('activity', 'badge'),
}

for path, (section_id, kind) in COMPONENT_EYEBROWS.items():
    text = read(path)
    original = text
    if kind == 'eyebrow':
        text = re.sub(
            r'<span className="eyebrow">[^<]*</span>',
            '<span className="eyebrow">{eyebrow(\'%s\')}</span>' % section_id,
            text,
            count=1
        )
    else:
        text = re.sub(
            r'(<span className="contrib__badge">)[^<]*(</span>)',
            r"\g<1>{eyebrow('" + section_id + "')}\g<2>",
            text,
            count=1
        )
    # add the import right after the last existing import line
    if 'sections.js' not in text:
        imports = list(re.finditer(r"^import .*?$", text, flags=re.M))
        if imports:
            last = imports[-1]
            insert = "\nimport { eyebrow } from '../data/sections.js'"
            text = text[:last.end()] + insert + text[last.end():]
    if text != original:
        write(path, text)
        changed.append(path)

print('changed:', ', '.join(changed) if changed else '(nothing)')
