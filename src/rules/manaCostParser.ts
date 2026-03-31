import type { ManaCost } from './types'
import type { ManaType } from '../types'

const COLOR_SYMBOLS: ManaType[] = ['W', 'U', 'B', 'R', 'G', 'C']

/**
 * Parses a Scryfall mana cost string into a structured ManaCost.
 * Called once at module initialization — not at runtime.
 *
 * Examples:
 *   '{2}{U}'     → { generic: 2, colored: { U: 1 }, variable: false, cmc: 3 }
 *   '{U}{U}'     → { generic: 0, colored: { U: 2 }, variable: false, cmc: 2 }
 *   '{X}{B}{B}'  → { generic: 0, colored: { B: 2 }, variable: true,  cmc: 2 }
 *   '{0}'        → { generic: 0, colored: {},        variable: false, cmc: 0 }
 */
export function parseManaCost(scryfall: string): ManaCost {
  if (!scryfall) {
    return { generic: 0, variable: false, colored: {}, cmc: 0 }
  }

  const tokens = scryfall.match(/\{[^}]+\}/g) ?? []
  let generic = 0
  let variable = false
  const colored: Partial<Record<ManaType, number>> = {}

  for (const token of tokens) {
    const sym = token.slice(1, -1) // strip braces
    if (sym === 'X') {
      variable = true
    } else if (COLOR_SYMBOLS.includes(sym as ManaType)) {
      const color = sym as ManaType
      colored[color] = (colored[color] ?? 0) + 1
    } else {
      const n = parseInt(sym, 10)
      if (!isNaN(n)) generic += n
    }
  }

  const colorPips = Object.values(colored).reduce((a: number, b) => a + (b ?? 0), 0)
  const cmc = generic + colorPips

  return { generic, variable, colored, cmc }
}
