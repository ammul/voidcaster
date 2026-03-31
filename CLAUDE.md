# Voidcaster — Claude Code Context

## Project

Voidcaster is a **client-side cEDH combo simulator** focused on the **Inalla, Archmage Ritualist**
(Wizard's Chess) archetype. It teaches players how to execute three winning combo lines against
realistic AI opponents. There is no backend — all game logic runs in the browser (Vue 3 + TypeScript
+ Pinia). No auth, no persistence, no server. Scryfall API provides real card data.

Full domain reference: [`docs/cedh-domain.md`](docs/cedh-domain.md) — read this before touching
interaction logic, archetypes, or combo step text.

---

## File Map

| File | Responsibility |
|---|---|
| `src/types.ts` | All domain types: `GameCard`, `Zone`, `ManaType`, `ComboStep`, etc. |
| `src/data/archetypes.ts` | 8 opponent archetypes with counters, removal, stax, politics, and `KEY_WIZARDS` |
| `src/data/combos.ts` | 3 combo definitions with per-step actions, mana changes, and validators |
| `src/data/decklist.ts` | 99-card Wizard's Chess decklist (source of truth for card names in the app) |
| `src/data/exampleHands.ts` | Pre-curated opening hands for each tutorial scenario |
| `src/interaction/HeuristicEngine.ts` | AI opponent logic — 5 branches evaluated per game action |
| `src/interaction/InteractionEngine.ts` | `InteractionEngine` interface + `GameAction`/`GameState` types |
| `src/interaction/prng.ts` | Mulberry32 seeded RNG for reproducible opponent behavior |
| `src/stores/gameStore.ts` | Core game state: zones, mana, life, turns, card operations |
| `src/stores/interactionStore.ts` | Opponent decision queue, stagger reveal, action evaluation |
| `src/stores/tutorialStore.ts` | Active combo tracking, step index, `canAdvance`, validation |
| `src/stores/settingsStore.ts` | Interaction mode, PRNG seed, meta profile, per-seat overrides |
| `src/stores/scryfallStore.ts` | Scryfall API calls, dual-layer caching, lazy image loading |
| `src/composables/useScryfall.ts` | Queue-based Scryfall fetch (75ms delays, memory dedup) |
| `src/composables/useInallaToken.ts` | Wizard ETB detection and token creation UI |

---

## Architecture Notes

**PRNG seed system:** All opponent decisions use `Mulberry32` seeded RNG. The seed is hex (8 digits),
stored in `settingsStore`. Changing the seed changes opponent behavior deterministically — this is
intentional for testing and repeatability. Never replace `this.rng()` calls with `Math.random()`.

**Action event bus:** `gameStore` emits `GameAction` objects to `interactionStore` on relevant events
(cast spell, creature ETB, phase change). `interactionStore` passes each action to `HeuristicEngine`
per opponent seat. Results queue and reveal with a 600ms stagger.

**HeuristicEngine branch order** (evaluated top-to-bottom, first match wins):
1. `isWinAttempt` → try to counter (uses `threatThreshold`)
2. Key wizard creature → possible removal (40% roll)
3. Enchantment/Artifact + stax profile → deploy stax piece (30% roll)
4. `stackDepth > 2` + Flusterstorm → cast Flusterstorm (50% roll)
5. Politics (willDeal + turn > 3 + templates) → propose deal (20% roll)
6. Default: pass

**Scryfall caching:** Two-layer — in-memory dedup of in-flight requests + `Cache API` browser
storage (`inalla-sim-v1` key). Art crops are cached separately from full-card images. Do not add
new direct fetch calls to `api.scryfall.com`; use `scryfallStore` or `useScryfall`.

---

## cEDH Glossary (Quick Reference)

| Term | Definition |
|---|---|
| cEDH | Competitive EDH — Commander at maximum power, typically wins turns 1–5 |
| Turbo | Deck archetype that wins turns 1–3 with minimal interaction |
| Midrange | Wins turns 3–5 while holding 10–20 pieces of interaction |
| Stax | Deploys lock pieces (one spell/turn, no ETBs) to slow all players down |
| Eminence | Inalla's keyword — triggers even when she's in the command zone |
| ETB | "Enters the battlefield" trigger |
| LIFO | Stack resolution order: last trigger placed resolves first |
| Threat threshold | `0.0–1.0` float — probability that an opponent counters a win attempt |
| Shields up | Holding mana open for instant-speed interaction on opponent turns |
| Going off | Executing a combo line in a single turn to win |
| Escape | Cast from graveyard by exiling other cards as additional cost (Underworld Breach) |
| Storm | Copies a spell for each spell cast earlier this turn (Flusterstorm) |
| Free counter | Force of Will, Fierce Guardianship, Deflecting Swat, Mental Misstep |
| Rule of Law | Any "one spell per turn" effect — hard lock on Spellseeker and Breach lines |
| Tutor | Searches library for a specific card |
| Sacrifice outlet | Card that accepts a creature sacrifice as a cost (Culling the Weak, Burnt Offering) |
| ConsOracle | Thassa's Oracle + Demonic Consultation — fastest 2-card win |

---

## Inalla's Core Mechanic

When a Wizard ETBs under your control, **two triggers** go on the stack simultaneously: the Wizard's
ETB and Inalla's eminence trigger. You choose their stack order.

**The correct order for the Spellseeker line:** put Spellseeker's ETB on top (resolves first).

1. Spellseeker ETB resolves → tutor Culling the Weak to hand.
2. **Before Inalla's trigger resolves**, cast Culling the Weak sacrificing Spellseeker (BBBB mana,
   Spellseeker goes to graveyard).
3. Inalla's trigger now resolves → creates a token Spellseeker (original being in GY is fine; the
   trigger captured Spellseeker's characteristics when it was placed on the stack).
4. Token Spellseeker's ETB triggers → tutor a second card.

Result: two tutors + BBBB mana from one Spellseeker cast. If you stack Inalla's trigger on top
(resolves first), the token is created before Culling the Weak is in your hand — you lose the
optimal mana generation.

---

## Combo Quick Reference

| Line | Typical Speed | Primary Counter Window | Key Vulnerability |
|---|---|---|---|
| Spellseeker | Turn 3–4 | Counter Spellseeker on cast | Rule of Law, Torpor Orb |
| Underworld Breach | Turn 2–3 | Counter Breach on cast | Grafdigger's Cage, Rest in Peace |
| ConsOracle | Turn 1–3 | Counter Oracle on cast, or counter Consultation | Teferi Time Raveler, Torpor Orb |

---

## Known Domain Gaps

These are approximations in the current code that don't reflect real cEDH behavior. Fix these with
reference to `docs/cedh-domain.md` before deploying changes that depend on them.

- **`kinnan.threatThreshold: 0.60`** — Too passive. Kinnan kills turns 2–3; it should contest
  ~75–80% of win attempts. Recommended: `0.78`.
- **`ral.threatThreshold: 0.55`** — Low for a turbo deck. Recommended: `0.70`.
- **`HeuristicEngine` Branch 4 (Flusterstorm):** Fires on `stackDepth > 2`. Wrong signal. Flusterstorm
  is most powerful during active combo chains (multiple spells cast this turn), not when the literal
  stack happens to be deep. The correct trigger is combo-chain awareness.
- **Politics condition (`turn > 3`):** Arbitrary. cEDH politics fires on win attempts, not based on
  turn count. Correct condition: `action.isWinAttempt && opponent.politicsProfile.willDeal`.
- **No graveyard hate branch:** No archetype has a mechanism to deploy Grafdigger's Cage, Tormod's
  Crypt, or Rest in Peace in response to a Breach attempt. These cards exist in real cEDH lists.
- **No combo-line awareness:** `HeuristicEngine` only knows `isWinAttempt`. It cannot use
  archetype-specific hate (Grafdigger's Cage vs. Breach, Torpor Orb vs. Oracle) because the active
  combo line isn't passed in `GameAction`.

---

## Test Coverage

`tests/unit/heuristicEngine.test.ts` covers all 5 HeuristicEngine branches with deterministic RNG.
If you change HeuristicEngine, run these tests first and add new test cases for any new branches.

`tests/e2e/` has Playwright tests for the simulator UI. Run `npm test` for unit, `npm run test:e2e`
for end-to-end.
