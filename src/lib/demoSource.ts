// Preview build only: a sample left column so Remix can be tried without the server.
import type { Source } from './types'

export const DEMO_SOURCE: Source = {
  found: true,
  message: '',
  title: "Pirates of the Caribbean: Dead Man's Chest",
  year: '2006',
  kind: 'film',
  genre: 'Swashbuckler / fantasy adventure',
  tone: 'Swashbuckling comedy-adventure with supernatural horror',
  logline:
    "Pirate captain Jack Sparrow must find the chest holding Davy Jones's heart to escape his blood debt to Jones, while Will Turner and Elizabeth Swann, arrested on their wedding day, are forced into the hunt by a company lord who wants the heart to control the seas.",
  theme: 'Can you stay free when everyone, including you, is bargaining with their soul?',
  world: 'The Caribbean in the early 1700s, as the East India Trading Company tightens its grip on the seas and the age of pirates is ending.',
  worldRules:
    "Davy Jones rules the dead at sea and collects debts in souls. His crew slowly turn into sea creatures. Whoever holds his heart controls him. The Kraken hunts anyone marked with the Black Spot. Jack's compass points to what you want most.",
  hero: 'Captain Jack Sparrow, a roguish pirate captain',
  heroWant: "The key to the Dead Man's Chest, to free himself from his debt to Davy Jones",
  obstacle: 'Davy Jones, his crew and the Kraken, plus Lord Cutler Beckett and the East India Trading Company',
  characters: [
    { name: 'Jack Sparrow', role: 'Hero', description: 'Captain of the Black Pearl, a charming, unreliable pirate.', want: 'To escape his debt to Davy Jones', flaw: 'Self-interest; runs when cornered' },
    { name: 'Will Turner', role: 'Ally', description: 'Blacksmith turned reluctant pirate.', want: "To free Elizabeth, then his father", flaw: 'Rigid sense of honor; jealousy' },
    { name: 'Elizabeth Swann', role: 'Love interest', description: "The governor's daughter, arrested on her wedding day.", want: 'Freedom, and a life with Will', flaw: 'Will do something ruthless to survive' },
    { name: 'Davy Jones', role: 'Villain', description: 'Cursed captain of the Flying Dutchman.', want: "To collect Jack's soul and keep his heart hidden", flaw: 'Heartbreak he has cut out of himself' },
    { name: 'Lord Cutler Beckett', role: 'Villain', description: 'East India Trading Company lord.', want: 'The heart, to control the seas', flaw: 'Greed for power' },
    { name: 'James Norrington', role: 'Rival', description: 'Disgraced former commodore.', want: 'His honor and career back', flaw: 'Bitterness' },
    { name: 'Bootstrap Bill Turner', role: 'Other', description: "Will's father, bound to the Dutchman's crew.", want: 'To help his son', flaw: 'Slowly losing himself to the ship' },
    { name: 'Tia Dalma', role: 'Mentor', description: 'A mystic living in the bayou.', want: 'Her own hidden purposes', flaw: 'Secretive' },
  ],
  beats: {
    you: "Jack is back at sea with the Black Pearl, but his compass won't work. Will and Elizabeth's wedding is broken up by Beckett's arrest.",
    want: "Jack wants the chest with Davy Jones's heart. Will is sent to get Jack's compass to buy Elizabeth's freedom.",
    push: "Bootstrap Bill tells Jack his debt is due and marks him with the Black Spot. The Kraken is coming for him.",
    go: 'Jack consults Tia Dalma and trades Will to the Flying Dutchman as a down payment while he hunts for the key.',
    search: 'Will is pressed into Jones’s crew and finds his father. Elizabeth escapes and joins Jack. Norrington signs on. Will steals the key.',
    find: 'Every party converges on Isla Cruces and digs up the chest. The heart is in reach.',
    take: 'Norrington takes the heart to Beckett. The Kraken attacks the Pearl, and Elizabeth chains Jack to the mast. Jack and his ship go down.',
    return: "The survivors take refuge with Tia Dalma, grieving and divided.",
    change: "Before the end, Jack chooses to turn back and face the Kraken. The crew agrees to sail to the ends of the earth to bring him back.",
  },
  engine: '',
  setPieces: [
    { name: 'Cannibal island escape', description: 'Jack and his crew escape an island tribe in hanging bone cages.' },
    { name: 'Liar’s dice', description: 'Will gambles against Davy Jones for his soul and the key.' },
    { name: 'Water-wheel duel', description: 'A three-way sword fight rolls across the island on a loose mill wheel.' },
    { name: 'Kraken attacks', description: 'The Kraken destroys a merchant ship, then attacks the Black Pearl.' },
  ],
  locations: [
    { name: 'Port Royal', description: 'The colonial town where the wedding is broken up.' },
    { name: 'Pelegosto island', description: 'The island where Jack is held by a tribe.' },
    { name: 'Tia Dalma’s shack', description: 'A mystic’s hut up a bayou river.' },
    { name: 'Tortuga', description: 'Pirate port where Jack recruits a crew.' },
    { name: 'The Flying Dutchman', description: 'Davy Jones’s ship of cursed sailors.' },
    { name: 'Isla Cruces', description: 'The island where the chest is buried.' },
  ],
  objects: [
    { name: 'The Dead Man’s Chest', description: "Holds Davy Jones's still-beating heart." },
    { name: 'The key', description: 'Opens the chest; Jones keeps it on him.' },
    { name: 'Jack’s compass', description: 'Points to what the holder wants most.' },
    { name: 'The Black Spot', description: 'A mark that sets the Kraken on its target.' },
  ],
  notable: [
    { label: 'Comic cowardice', text: "Jack's habit of running is played for laughs until the end, when he turns back." },
    { label: 'Cliffhanger', text: 'As the middle film of a trilogy, it ends on a loss and a surprise return.' },
    { label: 'Music box / locket', text: "Davy Jones's heartbreak is told through a recurring melody." },
    { label: 'Love triangle', text: 'Tension between Jack, Elizabeth and Will drives choices on all sides.' },
  ],
}
