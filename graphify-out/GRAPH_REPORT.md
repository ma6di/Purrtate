# Graph Report - cat toy rotation  (2026-08-30)

## Corpus Check
- 42 files · ~202,849 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 232 nodes · 596 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `colors` - 24 edges
2. `useAppStore` - 19 edges
3. `useHousehold()` - 15 edges
4. `Body()` - 14 edges
5. `expo` - 13 edges
6. `Label()` - 13 edges
7. `radii` - 12 edges
8. `fonts` - 12 edges
9. `Display()` - 11 edges
10. `TodayScreen()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `TodayScreen()` --calls--> `useAppStore`  [EXTRACTED]
  app/(tabs)/index.tsx → store/useAppStore.ts
- `TodayScreen()` --calls--> `useHousehold()`  [EXTRACTED]
  app/(tabs)/index.tsx → store/useAppStore.ts
- `InsightsScreen()` --calls--> `useHousehold()`  [EXTRACTED]
  app/(tabs)/insights.tsx → store/useAppStore.ts
- `PlayScreen()` --calls--> `useAppStore`  [EXTRACTED]
  app/(tabs)/play.tsx → store/useAppStore.ts
- `PlayScreen()` --calls--> `useHousehold()`  [EXTRACTED]
  app/(tabs)/play.tsx → store/useAppStore.ts

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (28): styles, ENERGIES, styles, styles, styles, Sparkline(), styles, ENERGY_PRESETS (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (23): PlayRing(), dayKey(), daysBetween(), formatMinutes(), greeting(), startOfDay(), syncReminders(), activeGroup() (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (19): styles, ICONS, PurrTabBar(), styles, TabBarProps, CatLogo(), PawMark(), Props (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-font, @expo-google-fonts/fraunces, @expo-google-fonts/nunito, expo-haptics, expo-linear-gradient (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (24): backgroundColor, foregroundImage, adaptiveIcon, typedRoutes, expo, android, experiments, icon (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (20): GroupTimeline(), PALETTE, styles, nowIso(), uid(), STARTER_TOYS, TOY_KINDS, applyRotation() (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (12): styles, ToyCard(), KIND_COLOR, kindColor(), ToyGlyph(), freshnessLabel(), freshnessScore(), styles (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (12): devDependencies, @types/react, typescript, main, name, private, scripts, android (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (11): Gate(), RootLayout(), unstable_settings, Onboarding(), SettingsScreen(), useActiveCat(), useAppStore, useHousehold() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

## Knowledge Gaps
- **91 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+86 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `Community 0` to `Community 1`, `Community 2`, `Community 5`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 3` to `Community 7`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `useAppStore` connect `Community 8` to `Community 0`, `Community 1`, `Community 2`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _91 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1406423034330011 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1310483870967742 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1168091168091168 - nodes in this community are weakly interconnected._