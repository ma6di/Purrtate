# Toy rotation: what the research says

Notes behind the basket setup tips (`BASKET_TIPS` in `lib/presets.ts`) and the
toy suggestions (`lib/toyAdvice.ts`).

## Findings and where they show up in the app

| Finding | Source | Used for |
|---|---|---|
| Adult cats show strong interest in a toy with prey-like features, then **habituate quickly unless something about the toy changes**. Object play behaves more like predation than "play". | Hall, Bradshaw & Robinson (2002), *Applied Animal Behaviour Science* 79(3):263–271 | The three-basket model: one out, two resting. "Why three baskets" tip. |
| Cats prefer toys that look, feel, smell and move like prey. Toys left static on the floor do little. Watching and stalking are part of play, not just contact. | Henning, Fernandez, Nielsen & Hazel (2022), "Play and welfare in domestic cats", *Animal Welfare* 31(4) | Chase / stalk / grab roles, and the "Mix the hunt" tip. |
| In a preference test, most cats spent the most time with **a person playing with a feather toy**. | Vitale Shreve, Mehrkam & Udell (2017), *Behavioural Processes* | "Wands are for together" tip. "Worth buying: a feather wand" when a cat has no chase toy. |
| Play and predatory behaviour is one of the five pillars of a healthy feline environment. Rotate toys, use toys that move like prey, use food puzzles, and **put away toys with string or small parts after play**. | AAFP/ISFM Feline Environmental Needs Guidelines (2013) | String safety tip, the food-puzzle suggestion, and the worn-toy note on the toy screen. |
| Frequent laser play is linked with owner-reported fixation on lights and shadows. A likely reason is that the cat can never finish the hunt by catching something. This is correlational survey data. | Kogan & Grigg (2021), *Animals* 11(8):2178. Replicated by Grigg & Kogan (2022), *JAAWS* | "Lights need a catch" tip, and the "Give the laser a catch" suggestion. |
| Swallowed string, ribbon or thread (a linear foreign body) is an emergency. Don't pull it out; see a vet the same day. | VCA Hospitals; Preventive Vet; vet advice sites | Worn-toy note on the toy detail screen. |
| Cats are dichromats: they see blues and yellows well and reds poorly. | General feline vision literature | "Colour helps you, not them" tip. |
| Owner-facing guides suggest finding a cat's prey preference (bird, mouse or bug) by alternating toy types. | Ohio State Indoor Pet Initiative | One of each role per basket, so every rotation tests each prey style. |

## The app's numbers are not from a study

Every day count in the app is a starting point that the owner adjusts. None of them comes from research.

| Number | Value | Basis |
|---|---|---|
| Swap interval by energy | kitten 2, zoomies 3, adult 7, senior 14 days | Order only: young cats play more and play declines with age. The day counts are conventional "rotate weekly" advice, not measured. |
| Rest before "feels new" | swap interval × (number of baskets − 1) | Not a guess. It's simply how long a basket waits for its next turn, so the label matches what actually happens. |
| New toy nudge | kitten 21, zoomies 28, adult 42, senior 56 days | Picked for this app. Novelty matters (Hall et al. 2002), but no study gives a frequency. |
| Minimum toys per basket | 2 | Picked for this app. |

Habituation studies measure loss of interest over minutes and hours within play sessions, not days between swaps. Nobody has measured how many days a basket should stay out, how long toys need to rest, or how much play cats need (Henning et al. list the last one as an open question).

**How the app adapts:** the owner picks "Swap every" in Settings (2, 3, 5, 7, 10 or 14 days), with the energy level's value marked as suggested. Today offers an early swap ("Already bored of these?"). If the owner swaps early twice in a row at the same interval, Today suggests the closest shorter interval, based on how many days the baskets actually lasted. Same-day swaps don't count, since they're more likely a mis-tap. "Keep" hides the suggestion until the next early swap.

**When to throw out a toy:** no source gives a rule. The app says to retire anything frayed, split, or with loose parts.

## Toy advice rules (`lib/toyAdvice.ts`)

**Per basket (the "!" on each basket in the Toys tab):**
- Fewer than 2 toys: the basket barely changes anything when it comes out.
- Missing a role (chase, stalk or grab). If another basket has 2 or more toys of that role, the app suggests moving one over instead of buying.

**New toy nudge (Today and Toys):** shown when no toy has been added for `newToyDays` (kitten 21, zoomies 28, adult 42, senior 56 days). Rotation slows habituation but doesn't remove it, and novelty is the strongest trigger in Hall et al. The interval is a default, not a study value. "Not now" snoozes it for 7 days.

**Collection-wide (top of Toys):** no toys at all, a role missing from every basket (with a specific thing to buy), laser as the only stalk toy, and a toy retired in the last 30 days that leaves fewer toys of its role than baskets.

The Toys tab icon shows a dot when any of these apply.

## Sources

- Hall, Bradshaw & Robinson 2002: https://research-information.bris.ac.uk/en/publications/object-play-in-adult-domestic-cats-the-roles-of-habituation-and-d/
- Henning et al. 2022: https://www.cambridge.org/core/journals/animal-welfare/article/play-and-welfare-in-domestic-cats-current-knowledge-and-future-directions/6266B8053099D0BB3F8D441F1ADF5CDA
- Vitale Shreve et al. 2017 (summary): https://www.scientificamerican.com/podcast/episode/your-cat-thinks-youre-cool
- AAFP/ISFM guidelines (client brochure): https://old.catvets.com/public/PDFs/ClientBrochures/Environmental%20GuidelinesEViewFinal.pdf
- Kogan & Grigg 2021: https://www.mdpi.com/2076-2615/11/8/2178
- Prey preference guide: https://indoorpet.osu.edu/node/442
- String ingestion: https://vcahospitals.com/know-your-pet/household-hazards-holiday-safety-tips-for-cat-owners
