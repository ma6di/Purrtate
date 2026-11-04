# Toy rotation: what the research says

Notes behind the basket setup tips (`BASKET_TIPS` in `lib/presets.ts`) and the
toy suggestions (`lib/toyAdvice.ts`).

## Findings and where they show up in the app

| Finding | Source | Used for |
|---|---|---|
| Adult cats show strong interest in a toy with prey-like features, then **habituate quickly unless something about the toy changes**. Object play behaves more like predation than "play". | Hall, Bradshaw & Robinson (2002), *Applied Animal Behaviour Science* 79(3):263–271 | The three-basket model: one out, two resting. "Why three baskets" tip. "Time for something new" suggestion. |
| Cats prefer toys that look, feel, smell and move like prey. Toys left static on the floor do little. Watching and stalking are part of play, not just contact. | Henning, Fernandez, Nielsen & Hazel (2022), "Play and welfare in domestic cats", *Animal Welfare* 31(4) | Chase / stalk / grab roles, and the "Mix the hunt" tip. |
| In a preference test, most cats spent the most time with **a person playing with a feather toy**. | Vitale Shreve, Mehrkam & Udell (2017), *Behavioural Processes* | "Wands are for together" tip. "Worth buying: a feather wand" when a cat has no chase toy. |
| Play and predatory behaviour is one of the five pillars of a healthy feline environment. Rotate toys, use toys that move like prey, use food puzzles, and **put away toys with string or small parts after play**. | AAFP/ISFM Feline Environmental Needs Guidelines (2013) | String safety tip, the food-puzzle suggestion, and the worn-toy note on the toy screen. |
| Frequent laser play is linked with owner-reported fixation on lights and shadows. A likely reason is that the cat can never finish the hunt by catching something. This is correlational survey data. | Kogan & Grigg (2021), *Animals* 11(8):2178. Replicated by Grigg & Kogan (2022), *JAAWS* | "Lights need a catch" tip, and the "Give the laser a catch" suggestion. |
| Swallowed string, ribbon or thread (a linear foreign body) is an emergency. Don't pull it out; see a vet the same day. | VCA Hospitals; Preventive Vet; vet advice sites | Worn-toy note on the toy detail screen. |
| Cats are dichromats: they see blues and yellows well and reds poorly. | General feline vision literature | "Colour helps you, not them" tip. |
| Owner-facing guides suggest finding a cat's prey preference (bird, mouse or bug) by alternating toy types. | Ohio State Indoor Pet Initiative | One of each role per basket, so every rotation tests each prey style. |

## Not well established

- **How many days between swaps.** The habituation studies measure minutes to hours, not days. The energy presets (2–14 days) are sensible defaults, not values taken from a study.
- **How much play a cat needs.** Henning et al. list this as an open question.
- **When to throw out a toy.** No source gives a rule. The app says to retire anything frayed, split, or with loose parts.

## Toy suggestion rules (`toySuggestions`)

These are checked in order, and the Toys tab shows at most three.

1. **Thin basket:** a basket has fewer than 2 toys, so rotation has nothing to swap in.
2. **Missing role:** no chase, stalk or grab toy anywhere. Suggests a specific type to buy.
3. **Laser as the only stalk toy:** a play tip to finish each session on a toy the cat can catch.
4. **Recently retired toy:** a toy retired in the last 30 days leaves fewer toys of that role than there are baskets. Suggests a replacement with a different texture or sound.
5. **Flat collection:** at least 8 hunts in 14 days, and at least 60% of toys average under 3 minutes. Rotation isn't working, so suggests something genuinely new.

## Sources

- Hall, Bradshaw & Robinson 2002: https://research-information.bris.ac.uk/en/publications/object-play-in-adult-domestic-cats-the-roles-of-habituation-and-d/
- Henning et al. 2022: https://www.cambridge.org/core/journals/animal-welfare/article/play-and-welfare-in-domestic-cats-current-knowledge-and-future-directions/6266B8053099D0BB3F8D441F1ADF5CDA
- Vitale Shreve et al. 2017 (summary): https://www.scientificamerican.com/podcast/episode/your-cat-thinks-youre-cool
- AAFP/ISFM guidelines (client brochure): https://old.catvets.com/public/PDFs/ClientBrochures/Environmental%20GuidelinesEViewFinal.pdf
- Kogan & Grigg 2021: https://www.mdpi.com/2076-2615/11/8/2178
- Prey preference guide: https://indoorpet.osu.edu/node/442
- String ingestion: https://vcahospitals.com/know-your-pet/household-hazards-holiday-safety-tips-for-cat-owners
