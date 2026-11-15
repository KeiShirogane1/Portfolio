/**
 * Skill categories. No proficiency percentages or invented certifications —
 * only the technologies named in the resume and the brief, grouped honestly.
 */
/**
 * Skill categories. No proficiency percentages or invented certifications —
 * only the technologies named in the resume and the brief, grouped honestly.
 *
 * Each tool carries an `icon` key that maps to a brand SVG defined in
 * src/components/Skills.jsx. Phrase-style tools (e.g. "API integration") get
 * a generic code icon instead of a brand mark.
 */
export const skillCategories = [
  {
    key: 'programming',
    index: '01',
    title: 'Programming Languages',
    blurb: 'Core languages used across coursework, experiments and project work.',
    tools: [
      { name: 'Python', icon: 'python' },
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'Java', icon: 'java' },
      { name: 'PHP', icon: 'php' },
      { name: 'SQL', icon: 'sql' },
      { name: 'HTML5', icon: 'html5' },
      { name: 'CSS3', icon: 'css3' }
    ]
  },
  {
    key: 'frontend',
    index: '02',
    title: 'Frontend Development',
    blurb: 'Building interfaces in the browser, from layout to interaction.',
    tools: [
      { name: 'React', icon: 'react' },
      { name: 'HTML5', icon: 'html5' },
      { name: 'CSS3', icon: 'css3' },
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'JSON', icon: 'json' },
      { name: 'Responsive web development', icon: 'generic' }
    ]
  },
  {
    key: 'backend',
    index: '03',
    title: 'Backend Development',
    blurb: 'APIs, request handling, database connectivity and server-side logic.',
    tools: [
      { name: 'Flask', icon: 'flask' },
      { name: 'Node.js', icon: 'nodejs' },
      { name: 'API integration', icon: 'generic' },
      { name: 'CRUD operations', icon: 'generic' },
      { name: 'Capacitor', icon: 'capacitor' }
    ]
  },
  {
    key: 'database',
    index: '04',
    title: 'Database Management',
    blurb: 'Schema design and querying for real project data.',
    tools: [
      { name: 'SQLite', icon: 'sqlite' },
      { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'Relational database concepts', icon: 'generic' },
      { name: 'Database connectivity', icon: 'generic' }
    ]
  },
  {
    key: 'mobile',
    index: '05',
    title: 'Mobile Development',
    blurb: 'Mobile-first features: identity, authentication, camera and sync.',
    tools: [
      { name: 'Capacitor', icon: 'capacitor' },
      { name: 'Mobile application development', icon: 'generic' },
      { name: 'QR scanning', icon: 'generic' },
      { name: 'NFC workflows', icon: 'generic' },
      { name: 'Camera integration', icon: 'generic' },
      { name: 'PIN-based security', icon: 'generic' },
      { name: 'Cloud synchronisation', icon: 'generic' }
    ]
  },
  {
    key: 'ai',
    index: '06',
    title: 'AI and Automation',
    blurb: 'Practising how AI fits into a real development workflow.',
    tools: [
      { name: 'AI API integration', icon: 'generic' },
      { name: 'AI-assisted development', icon: 'generic' },
      { name: 'AI coding agents', icon: 'generic' },
      { name: 'Prompt engineering', icon: 'generic' },
      { name: 'Python automation', icon: 'python' },
      { name: 'Model selection and cooldown-aware routing', icon: 'generic' }
    ]
  },
  {
    key: 'tools',
    index: '07',
    title: 'Tools & Platforms',
    blurb: 'The everyday environment I build in, and where things get shipped.',
    tools: [
      { name: 'Git', icon: 'git' },
      { name: 'GitHub', icon: 'github' },
      { name: 'Visual Studio Code', icon: 'vscode' },
      { name: 'OpenCode', icon: 'generic' },
      { name: 'PowerShell', icon: 'powershell' },
      { name: 'Cloudflare Workers', icon: 'cloudflare' },
      { name: 'Render', icon: 'render' },
      { name: 'Gunicorn', icon: 'generic' }
    ]
  }
]
