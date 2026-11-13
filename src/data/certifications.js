/**
 * Certifications and professional development. Each entry points at the actual
 * certificate image under public/certificates/; the facts mirror what the
 * certificate states and nothing is invented.
 */
export const certsIntro = {
  eyebrow: '08 - Certifications & Professional Development',
  heading: 'Credentials that back the craft.',
  body:
    'Certificates of completion and attendance from hands-on training and school programs. Each one is backed by the hours or the event behind it, not just the title.'
}

export const certifications = [
  {
    index: '01',
    title: 'Computer Systems Servicing NC II',
    issuer: 'MindTech / TESDA',
    image: '/certificates/computer-systems-servicing-nc-ii-certificate-of-completion.jpg',
    alt:
      'Certificate of Completion for the 280-hour Computer Systems Servicing NC II program from MindTech and TESDA, completed August 19, 2023.',
    facts: [
      { label: 'Type', value: 'Certificate of Completion' },
      { label: 'Hours', value: '280 hours' },
      { label: 'Dates', value: 'July 26 - August 18, 2023' },
      { label: 'Completed', value: 'August 19, 2023' }
    ],
    note: 'Course completion certificate, not a TESDA National Certificate.'
  },
  {
    index: '02',
    title: 'ICT Field Application',
    issuer: 'Rizal High School - Senior High School Research Department',
    image: '/certificates/certificate-of-attendance-ict-field-application-at-research-resource-center.jpg',
    alt:
      'Certificate of Attendance for ICT field application at the Research Resource Center, awarded by Rizal High School Senior High School Research Department on April 28, 2023.',
    facts: [
      { label: 'Type', value: 'Certificate of Attendance' },
      { label: 'Program', value: 'ICT field application' },
      { label: 'Venue', value: 'Research Resource Center' },
      { label: 'Awarded', value: 'April 28, 2023' }
    ],
    note: 'Awarded for valuable service and good conduct.'
  },
  {
    index: '03',
    title: 'Joint Delivery Voucher Program - Computer Systems Servicing NC II',
    issuer: 'Capellan Institute of Technology Inc.',
    image: '/certificates/joint-delivery-voucher-program-computer-systems-servicing-nc-ii.jpg',
    alt:
      'Certificate of Participation for the 40-day Joint Delivery Voucher Program in Computer Systems Servicing NC II at Capellan Institute of Technology Inc., June 22, 2023.',
    facts: [
      { label: 'Type', value: 'Certificate of Participation' },
      { label: 'Program', value: 'Joint Delivery Voucher Program - Computer Systems Servicing NC II' },
      { label: 'Duration', value: '40-day program' },
      { label: 'Venue', value: 'Rizal High School, Pasig City' },
      { label: 'Date', value: 'June 22, 2023' }
    ]
  }
]