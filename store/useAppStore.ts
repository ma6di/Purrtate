import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { nowIso } from '@/lib/dates';
import { uid } from '@/lib/ids';
import type { DraftBasket } from '@/lib/presets';
import { applyRotation, balancedGroupId, nextGroup } from '@/lib/rotation';
import type {
  Cat,
  Energy,
  Group,
  LiveSession,
  Session,
  Settings,
  Toy,
  ToyKind,
  ToyStatus,
} from '@/types/models';

type OnboardingInput = {
  name: string;
  energy: Energy;
  /** Three baskets built during setup. The first one starts out on the rug. */
  baskets: DraftBasket[];
};

type AppState = {
  _hasHydrated: boolean;
  cats: Cat[];
  groups: Group[];
  toys: Toy[];
  sessions: Session[];
  activeCatId: string | null;
  liveSession: LiveSession | null;
  settings: Settings;
  setHasHydrated: (v: boolean) => void;
  completeOnboarding: (input: OnboardingInput) => void;
  addCat: (name: string, energy: Energy) => void;
  updateCat: (id: string, patch: Partial<Pick<Cat, 'name' | 'energy'>>) => void;
  switchCat: (id: string) => void;
  addToy: (input: { name: string; kind: ToyKind; groupId?: string; notes?: string; color?: string }) => void;
  updateToy: (id: string, patch: Partial<Pick<Toy, 'name' | 'kind' | 'groupId' | 'notes' | 'status' | 'color'>>) => void;
  setToyStatus: (id: string, status: ToyStatus) => void;
  startPlay: (toyId: string) => void;
  addPounce: () => void;
  endPlay: () => void;
  rotate: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
};

const emptySettings: Settings = {
  onboardingComplete: false,
  rotationIntervalDays: null,
  remindersOn: false,
  lastRotationAt: null,
};

const DEFAULT_GROUP_NAMES = ['Basket A', 'Basket B', 'Basket C'];

function makeGroups(catId: string, names: string[] = DEFAULT_GROUP_NAMES): Group[] {
  return DEFAULT_GROUP_NAMES.map((fallback, i) => ({
    id: uid('grp'),
    catId,
    name: names[i]?.trim() || fallback,
  }));
}

function toysFromBaskets(catId: string, groups: Group[], baskets: DraftBasket[]): Toy[] {
  const at = nowIso();
  return baskets.flatMap((basket, i) => {
    const group = groups[i];
    if (!group) return [];
    const active = i === 0;
    return basket.toys
      .filter((t) => t.name.trim())
      .map(
        (t) =>
          ({
            id: uid('toy'),
            catId,
            groupId: group.id,
            name: t.name.trim(),
            kind: t.kind,
            color: t.color,
            status: active ? 'active' : 'resting',
            notes: '',
            createdAt: at,
            lastUsedAt: null,
            restStartedAt: active ? null : at,
            totalPlayMs: 0,
            playCount: 0,
          }) satisfies Toy
      );
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      cats: [],
      groups: [],
      toys: [],
      sessions: [],
      activeCatId: null,
      liveSession: null,
      settings: emptySettings,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      completeOnboarding: ({ name, energy, baskets }) => {
        const catId = uid('cat');
        const at = nowIso();
        const cat: Cat = { id: catId, name: name.trim() || 'Kitty', energy, createdAt: at };
        const groups = makeGroups(catId, baskets.map((b) => b.name));
        const toys = toysFromBaskets(catId, groups, baskets);
        set({
          cats: [cat],
          groups,
          toys,
          sessions: [],
          activeCatId: catId,
          liveSession: null,
          settings: {
            ...emptySettings,
            onboardingComplete: true,
            lastRotationAt: at,
          },
        });
      },
      addCat: (name, energy) => {
        const catId = uid('cat');
        const at = nowIso();
        const groups = makeGroups(catId);
        set((s) => ({
          cats: [...s.cats, { id: catId, name: name.trim() || 'Kitty', energy, createdAt: at }],
          groups: [...s.groups, ...groups],
          activeCatId: catId,
        }));
      },
      updateCat: (id, patch) =>
        set((s) => ({
          cats: s.cats.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      switchCat: (id) => set({ activeCatId: id, liveSession: null }),
      addToy: ({ name, kind, groupId, notes, color }) => {
        const s = get();
        const catId = s.activeCatId;
        if (!catId) return;
        const catGroups = s.groups.filter((g) => g.catId === catId);
        const gid = groupId || balancedGroupId(catGroups, s.toys.filter((t) => t.catId === catId));
        const at = nowIso();
        const activeGroupId = s.toys.find((t) => t.catId === catId && t.status === 'active')?.groupId ?? catGroups[0]?.id;
        const isActive = gid === activeGroupId;
        const toy: Toy = {
          id: uid('toy'),
          catId,
          groupId: gid,
          name: name.trim() || 'Mystery toy',
          kind,
          color,
          status: isActive ? 'active' : 'resting',
          notes: notes ?? '',
          createdAt: at,
          lastUsedAt: null,
          restStartedAt: isActive ? null : at,
          totalPlayMs: 0,
          playCount: 0,
        };
        set({ toys: [...s.toys, toy] });
      },
      updateToy: (id, patch) =>
        set((s) => ({
          toys: s.toys.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      setToyStatus: (id, status) => {
        const at = nowIso();
        set((s) => ({
          toys: s.toys.map((t) => {
            if (t.id !== id) return t;
            if (status === 'resting') return { ...t, status, restStartedAt: at };
            if (status === 'active') return { ...t, status, restStartedAt: null };
            return { ...t, status };
          }),
        }));
      },
      startPlay: (toyId) => {
        const existing = get().liveSession;
        if (existing) return;
        set({
          liveSession: {
            toyId,
            startedAt: nowIso(),
            pounces: 0,
            firstEngageAt: null,
          },
        });
      },
      addPounce: () => {
        const live = get().liveSession;
        if (!live) return;
        set({
          liveSession: {
            ...live,
            pounces: live.pounces + 1,
            firstEngageAt: live.firstEngageAt ?? nowIso(),
          },
        });
      },
      endPlay: () => {
        const s = get();
        const live = s.liveSession;
        if (!live) return;
        const endedAt = nowIso();
        const durationMs = Math.max(1_000, new Date(endedAt).getTime() - new Date(live.startedAt).getTime());
        const toy = s.toys.find((t) => t.id === live.toyId);
        if (!toy) {
          set({ liveSession: null });
          return;
        }
        const timeToEngageSec = live.firstEngageAt
          ? Math.max(0, Math.round((new Date(live.firstEngageAt).getTime() - new Date(live.startedAt).getTime()) / 1000))
          : null;
        const session: Session = {
          id: uid('ses'),
          catId: toy.catId,
          toyId: toy.id,
          startedAt: live.startedAt,
          endedAt,
          durationMs,
          pounces: live.pounces,
          timeToEngageSec,
        };
        set({
          liveSession: null,
          sessions: [...s.sessions, session],
          toys: s.toys.map((t) =>
            t.id === toy.id
              ? {
                  ...t,
                  lastUsedAt: endedAt,
                  playCount: t.playCount + 1,
                  totalPlayMs: t.totalPlayMs + durationMs,
                }
              : t
          ),
        });
      },
      rotate: () => {
        const s = get();
        const catId = s.activeCatId;
        if (!catId) return;
        const household = {
          cat: s.cats.find((c) => c.id === catId)!,
          toys: s.toys.filter((t) => t.catId === catId),
          groups: s.groups.filter((g) => g.catId === catId),
          sessions: s.sessions.filter((x) => x.catId === catId),
          settings: s.settings,
        };
        if (!household.cat) return;
        const current = household.toys.find((t) => t.status === 'active')?.groupId;
        const nxt = nextGroup(household);
        if (!current || !nxt) return;
        const at = nowIso();
        const updated = applyRotation(household.toys, current, nxt.id, at);
        set({
          toys: s.toys.map((t) => updated.find((u) => u.id === t.id) ?? t),
          settings: { ...s.settings, lastRotationAt: at },
        });
      },
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetAll: () =>
        set({
          cats: [],
          groups: [],
          toys: [],
          sessions: [],
          activeCatId: null,
          liveSession: null,
          settings: emptySettings,
        }),
    }),
    {
      name: 'purrtate-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        cats: s.cats,
        groups: s.groups,
        toys: s.toys,
        sessions: s.sessions,
        activeCatId: s.activeCatId,
        settings: s.settings,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        liveSession: null,
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
  const cat = useActiveCat();
  const groups = useAppStore((s) => s.groups.filter((g) => g.catId === s.activeCatId));
  const toys = useAppStore((s) => s.toys.filter((t) => t.catId === s.activeCatId));
  const sessions = useAppStore((s) => s.sessions.filter((x) => x.catId === s.activeCatId));
  const settings = useAppStore((s) => s.settings);
  if (!cat) return null;
  return { cat, groups, toys, sessions, settings };
}
