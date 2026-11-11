/**
 * Skill categories. No proficiency percentages or invented certifications —
 * only the technologies named in the resume and the brief, grouped honestly.
 */
export const skillCategories = [
  {
    key: 'programming',
    index: '01',
    title: 'Programming Languages',
    blurb: 'Core languages used across coursework, experiments and project work.',
    tools: ['Python', 'JavaScript', 'Java', 'PHP', 'SQL', 'HTML5', 'CSS3']
  },
  {
    key: 'frontend',
    index: '02',
    title: 'Frontend Development',
    blurb: 'Building interfaces in the browser, from layout to interaction.',
    tools: ['React', 'HTML5', 'CSS3', 'JavaScript', 'JSON', 'Responsive web development']
  },
  {
    key: 'backend',
    index: '03',
    title: 'Backend Development',
    blurb: 'APIs, request handling, database connectivity and server-side logic.',
    tools: ['Flask', 'Node.js', 'API integration', 'CRUD operations', 'Capacitor']
  },
  {
    key: 'database',
    index: '04',
    title: 'Database Management',
    blurb: 'Schema design and querying for real project data.',
    tools: ['SQLite', 'PostgreSQL', 'Relational database concepts', 'Database connectivity']
  },
  {
    key: 'mobile',
    index: '05',
    title: 'Mobile Development',
    blurb: 'Mobile-first features: identity, authentication, camera and sync.',
    tools: ['Capacitor', 'Mobile application development', 'QR scanning', 'NFC workflows', 'Camera integration', 'PIN-based security', 'Cloud synchronisation']
  },
  {
    key: 'ai',
    index: '06',
    title: 'AI and Automation',
    blurb: 'Practising how AI fits into a real development workflow.',
    tools: [
      'AI API integration',
      'AI-assisted development',
      'AI coding agents',
      'Prompt engineering',
      'Python automation',
      'Model selection and cooldown-aware routing'
    ]
  },
  {
    key: 'tools',
    index: '07',
    title: 'Tools & Platforms',
    blurb: 'The everyday environment I build in, and where things get shipped.',
    tools: ['Git', 'GitHub', 'Visual Studio Code', 'OpenCode', 'PowerShell', 'Cloudflare Workers', 'Render', 'Gunicorn']
  }
]
