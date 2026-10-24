// The craft framework: Dan Harmon's Story Circle + Campbell's Hero's Journey + Dov Simens' rules.
// Everything here is a QUESTION or a RULE. Nothing here is story content — all story content comes from the writer.

import type { BeatKey, Kind, TvFormat } from './types'

export interface BeatDef {
  key: BeatKey
  short: string
  n: number
  title: string
  harmon: string
  campbell?: string
  act: 1 | 2 | 3
  // Where the beat lands, as a fraction of total pages.
  at: [number, number]
  brief: string
  questions: string[]
  checks: string[]
}

export const BEATS: BeatDef[] = [
  {
    key: 'you',
    short: 'You',
    n: 1,
    title: 'A hero in a normal world',
    harmon: 'You',
    campbell: 'The Ordinary World',
    act: 1,
    at: [0, 0.08],
    brief: 'Show who they are and how they live before things change.',
    questions: [
      'Who is your hero, in a few words?',
      'What does an ordinary day look like for them?',
      'What is their flaw or blind spot?',
      'What is the first image we see of them — and what does it tell us?',
      'What do they believe about the world at the start?',
    ],
    checks: ['We meet the hero in the first few pages', 'We see the flaw in action, not just hear about it'],
  },
  {
    key: 'want',
    short: 'Want',
    n: 2,
    title: 'A want',
    harmon: 'Need',
    act: 1,
    at: [0.05, 0.12],
    brief: 'The hero wants one clear thing we can see on screen.',
    questions: [
      'What does your hero want — one clear thing?',
      'How will we SEE that want on screen?',
      'Why do they want it right now, and not last year?',
      'What do they actually need, that they don’t know they need yet?',
      'What happens to them if they never get it?',
    ],
    checks: ['The want is ONE thing', 'A camera could film it'],
  },
  {
    key: 'push',
    short: 'Push',
    n: 3,
    title: 'A push',
    harmon: '(between Need and Go)',
    campbell: 'The Call to Adventure',
    act: 1,
    at: [0.1, 0.15],
    brief: 'Something happens that forces a choice.',
    questions: [
      'What happens that forces a choice?',
      'Why can’t the hero ignore it?',
      'Do they refuse at first? What makes them hesitate?',
      'Who or what delivers the push?',
    ],
    checks: ['It is an event we watch happen', 'It forces a decision, not just a mood'],
  },
  {
    key: 'go',
    short: 'Go',
    n: 4,
    title: 'A step through the door',
    harmon: 'Go',
    campbell: 'Crossing the Threshold',
    act: 1,
    at: [0.25, 0.3],
    brief: 'The hero chooses to leave the old world. This ends Act 1.',
    questions: [
      'What choice does the hero make to leave the old world?',
      'Is it their decision — or does it just happen to them?',
      'What can’t they take back after this moment?',
      'What do they leave behind?',
    ],
    checks: ['The hero makes the choice actively', 'Lands at the end of Act 1'],
  },
  {
    key: 'search',
    short: 'Search',
    n: 5,
    title: 'A new world with tests',
    harmon: 'Search',
    campbell: 'Tests, Allies, Enemies',
    act: 2,
    at: [0.3, 0.5],
    brief: 'New rules, friends, and enemies. The hero tries and fails.',
    questions: [
      'What are the rules of this new world?',
      'Who becomes a friend? Who becomes an enemy?',
      'How does the hero try — and fail?',
      'What old habit stops working here?',
      'What do they have to learn to survive?',
    ],
    checks: ['At least one real failure', 'New world feels different from the old one'],
  },
  {
    key: 'find',
    short: 'Find',
    n: 6,
    title: 'Getting the thing',
    harmon: 'Find',
    campbell: 'Approach / Reward',
    act: 2,
    at: [0.48, 0.55],
    brief: 'Around the middle, the hero gets what they wanted. It costs more than they thought.',
    questions: [
      'When does the hero get what they wanted?',
      'What does it cost that they didn’t expect?',
      'How does getting it raise the stakes?',
      'Is it really what they needed?',
    ],
    checks: ['Lands near the midpoint', 'The win carries a hidden cost'],
  },
  {
    key: 'take',
    short: 'Take',
    n: 7,
    title: 'Paying the price',
    harmon: 'Take',
    campbell: 'The Ordeal',
    act: 2,
    at: [0.75, 0.9],
    brief: 'The hero loses something big. This is the lowest point.',
    questions: [
      'What big thing does the hero lose?',
      'What is the lowest point — what does it look like on screen?',
      'What do they finally understand about what they need?',
      'Who is with them, or who is gone, at this moment?',
    ],
    checks: ['The loss is something we can see', 'It is the lowest point of the story'],
  },
  {
    key: 'return',
    short: 'Return',
    n: 8,
    title: 'Going home',
    harmon: 'Return',
    campbell: 'The Road Back',
    act: 3,
    at: [0.85, 0.95],
    brief: 'The hero brings what they learned back to the old world.',
    questions: [
      'How does the hero bring what they learned back to the old world?',
      'Who or what is waiting for them there?',
      'What final confrontation tests the lesson?',
      'What has changed in the old world while they were gone?',
    ],
    checks: ['The lesson is tested, not just stated'],
  },
  {
    key: 'change',
    short: 'Change',
    n: 9,
    title: 'Change',
    harmon: 'Change',
    campbell: 'Return with the Elixir',
    act: 3,
    at: [0.95, 1],
    brief: 'The hero is different now. Show it with one act the person from page 1 would never do.',
    questions: [
      'How is the hero different now?',
      'What ONE act would the person from page 1 never do?',
      'How does the ending answer your theme question?',
      'What is the final image — and how does it mirror the first?',
    ],
    checks: ['The change is shown as an action', 'It answers the theme question'],
  },
]

export const BEAT_KEYS = BEATS.map((b) => b.key)

export const emptyBeats = () =>
  Object.fromEntries(BEAT_KEYS.map((k) => [k, ''])) as Record<BeatKey, string>

export interface FieldDef {
  key: 'title' | 'hero' | 'want' | 'obstacle' | 'logline' | 'theme' | 'engine' | 'seed'
  label: string
  questions: string[]
  hint?: string
}

export const PITCH_FIELDS: FieldDef[] = [
  {
    key: 'hero',
    label: 'The hero',
    questions: [
      'Who is your hero? Their role plus one defining trait.',
      'What makes this person the worst — or best — person for this story?',
      'What is their flaw?',
    ],
  },
  {
    key: 'want',
    label: 'The want',
    questions: [
      'What does your hero want? One clear goal we can see.',
      'How would we know, just by watching, that they got it?',
      'Why does it matter to them so much?',
    ],
  },
  {
    key: 'obstacle',
    label: 'What stands in the way',
    questions: [
      'What stands in the way? Who or what is the opposing force?',
      'Why is this obstacle the hardest possible one for THIS hero?',
      'What happens if the obstacle wins?',
    ],
  },
  {
    key: 'logline',
    label: 'Your logline',
    hint: 'One sentence. Who the hero is, what they want, what stands in the way.',
    questions: [
      'Now say it in one sentence, in your own words.',
      'Could someone repeat it back after hearing it once?',
      'Does it make clear what the movie or show is?',
    ],
  },
  {
    key: 'theme',
    label: 'Theme (a question)',
    hint: 'One question the story answers through its ending.',
    questions: [
      'What one question does your story answer through its ending?',
      'What does your hero believe at the start — and does the ending prove or disprove it?',
      'What argument is the story having with itself?',
    ],
  },
]

export const ENGINE_FIELD: FieldDef = {
  key: 'engine',
  label: 'Series engine',
  hint: 'A conflict that can make a new story every week.',
  questions: [
    'What conflict can make a new story every week?',
    'What keeps your characters stuck together?',
    'Why will this conflict never fully resolve?',
    'What is the problem of a typical episode?',
    'What could episode 47 be about?',
  ],
}

export const SEASON_QUESTION = (b: BeatDef) =>
  `Across the whole season — ${b.brief.charAt(0).toLowerCase()}${b.brief.slice(1)}`

export const GENRES = [
  'Horror',
  'Thriller',
  'Comedy',
  'Drama',
  'Action',
  'Sci-Fi',
  'Fantasy',
  'Crime',
  'Mystery',
  'Romance',
  'Romantic Comedy',
  'Western',
  'War',
  'Musical',
  'Animation',
  'Documentary',
  'Other',
]

export const LOW_BUDGET_GENRES = ['Horror', 'Thriller', 'Comedy']

export const TIMES = ['DAY', 'NIGHT', 'MORNING', 'EVENING', 'DAWN', 'DUSK', 'CONTINUOUS', 'LATER']

// Dov Simens: one page ≈ one minute.
export function lengthTarget(kind: Kind, tv: TvFormat) {
  if (kind === 'film') return { min: 90, max: 110, target: 100, label: 'Feature: 90–110 pages' }
  if (tv === 'half') return { min: 28, max: 35, target: 30, label: 'Half-hour: ~30 pages' }
  return { min: 55, max: 60, target: 57, label: 'Hour-long: 55–60 pages' }
}

export function beatPages(b: BeatDef, kind: Kind, tv: TvFormat) {
  const { target } = lengthTarget(kind, tv)
  const a = Math.max(1, Math.round(b.at[0] * target))
  const z = Math.round(b.at[1] * target)
  return a === z ? `p. ${a}` : `p. ${a}–${z}`
}

export const SIMENS_RULES = [
  {
    title: 'One page ≈ one minute',
    body: 'A feature runs 90 to 110 pages. A half-hour TV show runs about 30. An hour-long show runs about 55 to 60.',
  },
  {
    title: 'Three acts',
    body: 'Act 1 is about a quarter of the pages, Act 2 is about half, and Act 3 is the last quarter.',
  },
  {
    title: 'Write for a small budget',
    body: 'Few places, a small cast, few night scenes, stunts or crowds. Every new location adds cost.',
  },
  {
    title: 'One genre',
    body: 'Pick one and stick to it. Horror, thriller and comedy sell best at low budgets.',
  },
  {
    title: 'Standard format',
    body: 'Scene headings (INT. KITCHEN - DAY), action lines, character names, and dialogue.',
  },
]

export const ACT_SHARE: Record<1 | 2 | 3, number> = { 1: 0.25, 2: 0.5, 3: 0.25 }
