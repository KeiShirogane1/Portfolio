/**
 * SECTION ORDER — single source of truth
 * ------------------------------------------------------------
 * Every section number on the page comes from this file: the explorer's
 * file tree, the eyebrow labels ("03 — Skills") and the contact heading.
 * Change the order here and the labels follow, so two sections can never
 * claim the same number again.
 */

export const sections = [
  { id: 'home', label: 'Home', file: 'home.jsx', num: '01' },
  { id: 'about', label: 'About', file: 'about.md', num: '02' },
  { id: 'activity', label: 'Activity', file: 'activity.json', num: '03' },
  { id: 'projects', label: 'Projects', file: 'projects.jsx', num: '04' },
  { id: 'system', label: 'System', file: 'system-flow.jsx', num: '05' },
  { id: 'skills', label: 'Skills', file: 'skills.json', num: '06' },
  { id: 'experience', label: 'Experience', file: 'experience.md', num: '07' },
  { id: 'ai', label: 'AI & Experiments', file: 'ai-experiments.jsx', num: '08' },
  { id: 'education', label: 'Education', file: 'education.md', num: '09' },
  { id: 'certs', label: 'Certifications', file: 'certifications.md', num: '10' },
  { id: 'contact', label: 'Contact', file: 'contact.jsx', num: '11' }
]

/** Number + label for a section's eyebrow, e.g. eyebrow('skills') → '05 — Skills'. */
export const eyebrow = (id) => {
  const section = sections.find((s) => s.id === id)
  return section ? `${section.num} — ${section.label}` : ''
}
