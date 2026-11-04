import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ToyGlyph, kindColor } from '@/components/icons/ToyGlyph';
import { ColorDot } from '@/components/ToyPickers';
import { Body, Label } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { PLAY_ROLES, roleOf } from '@/lib/presets';
import { freshnessLabel, freshnessScore, type Household } from '@/lib/rotation';
import { colors, fonts, radii } from '@/theme';
import type { Toy } from '@/types/models';

export function ToyCard({ toy, household }: { toy: Toy; household: Household }) {
  const router = useRouter();
  const score = freshnessScore(toy, household);
  const role = PLAY_ROLES.find((r) => r.role === roleOf(toy.kind))!.label;
  const tint = kindColor(toy.kind);
  return (
    <Pressable
      onPress={() => {
        tap();
        router.push(`/toy/${toy.id}`);
      }}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.glyph, { backgroundColor: `${tint}24` }]}>
        <ToyGlyph kind={toy.kind} size={30} />
      </View>
      <View style={styles.meta}>
        <View style={styles.nameRow}>
          <Body style={styles.name}>{toy.name}</Body>
          <ColorDot hex={toy.color} />
        </View>
        <Label>{freshnessLabel(score, toy.status)}</Label>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${score}%`, backgroundColor: tint }]} />
        </View>
      </View>
      <View style={styles.right}>
        <Label style={styles.status}>{role}</Label>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  glyph: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    marginBottom: 2,
  },
  track: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.creamDeep,
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  right: { alignItems: 'flex-end' },
  status: { color: colors.terracotta },
});
