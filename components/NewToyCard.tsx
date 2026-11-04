import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PawButton } from '@/components/ui/PawButton';
import { Body, Label, Title } from '@/components/ui/Type';
import { addDays, nowIso } from '@/lib/dates';
import { tap } from '@/lib/haptics';
import type { Household } from '@/lib/rotation';
import { newToyNudge } from '@/lib/toyAdvice';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';

const SNOOZE_DAYS = 7;

/** "Every now and then, add something new." Shown when the nudge is due. */
export function NewToyCard({ household }: { household: Household }) {
  const router = useRouter();
  const updateSettings = useAppStore((s) => s.updateSettings);
  const nudge = newToyNudge(household);
  if (!nudge.due) return null;

  const weeks = Math.round(nudge.daysSince / 7);
  return (
    <View style={styles.card}>
      <Label style={{ color: colors.terracottaDeep }}>New toy time</Label>
      <Title style={styles.title}>Something new for {household.cat.name}</Title>
      <Body style={styles.body}>
        It’s been about {weeks} week{weeks === 1 ? '' : 's'} since a new toy joined. Rotation keeps toys fresh for a
        while, but a new texture, sound or prey shape works best of all. It doesn’t have to cost much: a paper bag, a
        cardboard box or a crumpled ball of paper all count.
      </Body>
      <View style={styles.row}>
        <PawButton
          label="Add a new toy"
          style={{ flex: 1 }}
          onPress={() => router.push('/toy/new')}
        />
        <Pressable
          onPress={() => {
            tap();
            updateSettings({ newToySnoozedUntil: addDays(nowIso(), SNOOZE_DAYS) });
          }}
          hitSlop={8}
          style={styles.later}>
          <Body style={styles.laterText}>Not now</Body>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.honeySoft,
    gap: 6,
  },
  title: { fontSize: 19 },
  body: { fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  later: { paddingHorizontal: 8, paddingVertical: 10 },
  laterText: { fontFamily: fonts.bodyBold, color: colors.inkSoft },
});
