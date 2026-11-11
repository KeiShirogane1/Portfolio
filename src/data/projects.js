/**
 * Featured projects — exactly six, in this fixed order.
 *
 * 01–05 belong to the QwerNFC ecosystem. 06 is Nexora, a separate internship
 * project. Nothing here is invented: descriptions and statuses come from the
 * supplied brief, and Nexora's detail was verified against the KeiShirogane1
 * repository (blueprints, role_required, ML predictor, system_validation).
 *
 * Repositories stay private — no repo or deployment links are published.
 */

export const projectGroups = [
  {
    key: 'qwernfc',
    label: 'QwerNFC Ecosystem',
    index: 'A',
    blurb:
      'One umbrella initiative exploring what happens when a physical tap or scan opens a digital experience. Five products, each with its own purpose and its own stage of development.'
  },
  {
    key: 'internship',
    label: 'Internship Experience',
    index: 'B',
    blurb:
      'A separate web application built during internship work — unrelated to QwerNFC, and presented on its own terms.'
  }
]

export const projects = [
  /* ─────────────────────────── QWERNFC ECOSYSTEM ─────────────────────────── */
  {
    id: 'live-memories',
    group: 'qwernfc',
    index: '01',
    title: 'Live Memories',
    category: 'QwerNFC Product · Digital Memory Preservation',
    status: 'Developing Soon',
    statusTone: 'upcoming',
    summary:
      'A digital memory preservation experience that connects physical NFC/QR keepsakes to personal photo galleries and meaningful memories.',
    description:
      'Live Memories pairs a physical keepsake — an NFC keychain or similar — with a digital space behind it. Tap or scan the object and the memories attached to it open up. It is a separate product from TimeCapsule, with its own purpose: keeping a memory reachable through a thing you can hold.',
    purpose:
      'Give personal memories a physical anchor, so a keepsake becomes the way back to the photos and moments attached to it.',
    technologies: ['NFC', 'QR', 'JavaScript', 'Capacitor', 'Digital galleries'],
    features: [
      'NFC / QR-enabled physical keepsake',
      'Connected digital photo gallery',
      'Scanned identity opens the matching memory space',
      'Warm, product-led presentation of personal memories'
    ],
    contributions: [
      'Developed the product concept and feature scope',
      'Designed the link between the physical keepsake and its digital space',
      'Built the mobile interaction path around tap and scan'
    ],
    detail: [
      'The product is at concept and early-build stage. Screenshots will be added as the build reaches a presentable state.',
      'Live Memories and TimeCapsule are deliberately kept separate — they solve different problems inside the same ecosystem.'
    ],
    images: ['/projects/live-memories/live-memories-card.jpg?v=2'],
    mediaRatio: '16 / 9',
    accent: '#548CFF'
  },
  {
    id: 'qyorfoundme',
    group: 'qwernfc',
    index: '02',
    title: 'QyorFoundMe',
    category: 'QwerNFC Product · QR Lost & Found',
    status: 'Developing Soon',
    statusTone: 'upcoming',
    summary:
      'A QR-based lost-and-found concept. A tag on a belonging carries an identity, so a finder can reach the owner instead of the item disappearing.',
    description:
      'QyorFoundMe gives belongings an identity through a QR tag. When something is lost, the person who finds it can scan the tag and reach the owner through the information tied to that identity — no guessing, no notice board.',
    purpose:
      'Turn a lost item into a recoverable one by putting a readable identity on it.',
    technologies: ['QR', 'JavaScript', 'Capacitor', 'Identity linking'],
    features: [
      'QR-enabled identification tag',
      'Owner-facing identity record',
      'Scan-to-contact path for whoever finds the item',
      'Designed around personal belongings and everyday gear'
    ],
    contributions: [
      'Developed the lost-and-found product concept',
      'Defined what the QR identity carries and what it resolves to',
      'Built the scan path on the mobile side'
    ],
    detail: [
      'How far the product works without a connection is a real design constraint: information printed or encoded on the tag can be read offline, while anything that resolves through a server needs the internet. The interface is built to make that difference visible rather than blur it.',
      'Recovery flows that depend on a live service are not described here as fully offline.'
    ],
    images: ['/projects/qyorfoundme/qyorfoundme-card.jpg?v=2'],
    mediaRatio: '16 / 9',
    accent: '#9B70FF'
  },
  {
    id: 'greview',
    group: 'qwernfc',
    index: '03',
    title: 'GReview',
    category: 'QwerNFC Product · Review Platform',
    status: 'Almost Done',
    statusTone: 'nearly',
    summary:
      'A review initiative inside the QwerNFC ecosystem, built around collecting and presenting product feedback through a connected identity.',
    description:
      'GReview collects feedback and puts it where it can be seen. A scanned identity leads to a review screen — a star rating and a written note — and the feedback is attached to the product it belongs to rather than buried in a form.',
    purpose:
      'Make customer feedback easy to give at the moment of the visit, and easy to read afterwards.',
    technologies: ['JavaScript', 'Capacitor', 'QR scanning', 'Rating interface'],
    features: [
      'Scannable entry point into the review flow',
      'Star rating with a written note',
      'Feedback tied to the scanned product identity',
      'Review presentation on the product side'
    ],
    contributions: [
      'Built the review screen shown in the capture',
      'Connected the scan entry point to the review flow',
      'Refined the rating and note interaction'
    ],
    detail: [
      'This is the most far along of the QwerNFC products and it is shown first in the story, but it is not finished — the status is Almost Done, not Complete.',
      'Deeper workflow documentation is still being finalised, so the feature list above stops where confirmed behaviour stops.'
    ],
    images: ['/projects/greview/greview-card.jpg?v=2'],
    mediaRatio: '16 / 9',
    accent: '#548CFF'
  },
  {
    id: 'qwernfc-music',
    group: 'qwernfc',
    index: '04',
    title: 'QwerNFC Music',
    category: 'QwerNFC Product · Music Platform',
    status: 'Coming Soon',
    statusTone: 'upcoming',
    summary:
      'A music-focused product initiative inside the QwerNFC ecosystem, built around its own interface and connected identity.',
    description:
      'QwerNFC Music explores a music experience inside the product family — the app interface and the connected identity doing the work, rather than a separate account system. It is an upcoming product, presented as such.',
    purpose:
      'Bring a listening experience into the same identity system the rest of the ecosystem uses.',
    technologies: ['JavaScript', 'Capacitor', 'Mobile music interface'],
    features: [
      'Music-focused mobile interface direction',
      'Connected identity shared with the rest of the ecosystem',
      'Multiple-screen product presentation'
    ],
    contributions: [
      'Developed the product direction and interface concept',
      'Shaped the multi-screen presentation shown in the reference visuals'
    ],
    detail: [
      'Streaming infrastructure, licensing, subscriptions and offline playback are not claimed here. This is an upcoming product initiative, and the description stays at that level until the build proves more.'
    ],
    images: ['/projects/qwernfc-music/qwernfc-music-card.jpg?v=2'],
    mediaRatio: '16 / 9',
    accent: '#9B70FF'
  },
  {
    id: 'timecapsule',
    group: 'qwernfc',
    index: '05',
    title: 'TimeCapsule',
    category: 'QwerNFC Product · Mobile Application',
    status: 'In Development · ~70% Complete',
    statusTone: 'building',
    progress: 70,
    progressNote: 'My own development estimate — not measured test coverage.',
    summary:
      'A digital memory and identity application: QR/NFC identity, PIN-protected access, camera capture, galleries, events and cloud sync through Google Drive.',
    description:
      'TimeCapsule is the most developed application in the ecosystem. A person identifies themselves with a QR code or NFC tag, unlocks their space with a PIN, captures moments with the camera, and keeps them synchronised through Google Drive. The hard part is the seam between those pieces — authentication, local capture and remote backup behaving like one experience.',
    purpose:
      'Keep personal memories protected, organised and recoverable across devices without asking the user to manage the plumbing.',
    technologies: [
      'Capacitor',
      'JavaScript',
      'QR / NFC',
      'PIN authentication',
      'Camera',
      'Gallery',
      'Google Drive API'
    ],
    features: [
      'QR / NFC identity management',
      'PIN-based app protection',
      'Camera capture inside the app',
      'Gallery of captured memories',
      'Event management',
      'Cloud synchronisation with Google Drive'
    ],
    contributions: [
      'Implemented QR / NFC identity handling',
      'Built the PIN authentication step',
      'Connected camera capture to the gallery',
      'Worked the Drive sync path and its failure cases',
      'Tested flows across app restarts and reconnection'
    ],
    detail: [
      'Roughly 70% complete by my own estimate. Integrations exist in the build and are still being hardened — nothing here is presented as production-ready.',
      'The percentage is a development judgement, not a test-coverage figure.',
      'The visual shown is the TimeCapsule product card supplied for this portfolio.'
    ],
    images: ['/projects/timecapsule/timecapsule-card.jpg?v=2'],
    mediaRatio: '16 / 9',
    accent: '#548CFF'
  },

  /* ─────────────────────────── INTERNSHIP PROJECT ─────────────────────────── */
  {
    id: 'nexora',
    group: 'internship',
    index: '06',
    title: 'Nexora',
    category: 'Internship Project · Web Application',
    status: 'Internship Project',
    statusTone: 'internship',
    summary:
      'An internship performance and classroom management platform built with Python and Flask. Integrates student OJT tracking, supervisor workflows, classroom management, reporting, and ML-assisted feedback analysis.',
    description:
      'Nexora is a full-stack Flask platform for internship performance and classroom management. It gives students, supervisors and administrators separate experiences over one shared database: OJT attendance and progress, daily logbooks with photo evidence, classwork and submissions, grading, gradebooks, performance reports and evaluation workflows. Feedback analysis is ML-assisted — a Naive Bayes classifier predicts a performance category, and the surrounding reports derive sentiment, competency notes and recommendations from it.',
    purpose:
      'Replace scattered spreadsheets and paper logbooks with one place where internship progress can be recorded, reviewed and reported on.',
    technologies: [
      'Python',
      'Flask',
      'JavaScript',
      'HTML5',
      'CSS3',
      'SQLite',
      'PostgreSQL',
      'Flask-WTF',
      'scikit-learn',
      'NumPy',
      'Joblib',
      'Gunicorn'
    ],
    features: [
      'Student authentication and dashboard',
      'OJT attendance, progress tracking and daily logbooks',
      'Photo evidence attached to daily OJT activities',
      'Supervisor class, intern and logbook review',
      'Classwork, assignments, submissions and grading',
      'Gradebook and classmates views',
      'Administrative dashboard with user and classroom administration',
      'Account approval and appeal workflows',
      'ML-assisted feedback analysis (Naive Bayes, optional SVM comparison)'
    ],
    contributions: [
      'Built Flask application structure with multiple blueprints',
      'Implemented authentication with role-based access control',
      'Developed student, supervisor and administrator interfaces',
      'Worked SQLite and PostgreSQL configuration through DATABASE_URL',
      'Wrote the system_validation suite used to check the application'
    ],
    detail: [
      'Three roles, one system: students record their OJT work, supervisors review and grade, administrators manage accounts and classrooms.',
      'Feedback analysis is ML-assisted, not a set of independent classifiers. A Naive Bayes model predicts the performance category; sentiment, competency descriptions and recommendations are derived from that category. An SVM model can be enabled for comparison when its file is present.',
      'Missing model artefacts are handled gracefully — the predictor falls back to a neutral category with zero confidence instead of failing.',
      'The repository documents a default SQLite setup and PostgreSQL through DATABASE_URL. No hosting provider is claimed here because the portfolio does not assert a live deployment.'
    ],
    roleSections: [
      {
        label: 'Student',
        points: [
          'Authentication and personal dashboard',
          'OJT attendance and internship progress',
          'Daily logbook entries with photo evidence',
          'Classroom functionality, assignments and submissions',
          'Gradebook and classmates'
        ]
      },
      {
        label: 'Supervisor',
        points: [
          'Role-specific access to assigned classes',
          'Class and intern management',
          'Daily logbook review and performance monitoring',
          'Classwork, submission review and grading',
          'Evaluation workflows and supervisor documents'
        ]
      },
      {
        label: 'Administrator',
        points: [
          'Administrative dashboard and monitoring',
          'User and account administration',
          'Classroom administration',
          'Reports and reporting overview',
          'Account approval and appeal workflows'
        ]
      }
    ],
    mlNote: {
      title: 'ML-assisted feedback analysis',
      body:
        'A TF-IDF vectoriser feeds a primary Naive Bayes performance classifier, with an optional SVM model for comparison. Predicted categories — Excellent, Very Satisfactory, Satisfactory, Fair and Needs Improvement — drive the sentiment label, competency description and recommendation shown in reports. Confidence is reported when the model returns probabilities. These extra outputs are derived from the performance label; they are not separately trained classifiers.',
      stack: ['scikit-learn', 'TF-IDF vectoriser', 'Naive Bayes', 'Optional SVM comparison', 'Joblib', 'NumPy']
    },
    images: ['/projects/nexora/nexora-1.svg', '/projects/nexora/nexora-2.svg'],
    illustrationNote:
      'These are illustrative layouts built from the application structure, not real screenshots — labelled as such until repository captures are supplied.',
    accent: '#548CFF'
  }
]

export const projectNotes = [
  'QwerNFC repositories are private — source links are intentionally not published.',
  'Statuses are honest: Developing Soon, Coming Soon, Almost Done, ~70% Complete, and Internship Project.',
  'Nexora visuals are illustrative layouts based on the real application structure, and are labelled as such in its detail view.'
]
