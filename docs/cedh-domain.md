# cEDH Domain Reference — Voidcaster

This document is the authoritative domain reference for working on Voidcaster. When modifying
`archetypes.ts`, `HeuristicEngine.ts`, `combos.ts`, or any game-logic file, read the relevant
sections here before making changes. Cross-reference with the live source files; this doc describes
rules, not code.

---

## Format Overview

**cEDH (Competitive EDH)** is Commander played at its highest power level. Four players, 40 life,
100-card singleton, a commander in the command zone. What separates it from casual Commander:

- **Speed**: Winning on turn 1–3 is normal. Turn 4 is midrange. Turn 5+ means something went wrong.
- **Interaction density**: Every deck runs 10–20 counterspells or pieces of disruption. Games are
  decided by who can push through interaction at the right moment.
- **No singletons taboo**: Every powerful one-mana counterspell, every tutor, every zero-cost mana
  rock goes in if it fits. Power level is the only filter.
- **Stacking priority and trigger ordering** matter. Players familiar with Legacy and Vintage play
  cEDH; sloppiness with the stack will cost games.
- **No table politics in the casual sense**: Most decks aren't interested in deals; they're interested
  in winning before the other three players do.

---

## Meta Profiles

The `settingsStore` exposes five meta profiles that configure the opponent seat archetypes. These
terms have specific meaning in cEDH:

### Turbo

Wins on turns 1–3. Prioritizes mana acceleration and compact combo packages over interaction.
Examples: Kinnan (ramp into infinite mana), Ral (storm), Etali (haste combat cheat). Turbo decks
fold to early disruption but punish any slow hand.

### Midrange

Wins on turns 3–5. Runs 15–20 pieces of interaction while setting up a resilient win. The largest
meta share. Examples: Kraum/Tymna, Thrasios/Tymna. These decks play reactive Magic — they hold up
counterspells and look for the right moment to "go off" rather than committing resources recklessly.

### Stax

Attempts to slow the game until only a permanent-based win can resolve. Deploys lock pieces
(Drannith Magistrate, Rule of Law, Grafdigger's Cage) early and wins through tutored legendaries
(Sisay) or artifact chains. Stax is the worst meta call against Inalla specifically — see the hate
cards section.

---

## The Inalla Mechanic — Double ETB

**Inalla, Archmage Ritualist** has this triggered ability:
> Eminence — Whenever another Wizard you control enters the battlefield, if Inalla is in the command
> zone or on the battlefield, you may pay {1}. If you do, create a token that's a copy of that
> Wizard. It gains haste. Exile it at the beginning of the next end step.

The critical rule: when a Wizard ETBs under your control, **two triggers** go on the stack
simultaneously — the Wizard's own ETB ability and Inalla's eminence trigger. As the active player,
you choose the order they're placed on the stack.

**Stack LIFO — last in resolves first.**

To get the most out of Spellseeker (the primary combo engine):

1. Put **Spellseeker's ETB on top** (it resolves first).
2. Spellseeker ETB resolves → tutor Culling the Weak.
3. **Before Inalla's trigger resolves**, you cast Culling the Weak **sacrificing Spellseeker**. This
   gives BBBB mana and puts Spellseeker in the graveyard.
4. Inalla's trigger now resolves. It still creates a token copy of Spellseeker — the trigger captured
   Spellseeker's characteristics when it was put on the stack; the original being in the graveyard
   doesn't prevent token creation.
5. The token Spellseeker's ETB triggers → tutor a second spell.

The result: **two tutors from one cast**, plus BBBB mana, in the same action window. If you
accidentally stack Inalla's trigger on top (resolving first), the token is created before you have
Culling the Weak in hand — you'd have to sacrifice a different creature, losing the mana advantage.

This stack ordering is what every step in the Spellseeker line that says "Stack ETB trigger above
Inalla trigger" refers to.

### Reanimation as Combo Infrastructure

The 8 reanimation spells in the decklist (Animate Dead, Corpse Dance, Dance of the Dead, Necromancy,
Persist, Reanimate, Shallow Grave, Unearth) are **not value plays** — they are essential Spellseeker
line infrastructure. The line casts Spellseeker, sacrifices it, reanimates it to get another tutor,
sacrifices again, reanimates into Scholar of the Ages, and loops. Players new to the archetype
sometimes cut reanimation because the deck "doesn't feel like a reanimator deck" — this is a mistake.
Reanimate and Shallow Grave are among the highest-impact spells in the 99.

---

## Combo Lines

### 1. Spellseeker Line ("Full Combo")

**Prerequisites:** Inalla in command zone, 1U + 1B + 2 generic available, Spellseeker accessible.

**Typical setup turn:** 3–4 (earlier with multiple rituals).

**Mechanism summary:** Spellseeker chains tutors via the double-ETB pattern. Culling the Weak and
Burnt Offering generate black mana from creature sacrifices. Finale of Promise recurs the sacrifice
spells for free casts. Entomb + Reanimate/Shallow Grave bring Scholar of the Ages onto the
battlefield. Scholar loops back instants/sorceries; combined with the infinite Burnt Offering loop,
this generates arbitrary amounts of mana. Win with Thassa's Oracle with an empty library.

**Non-obvious step notes:**

- **Steps 1–3**: The stack ordering choice (described above) is the key. Step 3 (Culling the Weak)
  must be cast while Inalla's trigger is still on the stack — this is an instant-speed window.
- **Steps 11–12 (Finale of Promise X=1)**: Finale targets Culling the Weak (in GY) and Unearth (in
  GY). Unearth is the free cast (cast for free, casts at instant speed per Finale's effect), Culling
  the Weak is the sorcery cast. This costs X=1, so the total is {B}{B}{B}{B}{G}{G}+1. Make sure you
  have enough mana from the Burnt Offering before this step.
- **Steps 25–29 (The Loop)**: Once Scholar of the Ages is looping via Shallow Grave + Inalla token,
  you generate infinite mana by repeatedly casting Burnt Offering (returns to hand via Scholar ETB
  each loop). Entomb fills the graveyard with any spell you need. The win condition is Oracle, but
  you can also tutor any spell via Entomb and play it out.

**Interaction windows for opponents:**

1. **Spellseeker on cast** — the highest-value counter target. Answering it prevents the entire chain.
   Decks with free counters (Force of Will, Fierce Guardianship) will use them here.
2. **Culling the Weak in response to Spellseeker ETB** — prevents the mana generation and forces a
   different sacrifice target. Stifling the ETB itself is another option but less common.
3. **Unearth targeting Spellseeker** (step 6) — second major window; players who missed the first
   window try to stop the engine here.
4. **Reanimate targeting Scholar of the Ages** (step 17) — third window; countering this prevents
   the infinite loop but the opponent may have to tap out to do it.

**What this line loses to:**

- Rule of Law / Arcane Lab / Ethersworn Canonist: One spell per turn. The entire chain requires
  multiple casts in a single turn. Hard lockout.
- Torpor Orb: Prevents all ETB triggers. Spellseeker has no ETB if Torpor Orb is in play — the line
  is dead.
- Cursed Totem: Prevents activated abilities. Does NOT stop Inalla (her ability is triggered, not
  activated), but prevents Fatestitcher and other activated-ability creatures.
- Deafening Silence: Stops noncreature spells after the first spell each turn. Kills the chain dead
  (Culling the Weak and Burnt Offering are noncreature sorceries).

---

### 2. Underworld Breach Loop

**Prerequisites:** Underworld Breach + Lion's Eye Diamond + Brain Freeze (any combination of hand
and graveyard, with sufficient cards in GY to escape pieces as needed).

**Typical setup turn:** 2–3. Very fast.

**Mechanism summary:** Underworld Breach lets you escape (cast from GY, exile N cards) any spell.
LED generates UUU, BBB, or RRR but forces a hand discard — which refuels the graveyard. Brain
Freeze mills your library when targeting yourself. The loop:

1. Cast Underworld Breach (resolves on battlefield).
2. Cast LED (directly or via escape).
3. Activate LED in response to nothing (or any instant-speed window), generating mana and discarding
   hand into graveyard.
4. Escape Brain Freeze from GY (exile 3 cards as escape cost) — target yourself, mill 3 (plus storm
   copies). Brain Freeze goes to GY.
5. Escape LED from GY (exile 3 more). Repeat.
6. Each loop mills cards into GY, which creates more escape fodder for the next loop.
7. When library is empty, escape Thassa's Oracle — ETB sees empty library, win.

**Primary counter window:** Underworld Breach **on cast**. Once it resolves, countering individual
LED/Brain Freeze activations is almost impossible because they happen at instant speed in response to
each other and the opponent burns counters one-for-one on an infinite-resource engine. Opponents who
miss the Breach window usually scoop.

**What this line loses to:**

- Grafdigger's Cage: Prevents casting spells from graveyards. Shuts down escape entirely. Hard stop.
- Rest in Peace / Planar Void: Exiles cards as they hit the graveyard. No graveyard = no escape.
- Tormod's Crypt / Relic of Progenitus: Exiles GY. Destroys the escape fuel.
- Leyline of the Void: Replaces graveyard with exile. Total shutdown.
- Unlike the Spellseeker line, this line is disproportionately hated out by cheap GY hate. Grafdigger's
  Cage at {1} is one of the best value hate cards in cEDH against this line.

---

### 3. Thassa's Oracle + Consultation ("ConsOracle")

**Prerequisites:** Thassa's Oracle + Demonic Consultation OR Tainted Pact in hand. Needs 2U for
Oracle. Consultation costs {B}; Tainted Pact costs {1}{B}.

**Typical setup turn:** 1 (with ritual start), regularly 2–3. The fastest win condition in the deck.

**Mechanism summary:** Cast Thassa's Oracle. While the ETB is on the stack (not yet resolved), cast
Demonic Consultation naming a card not in your library — this exiles cards from the top of your
library until that card is "found," which exiles everything because the named card isn't there.
Library is now empty. Oracle ETB resolves: "Look at the top X cards... if you have no cards in your
library, you win." Win.

**Tainted Pact alternative:** Instead of naming a card not in the deck, Tainted Pact exiles cards
one at a time until you choose to stop or hit a duplicate name. With near-zero duplicates in cEDH
lists, Pact typically exiles the entire library as well.

**Timing rule — the key interaction window:**

The Oracle ETB is a **triggered ability**, not a spell. It can only be countered by effects that
specifically counter abilities: Stifle, Tale's End, Voidslime, Disallow, Trickbind. Regular
counterspells (Force of Will, Counterspell) cannot counter it. The spell itself (the Oracle) must be
countered before it resolves and triggers.

Therefore:
- Counter window 1: Counter **Thassa's Oracle** before it resolves (UU is a real cost, opponents
  with mana up can act).
- Counter window 2: Counter **Demonic Consultation** or **Tainted Pact** — this prevents the library
  exile, but Oracle's ETB is still on the stack with a full library. Oracle will then look at the top
  X cards of a full library where X = devotion to blue; you almost certainly don't have enough
  devotion to win with a full library.
- Counter window 3 (rare): Stifle or Voidslime targeting the ETB ability itself.

**What this line loses to:**

- **Teferi, Time Raveler** (major): His static makes all players cast only at sorcery speed. You
  cannot cast Consultation "in response" to the Oracle ETB because the ETB is a triggered ability
  resolving, and Teferi removes the instant-speed window. To use ConsOracle with Teferi on the
  board, you must cast Consultation FIRST (exiling your own library), then cast Oracle with an
  empty library as a regular sorcery-speed play. This is still doable but removes the elegant
  "two-card kill" property and requires more setup.
- **Torpor Orb**: ETB triggers don't happen. Oracle never sees the library, can't win.
- **Hushbringer**: Same effect as Torpor Orb for creatures.
- **Cursed Totem**: Stops activated abilities only — does NOT stop Oracle ETB (triggered, not
  activated).
- **Narset, Parter of Veils**: Does nothing against this line directly.

---

## Opponent Archetypes

Accuracy notes on the current `archetypes.ts` data and recommended fixes.

### Kraum / Tymna (midrange)
**Win line:** Ad Nauseam into a 0-mana win (Isochron Scepter + Dramatic Reversal with enough rocks,
or various instant-speed combos). Alternatively, Tymna draws cards, Kraum draws from opponent
spell-casting, assembling a critical mass for a combo from hand.
**Typical kill turn:** 4–5.
**`threatThreshold: 0.85`** — accurate. This is a highly interactive midrange deck that protects its
win attempts aggressively.
**Hate against Inalla:** Force of Will, Pact of Negation for Spellseeker; Swords to Plowshares
removes Scholar; Toxic Deluge clears the board. No dedicated GY hate in current data, which is a
gap (Kraum/Tymna typically runs Tormod's Crypt or Nihil Spellbomb as incidental GY hate).

### Kinnan, Bonder Prodigy (turbo)
**Win line:** Generate 5+ mana from non-land sources → tap Kinnan → tutor Basalt Monolith → infinite
mana via Basalt + Mana Reflection or similar → sink into Thrasios or another outlet. Alternative:
Urza, Lord High Artificer + any artifact + enough mana.
**Typical kill turn:** 2–3. Kinnan is among the fastest consistent kill turns in cEDH.
**`threatThreshold: 0.60`** — **too low**. A deck winning turn 2–3 with reasonable consistency
should interact 70–80% of the time on actual win attempts. Recommended: **0.75–0.80**.
**Hate against Inalla:** Nature's Claim hits Underworld Breach (enchantment). Abrupt Decay handles
resolved stax pieces. Kinnan has no dedicated Inalla hate — its plan is to win before Inalla does.
**Counter package gap:** Only Force of Will, Pact of Negation, Swan Song listed. Kinnan typically
also runs Fierce Guardianship, Flusterstorm, and sometimes Mental Misstep.

### Rograkh / Thrasios (turbo reactive)
**Win line:** Rograkh costs 0 — enables free spell discounts (Goblin Anarchomancer, etc.) and enables
Jeska's Will for large ritual effects. Wins through artifact-based infinite mana into Thrasios sink.
**Typical kill turn:** 2–3.
**`threatThreshold: 0.90`** — accurate. This build is very reactive; it holds up heavy interaction
while setting up a fast kill.
**Hate against Inalla:** Chain of Vapor bounces Underworld Breach or key permanents. Toxic Deluge
handles Scholar of the Ages at a mana cost.

### Rograkh / Silas (midrange artifact)
**Win line:** Silas Renn recurs artifacts from the graveyard, enabling loops with Underworld Breach
or artifact-based mana. Slower, more resilient combo line.
**Typical kill turn:** 3–5.
**`threatThreshold: 0.75`** — reasonable.
**Hate against Inalla:** Wear // Tear handles both Underworld Breach (enchantment) and artifacts.
Assassin's Trophy is unconditional but ramps opponent.

### Sisay, Weatherlight Captain (stax)
**Win line:** Sisay tutors legendary permanents. End state: Jegantha, the Wellspring (provides 5
colored mana per tap, once Sisay has high enough power via legendaries) → infinite mana sink into
a legendary outlet. Alternatively, Kenrith, the Returned King as a win condition.
**Typical kill turn:** 4–6, behind a lock.
**`threatThreshold: 0.70`** — accurate. Sisay interacts selectively; it would rather resolve its
lock pieces than trade counterspells.
**Hate against Inalla — specific and accurate:**
- **Drannith Magistrate**: Prevents casting from anywhere other than hand. Kills Breach line
  (can't escape), kills Consultation (you exile Oracle/Consultation to the zone where they can't
  be cast). Note: Magistrate only prevents casting — it doesn't stop Oracle's ETB from triggering.
- **Ethersworn Canonist**: One noncreature spell per turn. Kills Spellseeker line and Breach loop.
- **Rule of Law**: Same effect as Canonist.
- **Collector Ouphe**: Prevents artifact activated abilities. Stops mana rocks and Grim Monolith.

### Etali, Primal Conqueror (turbo aggro)
**Win line:** Hard-cast or cheat Etali onto the battlefield with haste (via Sneak Attack, Through the
Breach, or just Elvish Piper). Attack, trigger, cast 3–4 free spells from opponents' libraries.
**Typical kill turn:** 3–4 if uncontested.
**`threatThreshold: 0.40`** — accurate. Etali is a pure aggro threat with minimal counterspell
infrastructure. Green/red has almost no interaction.
**Hate against Inalla:** Blasphemous Act can reset the board including Inalla tokens. Chaos Warp
handles any single permanent but is unreliable (randomizes the outcome).

### Thrasios / Tymna (midrange control)
**Win line:** Isochron Scepter + Dramatic Reversal with sufficient rocks for infinite mana. Sink into
Thrasios for the win. Alternatively, Demonic Consultation + Thassa's Oracle.
**Typical kill turn:** 4–5. Heavy interaction build.
**`threatThreshold: 0.90`** — accurate. The most counter-dense deck in the current archetype list.
**Hate against Inalla:** Full counter package including Flusterstorm (excellent against Spellseeker
chain). Toxic Deluge as a board wipe. Path to Exile for Scholar of the Ages.

### Ral, Monsoon Mage (turbo combo)
**Win line:** Ral triggers on instants/sorceries and copies spells. Wins via storm (Ral copies each
storm spell when cast, creating an infinite loop with the right setup) or through Grapeshot/Aetherflux
Reservoir with enough storm count.
**Typical kill turn:** 2–3 with the right hand.
**`threatThreshold: 0.55`** — **likely too low** for a turbo deck. A deck capable of winning turn 2
should hold interaction more aggressively. Recommended: **0.70**.
**Counter package note:** Ral's list runs more Pyroblast effects than listed and benefits heavily
from Flusterstorm (which copies in a storm chain).
**Hate against Inalla:** Swan Song and Pact of Negation can counter Oracle. Pyroblast targets blue
spells — Oracle (UU) is a prime Pyroblast target.

---

## Interaction Timing in cEDH

### When opponents actually use counterspells

**Turn 1:** Free counterspells only (Force of Will, Fierce Guardianship, Deflecting Swat). Paying
mana on turn 1 to counter something means not developing your board — too costly in most cases.
Mental Misstep (counters {1}-mana spells for free) is the exception.

**Turns 2–3:** "Shield windows" begin. Decks that won't win this turn hold up one or two mana for
interaction. This is the critical window — Spellseeker cast on turn 2–3 with shields down is the
most common loss scenario.

**Active player's combo turn:** The entire table should evaluate whether this is a winning attempt.
If it is: interact. If not: save counters. The evaluation is the game skill that separates good cEDH
players from great ones — spending Force of Will on a non-threatening Spellseeker when a faster
player has 4 open mana is a tempo loss.

### Flusterstorm timing

Flusterstorm is not "good in a deep stack" in the abstract. Its specific strength is during **combo
chains** where the active player casts many spells in a single turn. Each spell cast that turn
produces another Flusterstorm copy. Used against the first spell in a Spellseeker chain, it produces
only 1 copy. Used against the 6th spell in the chain, it produces 6 copies.

The `HeuristicEngine` Branch 4 fires on `stackDepth > 2`. This is wrong — literal stack depth is
not the relevant trigger. The correct trigger is: "has the active player cast multiple spells this
turn?" (i.e., is a chain active?). This is a known gap.

### The politics timing problem

In cEDH, table politics is not "let's make a deal on turn 4 about who attacks whom." It's specifically:
- Someone is about to win; the table has a choice to let them win or stop them.
- A player offers: "I'll let this through if you stop [another player]."
- This is a real-time negotiation during an active win attempt.

The `HeuristicEngine` Branch 5 fires on `turn > 3`. This is too broad — politics is essentially
a response to `isWinAttempt`, not a time-based phenomenon. A more accurate condition:
`action.isWinAttempt && opponent.politicsProfile.willDeal`.

---

## Counter Package Hierarchy

The `COUNTER_PRIORITY` list determines which counterspell the HeuristicEngine picks. Rationale:

| Counterspell | Priority Rationale |
|---|---|
| Mana Drain | Counters and produces mana — tempo-positive, preferred when shields are up |
| Force of Will | Free at the cost of a blue card — universally castable, strong early when mana is tight |
| Fierce Guardianship | Free if commander is on the battlefield — ties with FoW in most scenarios |
| Deflecting Swat | Free if commander is on the battlefield — can redirect abilities (Stifle-like effect on Thassa's Oracle ETB) |
| Pact of Negation | Free now, pay UUU next upkeep — best deployed when you plan to win before your next turn |
| Counterspell | Hard 2-mana, no conditions — reliable baseline |
| Swan Song | 1 mana, hits instants/sorceries/enchantments, gives opponent a 2/2 — small downside |
| Flusterstorm | 1 mana storm spell — best in chains, dead against permanents |
| Pyroblast / Red Elemental Blast | Only hits blue spells — high upside when relevant, dead otherwise |

**Note on Mana Drain vs. Force of Will:** Mana Drain is ranked first in `COUNTER_PRIORITY` because
the engine models it as the "most impactful" choice when available. In actual play, Force of Will is
sometimes preferred when you're tapped out and can't use the mana float. Both are correct calls
situationally.

---

## Key Hate Cards Against Inalla

These are the most common cards that specifically shut down one or more Inalla combo lines. The
HeuristicEngine currently has no branch for deploying these — it's a known gap.

| Card | Effect | Line(s) Stopped |
|---|---|---|
| **Grafdigger's Cage** | Prevents casting spells from graveyards or libraries | Breach (can't escape), any tutored GY pile |
| **Drannith Magistrate** | Prevents casting from outside hand | Breach (can't escape), tutored-then-exiled spells |
| **Rule of Law / Arcane Lab** | One spell per turn | Spellseeker chain (requires multi-spell turn) |
| **Ethersworn Canonist** | One noncreature spell per turn | Spellseeker chain |
| **Torpor Orb** | Prevents ETB triggers | Spellseeker (ETB is the engine), Oracle (ETB is the win) |
| **Hushbringer** | Same as Torpor Orb for creatures | Same as Torpor Orb |
| **Teferi, Time Raveler** | Sorcery speed only | ConsOracle instant-speed Consultation in response to Oracle ETB |
| **Opposition Agent** | Opponent controls your library searches | All tutor-based setup (Spellseeker ETB, Demonic Tutor, etc.) |
| **Cursed Totem** | Prevents activated abilities | Does NOT stop Inalla (triggered) — stops Fatestitcher |
| **Deafening Silence** | One noncreature spell per turn | Spellseeker chain (Culling the Weak, Burnt Offering are noncreature) |

**Stax interaction note:** The Sisay archetype already runs Drannith Magistrate, Ethersworn Canonist,
Rule of Law, and Collector Ouphe. These are correctly represented in `archetypes.ts`. The gap is
that the HeuristicEngine only deploys `staxPieces` in Branch 3 (when an enchantment/artifact is
cast) — it never proactively drops lock pieces on the opponent's key turns.

---

## KEY_WIZARDS Rationale

`KEY_WIZARDS` in `archetypes.ts` contains the Wizards that the removal heuristic targets on ETB:

- **Spellseeker**: The entire combo engine. Removing it prevents the chain.
- **Scholar of the Ages**: The infinite loop enabler. Removing it post-Entomb ends the game.
- **Naru Meha, Master Wizard**: Copies instants/sorceries, enables loops.
- **Dualcaster Mage**: Copies spells, can go infinite with certain targets.
- **Wanderwine Prophets**: Enables extra turns loop (rarely relevant in Inalla but powerful when set up).

Potential additions not currently listed:
- **Kefka, Court Mage**: In the current decklist; ETB cycles through a spell — low removal priority
  but present.
- **Vedalken Aethermage**: Wizardcycling for 1U; tutors any Wizard. More of a setup piece than a
  loop engine.
- **Bloodline Necromancer**: Recursion Wizard; in the decklist but not a high-priority removal target.

The current five are the correct high-priority targets. The others in the decklist are value pieces,
not engines.

---

## Glossary

**Breach line**: The Underworld Breach + LED + Brain Freeze combo.

**cEDH**: Competitive EDH. Commander at the highest power level with no power restrictions.

**Commander tax**: The {2} additional cost to cast your commander each time after the first.

**ConsOracle**: Thassa's Oracle + Demonic Consultation or Tainted Pact.

**Devotion**: Count of colored mana symbols in permanents you control. Oracle checks devotion to
blue to determine how many cards to look at.

**Eminence**: A Commander keyword that triggers even when the commander is in the command zone.
Inalla uses eminence.

**Escape**: The Underworld Breach keyword — cast a card from your graveyard by exiling other cards
from your graveyard as an additional cost.

**ETB**: "Enters the battlefield." A triggered ability that fires when a permanent enters the
battlefield under your control.

**Free counter**: A counterspell castable without paying mana — Force of Will, Fierce Guardianship,
Deflecting Swat, Pact of Negation (deferred cost), Mental Misstep.

**Going off**: Executing a combo line to win.

**Infinite mana**: Generating unbounded mana via a loop. Usually requires a win condition sink.

**LIFO**: Last in, first out. How the stack resolves. The last trigger placed on the stack resolves
first.

**Meta share**: Percentage of competitive decks in the field running a given commander. `metaSharePercent`
in archetypes.ts.

**Priority window**: The moment between game actions where each player may take actions (cast spells,
activate abilities). The stack resolves one item at a time; priority passes between resolutions.

**Rule of Law**: Generic term for "one spell per turn" effects. Devastating against Inalla.

**Sacrifice outlet**: A card that lets you sacrifice creatures as a cost. Culling the Weak and Burnt
Offering are sacrifice outlets in the Spellseeker line.

**Shields up**: Holding mana open to cast interaction on opponents' turns.

**Stax**: A strategy using permanents that restrict opponents' game actions (slow them down). Named
after the card Smokestack.

**Storm**: A keyword that copies a spell for each spell previously cast this turn. Flusterstorm uses
storm.

**Threat threshold**: In `archetypes.ts`, the probability threshold at which an opponent will
interact with a win attempt. `0.90` means they counter 90% of win attempts.

**Tutor**: Any card that searches your library for another card. Spellseeker tutors spells with
converted mana cost 1 or less.

**Wizardcycling**: The cycling ability on Vedalken Aethermage that fetches any Wizard card.
