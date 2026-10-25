// Genre playbook: fixed reference notes on what each genre promises an audience.
// These describe the genre, never a story. All story content still comes from the writer.

export type Cost = '$' | '$$' | '$$$'

export interface Playbook {
  promise: string
  conventions: string[]
  setPieces: string[]
  hero: string
  opposition: string
  cost: Cost
  budget: string
}

const P = (
  promise: string,
  conventions: string[],
  setPieces: string[],
  hero: string,
  opposition: string,
  cost: Cost,
  budget: string
): Playbook => ({ promise, conventions, setPieces, hero, opposition, cost, budget })

export const PLAYBOOK: Record<string, Playbook> = {
  Action: P(
    'Adrenaline: a capable hero, escalating physical danger, and a decisive final fight.',
    ['Clear, physical goal with a ticking clock', 'Each sequence bigger than the last', 'Hero is outnumbered or outgunned', 'Villain is a match for the hero'],
    ['The opening demonstration of skill', 'A chase', 'The final one-on-one showdown'],
    'Skilled professional, or ordinary person forced to become one',
    'Organised, ruthless antagonist with resources',
    '$$$',
    'Stunts, vehicles and crowds are expensive. Contained action (one building, one night) keeps it low.'
  ),
  Adventure: P(
    'Wonder and discovery: a journey into an unfamiliar world in pursuit of something precious.',
    ['A map, quest or prize to chase', 'A new world with its own rules', 'A team with complementary skills', 'Obstacles of nature as well as people'],
    ['Crossing into the unknown', 'A trap or puzzle', 'Claiming the prize, then escaping with it'],
    'Curious or reluctant explorer',
    'Rival seekers, hostile terrain, guardians of the prize',
    '$$$',
    'Many locations and travel. Limit the number of worlds and reuse sets.'
  ),
  Animation: P(
    'A heightened, stylised world where anything can be drawn: usually emotional, visual and family-friendly.',
    ['Strong visual concept', 'Clear emotional lesson', 'Expressive characters, often non-human', 'Humour for kids and adults'],
    ['The world-establishing opening', 'A montage or musical moment', 'The big emotional reunion or sacrifice'],
    'Underdog who does not fit their world',
    'Someone who wants to keep the world as it is',
    '$$$',
    'Cost is in the production pipeline, not locations. Scripts are often written for a studio.'
  ),
  Biopic: P(
    'The truth behind a real person: how they became who history remembers.',
    ['Real events compressed into a shaped arc', 'A defining choice or turning point', 'Period detail', 'The cost of greatness on private life'],
    ['The moment of discovery or breakthrough', 'The public triumph', 'The private loss'],
    'Historical figure with a visible flaw',
    'The establishment, rivals, or the person’s own nature',
    '$$',
    'Period settings cost money. Focus on a short slice of the life to contain it. Check rights to life stories.'
  ),
  Buddy: P(
    'Two mismatched people forced together until they need each other.',
    ['Opposites in temperament or method', 'A shared goal neither can reach alone', 'Banter as conflict', 'A split before the reunion'],
    ['The meet-awkward', 'The first time they work as a team', 'The fight that breaks them up'],
    'Two leads with opposite flaws',
    'An outside threat that needs both of them',
    '$$',
    'Casting two leads is the main cost. Settings can be modest.'
  ),
  Comedy: P(
    'Laughter: a flawed character under escalating pressure in a world that keeps getting worse.',
    ['A clear comic premise you can say in one line', 'Characters who never see their own flaw', 'Escalation of embarrassment', 'Set-ups that pay off later'],
    ['The premise-establishing disaster', 'The big public humiliation', 'Everything goes wrong at once'],
    'Lovable mess with an obvious flaw',
    'Authority figure, rival, or the hero’s own worst habits',
    '$',
    'One of Simens’ low-budget sellers. Few locations, funny dialogue and performance do the work.'
  ),
  'Coming-of-Age': P(
    'The moment childhood ends: a young person learns who they are.',
    ['A summer, a school year or a single night', 'A first: love, loss, betrayal, freedom', 'Parents who do not understand', 'Friends who change or leave'],
    ['The party', 'The first kiss or first fight', 'The goodbye'],
    'Teenager on the edge of adulthood',
    'Parents, peers, or the hero’s own fear',
    '$',
    'Usually contained: home, school, town. Young casts can be affordable.'
  ),
  Crime: P(
    'Inside the underworld: how crime works, what it costs, and who pays.',
    ['A crime at the centre', 'Rules of the criminal world', 'Loyalty and betrayal', 'The law closing in'],
    ['The job', 'The double-cross', 'The arrest or the shoot-out'],
    'Criminal, cop, or someone caught in between',
    'Rival gangs, the law, a partner who flips',
    '$$',
    'Can be contained (one city, interiors at night). Night work and gunfire add cost.'
  ),
  Cyberpunk: P(
    'High tech, low life: a gritty future where technology has outpaced humanity.',
    ['Corporations with more power than governments', 'Body or mind augmentation', 'Hackers and outsiders', 'Neon, rain and night cities'],
    ['The hack or heist into the system', 'A chase through the city', 'Confronting the machine or the company'],
    'Outsider with a technical edge',
    'A corporation, an AI, or a corrupt system',
    '$$$',
    'Visual effects and night exteriors are costly. Interiors and practical lighting can fake scale.'
  ),
  'Dark Comedy': P(
    'Laughing at what should not be funny: death, crime or cruelty played with a straight face.',
    ['A grim situation treated matter-of-factly', 'Characters making terrible choices calmly', 'Escalation into absurdity', 'A moral sting at the end'],
    ['The mistake that starts everything', 'The cover-up that makes it worse', 'The darkly funny climax'],
    'Ordinary person who does something terrible',
    'Consequences, witnesses, the law',
    '$',
    'Usually contained and dialogue-driven. Low budget works well.'
  ),
  Disaster: P(
    'Survival against a catastrophe: who lives, who dies, and who they become.',
    ['Warnings that are ignored', 'A group of strangers thrown together', 'Ticking clock as things collapse', 'Sacrifice'],
    ['The first sign', 'The catastrophe hits', 'The escape'],
    'Expert nobody listened to, or a parent protecting family',
    'Nature, the disaster itself, selfish survivors',
    '$$$',
    'Effects-heavy. A contained version (one building, one boat) can work at lower cost.'
  ),
  Documentary: P(
    'Reality, revealed: a true story, issue or person seen in a new way.',
    ['A central question', 'Access to real people or footage', 'A point of view', 'A structure built in the edit'],
    ['The reveal interview', 'The archival discovery', 'The confrontation or the turning point'],
    'The subject, or the filmmaker on a quest',
    'The truth being hidden, or circumstances',
    '$',
    'Cheap to shoot, expensive in time. Archive and music licensing can add up.'
  ),
  Drama: P(
    'Emotional truth: people under pressure making choices that reveal who they are.',
    ['A personal stake that matters deeply', 'Relationships under strain', 'A choice with no easy answer', 'Change through suffering'],
    ['The confrontation scene', 'The breakdown', 'The quiet resolution'],
    'Someone at a crossroads',
    'Family, society, or the hero’s own past',
    '$',
    'Dialogue and performance carry it. Few locations work well.'
  ),
  Family: P(
    'Heart and fun for every age: belonging, courage and home.',
    ['Kid or animal at the centre', 'A family that needs fixing', 'Gentle danger', 'A warm ending'],
    ['The adventure begins', 'The chaos sequence', 'The family reunion'],
    'Child, pet, or a parent learning a lesson',
    'A grumpy adult, a villainous scheme, or time running out',
    '$$',
    'Animals and child actors add schedule limits. Keep effects simple.'
  ),
  Fantasy: P(
    'Magic: a world with its own rules where the impossible is real.',
    ['A system of magic with costs and limits', 'A chosen or unlikely hero', 'Mythic creatures or lands', 'An ancient evil'],
    ['Discovering the magic', 'The first real use of power', 'The final battle with the dark force'],
    'Unlikely chosen one',
    'Dark lord, ancient curse, rival magic users',
    '$$$',
    'World-building is expensive. Low-budget fantasy keeps the magic small and personal.'
  ),
  'Film Noir': P(
    'Shadows and fate: a doomed protagonist drawn into crime by desire.',
    ['Cynical narrator or point of view', 'A femme or homme fatale', 'Moral corruption everywhere', 'Usually a downbeat ending'],
    ['The meeting with the fatal attraction', 'The crime', 'The betrayal'],
    'Weary investigator or easily tempted everyman',
    'The fatal lover, the city, the hero’s own weakness',
    '$',
    'Night interiors, few characters, lots of dialogue. Great for low budgets.'
  ),
  Gangster: P(
    'Rise and fall: power, family and loyalty inside organised crime.',
    ['The climb from nothing', 'A code of honour', 'Family versus the business', 'Paranoia at the top'],
    ['The first hit', 'The peak of power', 'The fall'],
    'Ambitious outsider who joins the family',
    'Rivals, the law, and the hero’s own greed',
    '$$',
    'Period settings and violence add cost. Interiors and dialogue keep it down.'
  ),
  Heist: P(
    'The perfect plan: a crew pulls off an impossible job, then everything goes wrong.',
    ['The score and why it matters', 'Assembling the crew, each with a skill', 'The plan explained', 'The twist that changes the plan'],
    ['Recruiting the crew', 'The job itself', 'The reveal of the real plan'],
    'Mastermind with one last job',
    'Security, the target, a traitor in the crew',
    '$$',
    'One main location (the target) can keep it contained.'
  ),
  'Historical / Period': P(
    'Another time, made vivid: how people lived and what they risked then.',
    ['Accurate period world', 'Social rules of the era as conflict', 'Big events in the background', 'Personal story in the foreground'],
    ['The world-establishing opening', 'The historic event intrudes', 'The defiant choice'],
    'Someone at odds with the rules of their time',
    'Society, war, the powerful',
    '$$$',
    'Costumes, props and locations cost money. Choose eras and places you can recreate cheaply.'
  ),
  Horror: P(
    'Fear: something threatening hunts the characters, and not everyone survives.',
    ['A threat with rules', 'Isolation: no help is coming', 'Characters who ignore warnings', 'Escalating scares to a final confrontation'],
    ['The first kill or first sign', 'The investigation into the threat', 'The final survivor faces it'],
    'Ordinary person who must survive',
    'Monster, killer, ghost, or curse',
    '$',
    'Simens’ favourite low-budget seller. One location, small cast, practical effects.'
  ),
  Legal: P(
    'Justice on trial: the truth fought over in court.',
    ['A case with high stakes', 'Lawyer with a personal stake', 'Evidence and surprise witnesses', 'The verdict'],
    ['Taking the case', 'The cross-examination', 'The closing argument'],
    'Underdog lawyer or defendant',
    'Powerful opposing counsel, a corrupt system',
    '$',
    'Courtrooms and offices are cheap. Dialogue-driven.'
  ),
  'Martial Arts': P(
    'Mastery: discipline, honour and spectacular fights.',
    ['Training or a teacher', 'A code of honour', 'Escalating opponents', 'A final fight that tests both skill and character'],
    ['The training montage', 'The tournament or first big fight', 'The final duel'],
    'Student, or master with a past',
    'Rival school, a villain who broke the code',
    '$$',
    'Needs skilled performers and fight choreography rather than big sets.'
  ),
  Medical: P(
    'Life and death on the job: doctors, patients and impossible choices.',
    ['Cases that mirror personal stories', 'Hierarchy and rivalry', 'Ethical dilemmas', 'Burnout'],
    ['The emergency', 'The diagnosis', 'Losing a patient'],
    'Brilliant or idealistic doctor',
    'Illness, the hospital system, a rival',
    '$$',
    'One hospital set reused endlessly. A TV staple.'
  ),
  Mockumentary: P(
    'Comedy dressed as a documentary: real people being ridiculous on camera.',
    ['Talking-head interviews', 'Characters unaware of how they look', 'Awkward silences', 'An event the story builds toward'],
    ['The interview reveal', 'The public embarrassment', 'The big event'],
    'Deluded subject of the film',
    'Reality, rivals, the camera',
    '$',
    'Handheld and natural light. Very low budget.'
  ),
  Monster: P(
    'Something huge or unnatural threatens us, and must be stopped.',
    ['The creature’s rules and weakness', 'Early glimpses before the full reveal', 'Experts who are ignored', 'Humans who make it worse'],
    ['The first attack', 'The full reveal', 'Defeating the monster'],
    'Scientist, survivor, or hunter',
    'The creature, and people who want to use it',
    '$$',
    'Hide the monster to save money. Show less, scare more.'
  ),
  Musical: P(
    'Emotion so big it has to be sung.',
    ['Songs that move the story forward', 'An “I want” song early on', 'A show-stopper', 'Big final number'],
    ['The opening number', 'The “I want” song', 'The finale'],
    'Dreamer with a big want',
    'Society, a rival, or self-doubt',
    '$$$',
    'Music rights, choreography and rehearsal. Original songs are cheaper than licensed ones.'
  ),
  Mystery: P(
    'A puzzle: who did it, how, and why.',
    ['A crime or secret to solve', 'Clues fairly hidden', 'Suspects with motives', 'The reveal that reframes everything'],
    ['Discovering the crime', 'The false solution', 'The final reveal'],
    'Detective, amateur or professional',
    'The hidden culprit',
    '$',
    'Few locations, lots of dialogue. A country house or one town works.'
  ),
  Political: P(
    'Power: who has it, who wants it, and what they will do for it.',
    ['Institutions as battlegrounds', 'Deals and betrayals', 'Public versus private face', 'Consequences for ordinary people'],
    ['The leak or scandal', 'The vote or the debate', 'The betrayal'],
    'Idealist or operator',
    'Rival politicians, the system, the press',
    '$$',
    'Offices and corridors. Crowds and real locations add cost.'
  ),
  'Post-Apocalyptic': P(
    'After the end: survival and humanity in a broken world.',
    ['What ended the world, and what is left', 'Scarce resources', 'Groups with their own rules', 'Hope as the rarest thing'],
    ['Scavenging', 'Meeting other survivors', 'The fight for the safe place'],
    'Survivor protecting someone',
    'Raiders, the environment, the hero’s loss of humanity',
    '$$',
    'Empty landscapes are cheap. Destroyed cities are not.'
  ),
  Procedural: P(
    'The job done well: a case each episode, solved by professionals.',
    ['A case-of-the-week engine', 'Team with defined roles', 'Methods shown step by step', 'Personal arcs in the background'],
    ['The case comes in', 'The breakthrough', 'The arrest or resolution'],
    'Expert team leader',
    'The criminal of the week, plus a season-long threat',
    '$$',
    'Built for TV. Standing sets (the office, the lab) keep episodes affordable.'
  ),
  'Psychological Thriller': P(
    'Inside a mind under pressure: what is real, and who can be trusted?',
    ['An unreliable perception', 'Paranoia and doubt', 'Close relationships turned dangerous', 'A twist that reframes the story'],
    ['The first strange event', 'The hero is not believed', 'The truth revealed'],
    'Person whose sanity is in question',
    'A manipulator, or the hero’s own mind',
    '$',
    'One house, a small cast. A strong low-budget seller.'
  ),
  Romance: P(
    'Love against the odds: two people who belong together, kept apart.',
    ['The meet', 'What keeps them apart', 'Falling for each other anyway', 'Grand gesture before the end'],
    ['The meet-cute', 'The first kiss', 'The grand gesture'],
    'Someone afraid of love',
    'Circumstance, family, a rival, or fear itself',
    '$',
    'Two leads and everyday places. Low budget.'
  ),
  'Romantic Comedy': P(
    'Falling in love, and laughing all the way: two opposites who are perfect together.',
    ['A comic premise that forces them together', 'Opposites attract', 'A lie or secret', 'The break-up before the end'],
    ['The meet-cute', 'The fake-relationship moment that turns real', 'The public declaration'],
    'Someone who thinks they do not need love',
    'The lie, the rival, the hero’s own stubbornness',
    '$',
    'Low budget, high appeal. Simens’ comedy rule applies.'
  ),
  Samurai: P(
    'Honour and the sword: duty, loyalty and death in feudal Japan or a world like it.',
    ['A code of honour', 'A lord, a debt or a duty', 'Masterless warriors', 'Swordfights decided in a moment'],
    ['The first duel', 'The siege or the stand', 'The final duel'],
    'Masterless warrior with a code',
    'A corrupt lord, bandits, a rival swordsman',
    '$$$',
    'Period costumes and horses. Keep it to a village to contain cost.'
  ),
  Satire: P(
    'Truth through exaggeration: mocking the powerful and the absurd.',
    ['A real target being mocked', 'Exaggeration of real behaviour', 'A straight-faced world', 'A sharp point of view'],
    ['The absurd premise in action', 'Escalation to madness', 'The final sting'],
    'Innocent or cynic inside the absurd system',
    'The system being satirised',
    '$',
    'Ideas over spectacle. Low budget works.'
  ),
  'Sci-Fi': P(
    'What if: an idea about science or the future, explored through people.',
    ['One big “what if”', 'Rules of the technology or world', 'Consequences of the idea', 'Human stakes inside the concept'],
    ['Discovering the impossible', 'The idea goes wrong', 'Using the idea to win'],
    'Scientist, explorer, or ordinary person who discovers the idea',
    'The technology, aliens, or people who misuse it',
    '$$',
    'Big concepts can be told in small rooms. Contained sci-fi is a proven low-budget route.'
  ),
  Sitcom: P(
    'Comfort and laughs: the same people, the same place, new trouble every week.',
    ['A home base location', 'Characters who never fully change', 'A clear comic engine', 'Problem in, problem out each episode'],
    ['The cold open', 'The scheme', 'The tag'],
    'Ensemble around a central character',
    'Each other, and the week’s problem',
    '$',
    'Built on standing sets. Very affordable per episode.'
  ),
  Slasher: P(
    'One killer, many victims, and one survivor who fights back.',
    ['A masked or mysterious killer', 'A group picked off one by one', 'Rules of survival', 'The final survivor'],
    ['The opening kill', 'The discovery of bodies', 'The final chase'],
    'The final survivor',
    'The killer',
    '$',
    'The classic low-budget horror. One location, young cast, practical effects.'
  ),
  'Soap / Melodrama': P(
    'Big emotions, bigger secrets: love, betrayal and family drama.',
    ['Hidden secrets and returns from the past', 'Love triangles', 'Family dynasties', 'Cliffhangers'],
    ['The secret revealed', 'The wedding interrupted', 'The cliffhanger'],
    'Wronged heroine or hero',
    'Scheming relative or rival',
    '$',
    'Interiors and talk. Very affordable per page.'
  ),
  'Space Opera': P(
    'Epic adventure among the stars: empires, rebels and destiny.',
    ['Galactic stakes', 'Ships, planets and alien cultures', 'Chosen hero and loyal crew', 'Good versus evil'],
    ['The space battle', 'The escape from a planet', 'The final assault'],
    'Farm kid or outlaw with a destiny',
    'An empire and its enforcer',
    '$$$',
    'Effects-heavy. One of the most expensive genres.'
  ),
  Sports: P(
    'The underdog shot at glory: training, teamwork and the big game.',
    ['An underdog team or player', 'A coach or mentor', 'Training montage', 'The big game decides everything'],
    ['The tryout', 'The training montage', 'The final game'],
    'Underdog athlete or coach',
    'Rival team, injury, self-doubt',
    '$$',
    'Crowds and stadiums cost money. Shoot tight and fill with sound.'
  ),
  Spy: P(
    'Secrets and betrayal: agents, missions and who can be trusted.',
    ['A mission with global stakes', 'Gadgets, tradecraft or both', 'A mole or double agent', 'Exotic locations'],
    ['The briefing', 'The infiltration', 'Unmasking the traitor'],
    'Agent with a secret of their own',
    'Enemy agency, traitor, mastermind',
    '$$$',
    'Travel and action are costly. Grounded, talky spy stories are cheaper.'
  ),
  Superhero: P(
    'Power and responsibility: an extraordinary person decides how to use their gift.',
    ['Origin of the power', 'A secret identity', 'A villain who mirrors the hero', 'Saving the city or the world'],
    ['Discovering the power', 'The first public save', 'The final battle with the villain'],
    'Ordinary person given extraordinary power',
    'A villain with a twisted version of the same power',
    '$$$',
    'Effects-heavy. Grounded takes with small powers can work cheaply.'
  ),
  Supernatural: P(
    'The unseen is real: ghosts, spirits and forces beyond understanding.',
    ['Rules of the supernatural', 'A sceptic who must believe', 'A history behind the haunting', 'Communication with the other side'],
    ['The first sign', 'Researching the past', 'Confronting the presence'],
    'Sceptic or sensitive',
    'The spirit, curse, or those who unleashed it',
    '$',
    'A haunted house is the cheapest location in film.'
  ),
  Survival: P(
    'Alive against the odds: the body and will tested to the limit.',
    ['A situation with no escape', 'Dwindling resources', 'Nature as the opponent', 'Character revealed under pressure'],
    ['The accident', 'The failed rescue attempt', 'The final push to safety'],
    'Ordinary person in an extreme place',
    'Nature, time, injury, and the hero’s own despair',
    '$$',
    'One location and a tiny cast. Remote shooting adds logistics.'
  ),
  Swashbuckler: P(
    'Daring and dash: swordfights, rogues and adventure on the high seas or in the palace.',
    ['A charismatic rogue', 'Swordplay with wit', 'Treasure, honour or a throne at stake', 'Romance and rescue'],
    ['The swordfight', 'The daring escape', 'The final duel'],
    'Charming rogue or wronged noble',
    'Corrupt officials, rival pirates, a usurper',
    '$$$',
    'Ships, costumes and fights are expensive. Keep it to a few interiors and a coastline.'
  ),
  Teen: P(
    'High school as the whole world: friends, status, love and identity.',
    ['Cliques and social hierarchy', 'Parties and dances', 'First love', 'Being yourself versus fitting in'],
    ['The first day', 'The party', 'The dance or graduation'],
    'Outsider or popular kid with a secret',
    'The popular crowd, parents, the hero’s own insecurity',
    '$',
    'Schools and houses. Affordable and popular.'
  ),
  Thriller: P(
    'Suspense: a hero in danger, racing against time and a dangerous opponent.',
    ['A ticking clock', 'A smart, dangerous antagonist', 'Twists and reversals', 'The hero is out of their depth'],
    ['The inciting threat', 'The chase or near-capture', 'The final confrontation'],
    'Ordinary person or professional in over their head',
    'Killer, conspiracy, or hunter',
    '$',
    'One of Simens’ low-budget sellers. Tension costs nothing.'
  ),
  War: P(
    'Courage and horror under fire: brotherhood, sacrifice and survival.',
    ['A unit with distinct personalities', 'A mission', 'The cost of violence', 'Survival is not guaranteed'],
    ['The first battle', 'The quiet night before', 'The final stand'],
    'Soldier, medic, or civilian caught in it',
    'The enemy, command, and war itself',
    '$$$',
    'Battles, period props and crowds are costly. Small-unit stories keep it down.'
  ),
  Western: P(
    'Law and lawlessness on the frontier: justice settled by individuals.',
    ['The frontier as a place without law', 'A code of honour', 'Land, water, gold or revenge at stake', 'The showdown'],
    ['Riding into town', 'The ambush', 'The showdown'],
    'Lone rider, lawman, or outlaw',
    'Outlaw gang, railroad baron, corrupt sheriff',
    '$$',
    'Horses and period settings cost money. One town and a desert keep it contained.'
  ),
  'Workplace Comedy': P(
    'Comedy at work: colleagues, bosses and the absurdity of the job.',
    ['A workplace everyone recognises', 'A mix of personalities', 'Petty rivalries and big egos', 'Will-they-won’t-they'],
    ['The new hire', 'The office event', 'The boss crisis'],
    'Ordinary worker or new arrival',
    'The boss, a rival coworker, the company',
    '$',
    'One standing set. Ideal for TV.'
  ),
  Zombie: P(
    'The dead walk: survival, society collapsing, and the living as the real threat.',
    ['The outbreak', 'Rules of the infection', 'A group of survivors', 'Humans turn on each other'],
    ['The first zombie', 'The siege of the safe place', 'The escape'],
    'Survivor protecting a group',
    'The horde, and other survivors',
    '$',
    'Make-up and extras, but contained settings keep it low.'
  ),
}

export const playbook = (g: string): Playbook | undefined => PLAYBOOK[g]
