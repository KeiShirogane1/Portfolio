export const experience = {
  eyebrow: '05 — Experience',
  role: 'Customer-facing service role',
  workplace: 'Big Brew Milkteashop',
  duration: '3 years',
  note: 'The exact job title and dates are left open on purpose — add them once confirmed with your employer.',
  summary:
    'Three years in a busy milk tea shop, working shifts where customers, orders and a small team all need attention at the same time. The work is not software, but the habits it built transfer directly.',
  skills: [
    { label: 'Communication', detail: 'Taking orders clearly and explaining options to people in a hurry.' },
    { label: 'Teamwork', detail: 'Handing off between stations during a rush so nothing gets dropped.' },
    { label: 'Time management', detail: 'Keeping queue times short when orders arrive faster than they finish.' },
    { label: 'Customer service', detail: 'Staying patient and helpful with complaints, mistakes and questions.' },
    { label: 'Problem-solving', detail: 'Fixing a wrong order or a supply gap on the spot, then carrying on.' },
    { label: 'Adaptability', detail: 'Moving between roles as the shift needs it.' }
  ]
}

/**
 * The Nexora internship project, kept separate from the QwerNFC work.
 * No internship dates, supervisor names or formal affiliations are stated here
 * because none have been confirmed.
 */
export const internshipWork = {
  label: 'Internship project',
  title: 'Nexora — Internship Performance & Classroom Platform',
  context:
    'Built during internship work as a full-stack Flask application: students record their OJT hours and daily logbooks, supervisors review and grade, and administrators manage accounts, classrooms and reports.',
  carryOver: [
    'Working to someone else\u2019s requirements instead of my own',
    'Role-based access control and permission checks across three user types',
    'Writing an automated validation suite before calling the work done'
  ],
  projectId: 'nexora'
}

export const education = {
  eyebrow: '06 — Education',
  degree: 'Bachelor of Science in Information Technology',
  school: 'Arellano University – Andres Bonifacio Campus',
  standing: 'Fourth-year student',
  ojthours: '486 hours required OJT',
  graduation: 'Expected graduation year — to be confirmed',
  note: 'School and standing come from the resume. The graduation year is still a placeholder — add it in src/data/experience.js when it is confirmed.',
  courses: [
    'Programming fundamentals and data structures',
    'Database systems and SQL',
    'Web and application development',
    'Software project work'
  ],
  goals: ['OJT / internship opportunities', 'Future software development employment', 'Freelance software development work']
}
