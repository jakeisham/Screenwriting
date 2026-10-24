// Server-only: asks Claude for a FACTUAL breakdown of an existing film or TV show.
// Claude describes the original work only. It never suggests ideas for the writer's version.
import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'

const Named = z.object({ name: z.string(), description: z.string() })

export const SourceSchema = z.object({
  found: z.boolean().describe('false if you do not confidently know this specific work'),
  message: z.string().describe('If not found or ambiguous, a short note for the user. Otherwise empty.'),
  title: z.string(),
  year: z.string(),
  kind: z.enum(['film', 'tv']),
  genre: z.string().describe('Primary genre, plus subgenre if useful'),
  tone: z.string(),
  logline: z.string().describe('One sentence: who the hero is, what they want, what stands in the way'),
  theme: z.string().describe('The central question the story answers through its ending'),
  world: z.string().describe('Setting: time, place, social world'),
  worldRules: z.string().describe('The special rules of this world (magic, curses, technology, codes)'),
  hero: z.string().describe('The protagonist, in a few words'),
  heroWant: z.string().describe('What the protagonist wants that we can see on screen'),
  obstacle: z.string().describe('The main opposing force'),
  characters: z.array(
    z.object({
      name: z.string(),
      role: z.enum(['Hero', 'Villain', 'Mentor', 'Ally', 'Love interest', 'Sidekick', 'Rival', 'Trickster', 'Other']),
      description: z.string(),
      want: z.string(),
      flaw: z.string(),
    })
  ),
  beats: z.object({
    you: z.string(),
    want: z.string(),
    push: z.string(),
    go: z.string(),
    search: z.string(),
    find: z.string(),
    take: z.string(),
    return: z.string(),
    change: z.string(),
  }),
  engine: z.string().describe('TV only: the conflict that generates a new story every episode. Empty for films.'),
  setPieces: z.array(Named),
  locations: z.array(Named),
  objects: z.array(Named).describe('MacGuffins, iconic props, key objects'),
  notable: z
    .array(z.object({ label: z.string(), text: z.string() }))
    .describe('Other elements a writer should know: motifs, running gags, structure tricks, signature tone devices'),
})

export type Source = z.infer<typeof SourceSchema>

const SYSTEM = `You are a story analyst producing a factual breakdown of an EXISTING, published film or TV show for a screenwriter.

Rules:
- Describe ONLY what is actually in the original work. Never invent, never speculate, never suggest new ideas, adaptations, genre swaps, or improvements. The writer will create their own version themselves; your job is the reference column only.
- If you do not confidently know the specific work (or the title is ambiguous), set found=false, explain briefly in "message", and leave the other fields empty or minimal. Do not guess.
- For TV shows, describe the series premise and the pilot/first season arc; fill "engine". For films, leave "engine" empty.
- Map the plot onto these 9 story steps (Dan Harmon's Story Circle / Hero's Journey):
  you = hero in their normal world; want = the clear visible want; push = the event that forces a choice; go = the hero chooses to leave the old world (end of Act 1); search = new world, tests, allies, enemies, failures; find = the hero gets what they wanted around the midpoint, at a cost; take = the big loss / lowest point; return = bringing what they learned back; change = how the hero is different, shown through an act.
- List the main characters (usually 5-10): the hero, the villain(s), mentor, allies, love interest, rivals.
- List 4-8 set pieces, the key locations, and the key objects.
- Be concise: 1-3 sentences per field. Plain language. Do not quote dialogue beyond a few words.`

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

// No sign-in in this single-owner app, so only accept requests made from the app's own pages.
// (A browser always sends Origin on a cross-site POST, so other websites can't call this.)
function checkOrigin(origin: string | null, referer: string | null) {
  const src = origin || referer
  if (!src) throw new HttpError(403, 'Requests must come from the Writers’ Room app.')
  let host = ''
  try {
    host = new URL(src).hostname
  } catch {
    throw new HttpError(403, 'Requests must come from the Writers’ Room app.')
  }
  const allowed =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === 'screenwriting-blond.vercel.app' ||
    /^screenwriting-[a-z0-9-]+-jakeishams-projects\.vercel\.app$/.test(host) ||
    host === 'screenwriting-jakeishams-projects.vercel.app' ||
    (process.env.ALLOWED_HOST ?? '') === host
  if (!allowed) throw new HttpError(403, 'Requests must come from the Writers’ Room app.')
}

export async function breakdown(body: unknown, origin: string | null, referer: string | null): Promise<Source> {
  if (!process.env.ANTHROPIC_API_KEY) throw new HttpError(503, 'ANTHROPIC_API_KEY is not set on the server. See README → Remix.')
  checkOrigin(origin, referer)

  const { title, kind } = (body ?? {}) as { title?: string; kind?: string }
  const t = (title ?? '').trim().slice(0, 200)
  if (!t) throw new HttpError(400, 'Enter a title.')
  const hint = kind === 'tv' ? ' (a TV show)' : kind === 'film' ? ' (a film)' : ''

  const client = new Anthropic()
  try {
    const res = await client.beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: betaZodOutputFormat(SourceSchema) },
      system: SYSTEM,
      messages: [{ role: 'user', content: `Break down: ${t}${hint}` }],
    })
    if (res.stop_reason === 'refusal') throw new HttpError(422, 'Claude declined to break down that title.')
    if (res.stop_reason === 'max_tokens' || !res.parsed_output) throw new HttpError(502, 'The breakdown came back incomplete. Try again.')
    return res.parsed_output
  } catch (e) {
    if (e instanceof HttpError) throw e
    if (e instanceof Anthropic.RateLimitError) throw new HttpError(429, 'Too many requests right now. Try again in a minute.')
    if (e instanceof Anthropic.AuthenticationError) throw new HttpError(503, 'The server’s Anthropic API key is invalid.')
    if (e instanceof Anthropic.APIError) throw new HttpError(502, `Claude API error (${e.status}). Try again.`)
    throw e
  }
}

// Web-standard handler shared by Vercel and the Vite dev server.
export async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 })
  try {
    const data = await breakdown(await req.json().catch(() => ({})), req.headers.get('origin'), req.headers.get('referer'))
    return Response.json(data)
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status })
  }
}
