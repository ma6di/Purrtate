import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { daysBetween, nowIso } from '@/lib/dates';
import { uid } from '@/lib/ids';
import type { DraftBasket } from '@/lib/presets';
import { applyRotation, balancedGroupId, intervalDays, nextGroup } from '@/lib/rotation';
import {
  EMPTY_SETTINGS,
  cleanColor,
  cleanEnergy,
  cleanInterval,
  cleanKind,
  cleanName,
  cleanNotes,
  cleanDate,
  sanitizeState,
  type PersistedState,
} from '@/lib/sanitize';
import type { Cat, Energy, Group, Settings, Toy, ToyKind, ToyStatus } from '@/types/models';

/** Bump when the saved shape changes, and handle the old shape in `migrate`. */
export const STORE_VERSION = 2;
const MAX_TOYS_PER_BASKET = 30;

type OnboardingInput = {
  name: string;
  energy: Energy;
  /** Three baskets built during setup. The first one starts out on the rug. */
  baskets: DraftBasket[];
};

type AppState = PersistedState & {
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  completeOnboarding: (input: OnboardingInput) => void;
  updateCat: (id: string, patch: Partial<Pick<Cat, 'name' | 'energy'>>) => void;
  addToy: (input: { name: string; kind: ToyKind; groupId?: string; notes?: string; color?: string }) => void;
  updateToy: (id: string, patch: Partial<Pick<Toy, 'name' | 'kind' | 'groupId' | 'notes' | 'color'>>) => void;
  setToyStatus: (id: string, status: ToyStatus) => void;
  rotate: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
};

const DEFAULT_GROUP_NAMES = ['Basket A', 'Basket B', 'Basket C'];

function makeGroups(catId: string, names: string[] = DEFAULT_GROUP_NAMES): Group[] {
  return DEFAULT_GROUP_NAMES.map((fallback, i) => ({
    id: uid('grp'),
    catId,
    name: cleanName(names[i], fallback),
  }));
}

function toysFromBaskets(catId: string, groups: Group[], baskets: DraftBasket[]): Toy[] {
  const at = nowIso();
  return baskets.slice(0, groups.length).flatMap((basket, i) => {
    const group = groups[i];
    const active = i === 0;
    return basket.toys
      .filter((t) => typeof t.name === 'string' && t.name.trim())
      .slice(0, MAX_TOYS_PER_BASKET)
      .map(
        (t) =>
          ({
            id: uid('toy'),
            catId,
            groupId: group.id,
            name: cleanName(t.name, 'Mystery toy'),
            kind: cleanKind(t.kind),
            color: cleanColor(t.color),
            status: active ? 'active' : 'resting',
            notes: '',
            createdAt: at,
            restStartedAt: active ? null : at,
            retiredAt: null,
          }) satisfies Toy
      );
  });
}

/** Only known settings keys, each validated. */
function cleanSettingsPatch(patch: Partial<Settings>): Partial<Settings> {
  const out: Partial<Settings> = {};
  if ('rotationIntervalDays' in patch) out.rotationIntervalDays = cleanInterval(patch.rotationIntervalDays);
  if ('remindersOn' in patch) out.remindersOn = patch.remindersOn === true;
  if ('onboardingComplete' in patch) out.onboardingComplete = patch.onboardingComplete === true;
  if ('lastRotationAt' in patch) out.lastRotationAt = cleanDate(patch.lastRotationAt);
  if ('newToySnoozedUntil' in patch) out.newToySnoozedUntil = cleanDate(patch.newToySnoozedUntil);
  if ('intervalPromptDismissedAt' in patch) out.intervalPromptDismissedAt = cleanDate(patch.intervalPromptDismissedAt);
  return out;
}

const emptyState = (): PersistedState => ({
  cats: [],
  groups: [],
  toys: [],
  activeCatId: null,
  settings: { ...EMPTY_SETTINGS },
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyState(),
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      completeOnboarding: ({ name, energy, baskets }) => {
        const catId = uid('cat');
        const at = nowIso();
        const cat: Cat = { id: catId, name: cleanName(name, 'Kitty'), energy: cleanEnergy(energy), createdAt: at };
        const groups = makeGroups(catId, baskets.map((b) => b.name));
        set({
          cats: [cat],
          groups,
          toys: toysFromBaskets(catId, groups, baskets),
          activeCatId: catId,
          settings: { ...EMPTY_SETTINGS, onboardingComplete: true, lastRotationAt: at },
        });
      },

      updateCat: (id, patch) =>
        set((s) => ({
          cats: s.cats.map((c) =>
            c.id === id
              ? {
                  ...c,
                  // Empty while typing is allowed; the screen falls back to the old name on blur.
                  ...('name' in patch ? { name: typeof patch.name === 'string' ? patch.name.slice(0, 40) : c.name } : {}),
                  ...('energy' in patch ? { energy: cleanEnergy(patch.energy) } : {}),
                }
              : c
          ),
        })),

      addToy: ({ name, kind, groupId, notes, color }) => {
        const s = get();
        const catId = s.activeCatId;
        if (!catId) return;
        const catGroups = s.groups.filter((g) => g.catId === catId);
        const catToys = s.toys.filter((t) => t.catId === catId);
        // Only accept a basket that belongs to this cat.
        const gid = catGroups.some((g) => g.id === groupId) ? groupId! : balancedGroupId(catGroups, catToys);
        if (!gid) return;
        if (catToys.filter((t) => t.groupId === gid).length >= MAX_TOYS_PER_BASKET) return;
        const at = nowIso();
        const activeGroupId = catToys.find((t) => t.status === 'active')?.groupId ?? catGroups[0]?.id;
        const isActive = gid === activeGroupId;
        const toy: Toy = {
          id: uid('toy'),
          catId,
          groupId: gid,
          name: cleanName(name, 'Mystery toy'),
          kind: cleanKind(kind),
          color: cleanColor(color),
          status: isActive ? 'active' : 'resting',
          notes: cleanNotes(notes),
          createdAt: at,
          restStartedAt: isActive ? null : at,
          retiredAt: null,
        };
        set({ toys: [...s.toys, toy] });
      },

      updateToy: (id, patch) =>
        set((s) => {
          const at = nowIso();
          return {
            toys: s.toys.map((t) => {
              if (t.id !== id) return t;
              const next: Toy = { ...t };
              if ('name' in patch) next.name = cleanName(patch.name, t.name);
              if ('kind' in patch) next.kind = cleanKind(patch.kind);
              if ('notes' in patch) next.notes = cleanNotes(patch.notes);
              if ('color' in patch) next.color = cleanColor(patch.color);
              const target = patch.groupId;
              const validTarget = !!target && s.groups.some((g) => g.id === target && g.catId === t.catId);
              // Moving baskets: take on the new basket's out/resting state.
              if (validTarget && target !== t.groupId) {
                next.groupId = target!;
                if (t.status !== 'retired') {
                  const outGroup = s.toys.find(
                    (o) => o.catId === t.catId && o.status === 'active' && o.id !== t.id
                  )?.groupId;
                  const goesOut = target === outGroup;
                  next.status = goesOut ? 'active' : 'resting';
                  next.restStartedAt = goesOut ? null : (t.restStartedAt ?? at);
                }
              }
              return next;
            }),
          };
        }),

      setToyStatus: (id, status) => {
        if (!['active', 'resting', 'retired'].includes(status)) return;
        const at = nowIso();
        set((s) => ({
          toys: s.toys.map((t) => {
            if (t.id !== id) return t;
            if (status === 'resting') return { ...t, status, restStartedAt: at, retiredAt: null };
            if (status === 'active') return { ...t, status, restStartedAt: null, retiredAt: null };
            return { ...t, status, retiredAt: at };
          }),
        }));
      },

      rotate: () => {
        const s = get();
        const cat = s.cats.find((c) => c.id === s.activeCatId);
        if (!cat) return;
        const household = {
          cat,
          toys: s.toys.filter((t) => t.catId === cat.id),
          groups: s.groups.filter((g) => g.catId === cat.id),
          settings: s.settings,
        };
        const current = household.toys.find((t) => t.status === 'active')?.groupId;
        const nxt = nextGroup(household);
        if (!current || !nxt) return;
        const at = nowIso();
        const updated = applyRotation(household.toys, current, nxt.id, at);
        const entry = {
          at,
          daysOut: Math.max(0, daysBetween(s.settings.lastRotationAt ?? cat.createdAt)),
          interval: intervalDays(cat.energy, s.settings.rotationIntervalDays),
        };
        set({
          toys: s.toys.map((t) => updated.find((u) => u.id === t.id) ?? t),
          settings: {
            ...s.settings,
            lastRotationAt: at,
            swapLog: [...(s.settings.swapLog ?? []), entry].slice(-6),
          },
        });
      },

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...cleanSettingsPatch(patch) } })),

      resetAll: () => set(emptyState()),
    }),
    {
      name: 'purrtate-v1',
      version: STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s): PersistedState => ({
        cats: s.cats,
        groups: s.groups,
        toys: s.toys,
        activeCatId: s.activeCatId,
        settings: s.settings,
      }),
      // v0/v1 had hunt sessions and play counters. sanitizeState drops them.
      migrate: (persisted) => sanitizeState(persisted) as unknown as AppState,
      // Validate on every launch too, in case storage was edited or partly written.
      merge: (persisted, current) => ({
        ...current,
        ...sanitizeState(persisted),
        _hasHydrated: false,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useActiveCat() {
  return useAppStore((s) => s.cats.find((c) => c.id === s.activeCatId) ?? null);
}

export function useHousehold() {
  // Select stable references only. Filtering inside a selector returns a new
  // array every time, which zustand 5 treats as a change and loops forever.
  const cat = useActiveCat();
  const allGroups = useAppStore((s) => s.groups);
  const allToys = useAppStore((s) => s.toys);
  const settings = useAppStore((s) => s.settings);

  return useMemo(() => {
    if (!cat) return null;
    return {
      cat,
      groups: allGroups.filter((g) => g.catId === cat.id),
      toys: allToys.filter((t) => t.catId === cat.id),
      settings,
    };
  }, [cat, allGroups, allToys, settings]);
}
