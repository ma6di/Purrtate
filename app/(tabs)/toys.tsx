import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { NewToyCard } from '@/components/NewToyCard';
import { ToyCard } from '@/components/ToyCard';
import { Screen } from '@/components/ui/Screen';
import { Body, Display, Label, Title } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { PLAY_ROLES } from '@/lib/presets';
import { activeGroup, basketStatus, restDaysFor, toysInGroup } from '@/lib/rotation';
import { basketIssues, basketMix, toySuggestions, type ToySuggestion } from '@/lib/toyAdvice';
import { useAppStore, useHousehold } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';
import { daysBetween } from '@/lib/dates';

const IDEA_LABEL: Record<ToySuggestion['kind'], string> = {
  add: 'Add toys',
  buy: 'Shopping idea',
  refresh: 'Novelty',
  safety: 'Play tip',
};

const ROLE_COLOR = { chase: colors.terracotta, stalk: colors.honey, grab: colors.sage } as const;

export default function ToysScreen() {
  const router = useRouter();
  const household = useHousehold();
  const [showRetired, setShowRetired] = useState(false);
  const [openIssues, setOpenIssues] = useState<string | null>(null);
  const updateToy = useAppStore((s) => s.updateToy);

  if (!household) return null;
  const ideas = toySuggestions(household).slice(0, 3);
  const current = activeGroup(household);
  const status = basketStatus(household);
  const retired = household.toys.filter((t) => t.status === 'retired');

  // Out basket first, then the others in rotation order.
  const ordered = [...household.groups].sort((a, b) =>
    a.id === current?.id ? -1 : b.id === current?.id ? 1 : 0
  );

  const subtitle = (groupId: string) => {
    if (groupId === current?.id) return `Out now · ${status.daysOut} day${status.daysOut === 1 ? '' : 's'}`;
    if (groupId === status.next?.id) return 'Up next';
    const rest = household.toys.find((t) => t.groupId === groupId && t.restStartedAt)?.restStartedAt;
    const days = rest ? daysBetween(rest) : 0;
    return days >= restDaysFor(household) ? 'Rested · feels new' : `Resting · ${days} day${days === 1 ? '' : 's'}`;
  };

  return (
    <Screen scroll>
      <Label>The cupboard</Label>
      <Display>Toys</Display>

      <NewToyCard household={household} />

      {ideas.length ? (
        <View style={styles.ideas}>
          {ideas.map((idea) => (
            <View
              key={idea.id}
              style={[
                styles.idea,
                idea.kind === 'buy' && styles.ideaBuy,
                idea.kind === 'safety' && styles.ideaSafety,
              ]}>
              <Label>{IDEA_LABEL[idea.kind]}</Label>
              <Title style={{ marginTop: 2, fontSize: 18 }}>{idea.title}</Title>
              <Body style={{ marginTop: 4, fontSize: 14 }}>{idea.body}</Body>
            </View>
          ))}
        </View>
      ) : null}

      {ordered.map((g) => {
        const toys = toysInGroup(household, g.id);
        const mix = basketMix(toys.map((t) => t.kind));
        const isOut = g.id === current?.id;
        const issues = basketIssues(household, g.id);
        const issuesOpen = openIssues === g.id;
        return (
          <View key={g.id} style={[styles.basket, isOut && styles.basketOut]}>
            <View style={styles.head}>
              <View style={{ flex: 1 }}>
                <Title style={{ fontSize: 20 }}>{g.name}</Title>
                <Label style={isOut ? { color: colors.terracottaDeep } : undefined}>{subtitle(g.id)}</Label>
              </View>
              {issues.length ? (
                <Pressable
                  onPress={() => {
                    tap();
                    setOpenIssues(issuesOpen ? null : g.id);
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`${g.name} needs attention`}
                  style={[styles.bang, issuesOpen && styles.bangOn]}>
                  <Body style={[styles.bangText, issuesOpen && { color: colors.white }]}>!</Body>
                </Pressable>
              ) : null}
              <View style={styles.dots}>
                {PLAY_ROLES.map((r) => (
                  <View
                    key={r.role}
                    accessibilityLabel={`${r.label} ${mix.have.includes(r.role) ? 'covered' : 'missing'}`}
                    style={[
                      styles.dot,
                      { borderColor: ROLE_COLOR[r.role] },
                      mix.have.includes(r.role) && { backgroundColor: ROLE_COLOR[r.role] },
                    ]}
                  />
                ))}
              </View>
            </View>

            {issuesOpen ? (
              <View style={styles.issues}>
                {issues.map((issue) => (
                  <View key={issue.id} style={styles.issue}>
                    <Body style={styles.issueText}>{issue.text}</Body>
                    {issue.move ? (
                      <Pressable
                        onPress={() => {
                          tap();
                          updateToy(issue.move!.toyId, { groupId: g.id });
                        }}
                        style={styles.issueBtn}>
                        <Body style={styles.addText}>
                          Move {issue.move.toyName} from {issue.move.fromName}
                        </Body>
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.list}>
              {toys.map((toy) => (
                <ToyCard key={toy.id} toy={toy} household={household} />
              ))}
            </View>

            <Pressable
              onPress={() => {
                tap();
                router.push({ pathname: '/toy/new', params: { group: g.id } });
              }}
              style={styles.add}>
              <Body style={styles.addText}>+ Add to {g.name}</Body>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.legend}>
        {PLAY_ROLES.map((r) => (
          <View key={r.role} style={styles.legendItem}>
            <View style={[styles.dot, { borderColor: ROLE_COLOR[r.role], backgroundColor: ROLE_COLOR[r.role] }]} />
            <Body style={styles.legendText}>{r.label}</Body>
          </View>
        ))}
      </View>

      {retired.length ? (
        <View style={styles.retired}>
          <Pressable
            onPress={() => {
              tap();
              setShowRetired((v) => !v);
            }}
            style={styles.retiredHead}>
            <Title style={{ fontSize: 18, flex: 1 }}>Retired · {retired.length}</Title>
            <Body style={styles.addText}>{showRetired ? 'Hide' : 'Show'}</Body>
          </Pressable>
          {showRetired ? (
            <View style={styles.list}>
              {retired.map((toy) => (
                <ToyCard key={toy.id} toy={toy} household={household} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  ideas: { gap: 10, marginTop: 16 },
  idea: {
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ideaBuy: { backgroundColor: colors.honeySoft, borderColor: colors.honeySoft },
  ideaSafety: { backgroundColor: colors.sageSoft, borderColor: colors.sageSoft },
  basket: {
    marginTop: 16,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.creamDeep,
    gap: 12,
  },
  basketOut: { backgroundColor: '#F6DCD2' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dots: { flexDirection: 'row', gap: 4 },
  bang: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.honeySoft,
    borderWidth: 1.5,
    borderColor: colors.honey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bangOn: { backgroundColor: colors.terracotta, borderColor: colors.terracotta },
  bangText: { fontFamily: fonts.label, color: colors.terracottaDeep, fontSize: 15, lineHeight: 18 },
  issues: { gap: 8, padding: 12, borderRadius: radii.md, backgroundColor: colors.paper },
  issue: { gap: 6 },
  issueText: { fontSize: 14, color: colors.ink },
  issueBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  list: { gap: 8 },
  add: {
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.whisker,
    alignItems: 'center',
  },
  addText: { fontFamily: fonts.bodyBold, color: colors.terracottaDeep },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 13 },
  retired: { marginTop: 20, gap: 10 },
  retiredHead: { flexDirection: 'row', alignItems: 'center' },
});
