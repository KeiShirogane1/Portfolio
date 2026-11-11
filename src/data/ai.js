/**
 * AI & experiments. This is exploration and practice — nothing here claims
 * a trained or developed model.
 */
export const aiIntro = {
  eyebrow: '07 — AI & Experiments',
  heading: 'Using AI as a tool, not a claim.',
  body:
    'I explore how AI fits into real development work: connecting language-model APIs into applications, directing AI coding agents through a build, and writing prompts that produce something usable. This is practice and experimentation, not model development — I have not trained or published an AI model.'
}

export const experiments = [
  {
    index: '01',
    title: 'AI API integration',
    body:
      'Connecting external AI APIs into small applications, handling the request, the delay, the failure cases, and the result the interface shows.',
    tags: ['Python', 'Flask', 'HTTP / JSON']
  },
  {
    index: '02',
    title: 'Model rotation utility',
    body:
      'Built a Python utility that selects AI coding models by task, tracks cooldown periods, and switches to an available model when a usage limit is reached — with automated tests for its behaviour.',
    tags: ['Python', 'Automation', 'Testing']
  },
  {
    index: '03',
    title: 'AI coding agents',
    body:
      'Working alongside AI coding agents on real projects — giving them a task, checking what changed, and correcting when it drifts.',
    tags: ['OpenCode', 'Workflow', 'Review']
  },
  {
    index: '04',
    title: 'Prompt engineering',
    body:
      'Testing how much a clear, constrained prompt changes the result — structure, examples, and telling the model exactly what the output should look like.',
    tags: ['Prompting', 'Evaluation', 'Iteration']
  },
  {
    index: '05',
    title: 'Workflow automation',
    body:
      'Finding the repeated steps in a process and scripting them away, so attention stays on the parts that need judgement.',
    tags: ['PowerShell', 'Python', 'APIs']
  }
]
