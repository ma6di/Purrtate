import { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { NewToyCard } from '@/components/NewToyCard';
import { ToyCard } from '@/components/ToyCard';
import { YarnMark } from '@/components/icons/CatLogo';
import { Screen } from '@/components/ui/Screen';
import { Chip, IconButton, PawButton } from '@/components/ui/PawButton';
import { Body, Display, EarCard, Label } from '@/components/ui/Type';
import { success, warning } from '@/lib/haptics';
import { syncReminders } from '@/lib/reminders';
import { basketStatus, earlySwapSuggestion, toysInGroup } from '@/lib/rotation';
import { useAppStore, useHousehold } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';

function dayWord(n: number) {
  return `${n} day${n === 1 ? '' : 's'}`;
}

export default function TodayScreen() {
  const router = useRouter();
  const household = useHousehold();
  const rotate = useAppStore((s) => s.rotate);
  const cats = useAppStore((s) => s.cats);
  const switchCat = useAppStore((s) => s.switchCat);
  const remindersOn = useAppStore((s) => s.settings.remindersOn);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const status = household ? basketStatus(household) : null;

  useEffect(() => {
    if (!household || !status) return;
    void syncReminders(
      remindersOn,
      status.next
        ? { dueAt: status.dueAt, nextName: status.next.name, catName: household.cat.name }
        : null
    );
    // Reschedule only when the due date, next basket or setting actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remindersOn, status?.dueAt, status?.next?.id, household?.cat.id]);

  if (!household || !status) return null;

  const { cat } = household;
  const { group, next, daysOut, interval, daysLeft, due } = status;
  const out = group ? toysInGroup(household, group.id) : [];
  const nextToys = next ? toysInGroup(household, next.id) : [];
  const progress = Math.min(1, daysOut / Math.max(1, interval));
  const suggestion = earlySwapSuggestion(household);

  const statusLine = !next
    ? 'Only one basket has toys, so there’s nothing to swap yet.'
    : due
      ? `Out ${dayWord(daysOut)}. Time to swap.`
      : daysLeft === 1
        ? `Out ${dayWord(daysOut)}. Swap tomorrow.`
        : `Out ${dayWord(daysOut)}. Swap in ${dayWord(daysLeft)}.`;

  return (
    <Screen scroll>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Label>Today</Label>
          <Display>{cat.name}</Display>
        </View>
        <IconButton onPress={() => router.push('/settings')}>
          <YarnMark size={20} color={colors.ink} />
        </IconButton>
      </View>

      {cats.length > 1 && (
        <View style={styles.cats}>
          {cats.map((c) => (
            <Chip key={c.id} label={c.name} selected={c.id === cat.id} onPress={() => switchCat(c.id)} />
          ))}
        </View>
      )}

      <EarCard>
        <Label>Out now</Label>
        <Display style={styles.basketName}>{group?.name ?? 'No basket'}</Display>
        <Body style={[styles.status, due && styles.statusDue]}>{statusLine}</Body>
        {next ? (
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${progress * 100}%`, backgroundColor: due ? colors.terracotta : colors.honey },
              ]}
            />
          </View>
        ) : null}

        <View style={styles.list}>
          {out.map((t) => (
            <ToyCard key={t.id} toy={t} household={household} />
          ))}
          {!out.length && (
            <View style={styles.empty}>
              <Body>No toys in this basket yet.</Body>
              <PawButton
                label="Add toys"
                variant="ghost"
                paw={false}
                onPress={() => router.push('/(tabs)/toys')}
              />
            </View>
          )}
        </View>
      </EarCard>

      <NewToyCard household={household} />

      {suggestion ? (
        <View style={styles.suggest}>
          <Label>Your cat’s pace</Label>
          <Body style={styles.suggestText}>
            You swapped early the last two times, after about {suggestion.avgDaysOut} days. Swap every{' '}
            {suggestion.suggested} days instead of {suggestion.current}?
          </Body>
          <View style={styles.suggestRow}>
            <PawButton
              label={`Every ${suggestion.suggested} days`}
              paw={false}
              style={{ flex: 1 }}
              onPress={() =>
                updateSettings({
                  rotationIntervalDays: suggestion.suggested,
                  intervalPromptDismissedAt: new Date().toISOString(),
                })
              }
            />
            <PawButton
              label={`Keep ${suggestion.current}`}
              variant="ghost"
              paw={false}
              style={{ flex: 1 }}
              onPress={() => updateSettings({ intervalPromptDismissedAt: new Date().toISOString() })}
            />
          </View>
        </View>
      ) : null}

      {next ? (
        <View style={styles.swap}>
          {!due ? (
            <Body style={styles.early}>
              Already bored of these? Ignoring the toys, or only batting them once, means it’s time. Swap early.
            </Body>
          ) : null}
          <PawButton
            label={`Swap to ${next.name}`}
            variant={due ? 'fill' : 'ghost'}
            paw={due}
            onPress={() => {
              warning();
              const outName = group?.name ?? 'This basket';
              Alert.alert(
                `Swap to ${next.name}?`,
                due
                  ? `${outName} goes back in the cupboard to rest, and ${next.name} comes out.`
                  : `${outName} has only been out ${dayWord(daysOut)} of ${dayWord(interval)}. Swap early anyway? ${outName} will rest and ${next.name} comes out.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Swap',
                    onPress: () => {
                      success();
                      rotate();
                    },
                  },
                ]
              );
            }}
          />
          <Body style={styles.swapHint}>
            {group?.name ?? 'This basket'} goes back in the cupboard to rest. {next.name} comes out with{' '}
            {nextToys.length} toy{nextToys.length === 1 ? '' : 's'}
            {nextToys.length ? `: ${nextToys.map((t) => t.name).join(', ')}` : ''}.
          </Body>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6, marginBottom: 12 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  basketName: { marginTop: 2 },
  status: { marginTop: 6, fontFamily: fonts.bodyBold, color: colors.inkSoft },
  statusDue: { color: colors.terracottaDeep },
  track: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.creamDeep,
    marginTop: 12,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  list: { gap: 10, marginTop: 16 },
  empty: {
    gap: 12,
    padding: 16,
    borderRadius: radii.md,
    backgroundColor: colors.cream,
  },
  swap: { marginTop: 18, gap: 10 },
  swapHint: { fontSize: 14, textAlign: 'center' },
  early: { fontSize: 14, textAlign: 'center', color: colors.inkSoft },
  suggest: {
    marginTop: 16,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.sageSoft,
    gap: 8,
  },
  suggestText: { fontSize: 15, color: colors.ink },
  suggestRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
