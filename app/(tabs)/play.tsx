import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PawMark } from '@/components/icons/CatLogo';
import { ToyGlyph } from '@/components/icons/ToyGlyph';
import { Screen } from '@/components/ui/Screen';
import { PawButton } from '@/components/ui/PawButton';
import { Body, Display, Label, Title } from '@/components/ui/Type';
import { formatClock } from '@/lib/dates';
import { paw, success, tap } from '@/lib/haptics';
import { useAppStore, useHousehold } from '@/store/useAppStore';
import { colors, fonts, radii, shadow } from '@/theme';

export default function PlayScreen() {
  const household = useHousehold();
  const live = useAppStore((s) => s.liveSession);
  const startPlay = useAppStore((s) => s.startPlay);
  const addPounce = useAppStore((s) => s.addPounce);
  const endPlay = useAppStore((s) => s.endPlay);
  const [picked, setPicked] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [live]);

  if (!household) return null;

  const out = household.toys.filter((t) => t.status === 'active');
  const selected = picked ?? out[0]?.id ?? null;
  const liveToy = household.toys.find((t) => t.id === live?.toyId);
  const elapsed = live ? now - new Date(live.startedAt).getTime() : 0;

  if (live && liveToy) {
    return (
      <Screen scroll>
        <Label>Hunt in progress</Label>
        <Display>{liveToy.name}</Display>
        <View style={styles.timerBox}>
          <Display style={styles.clock}>{formatClock(elapsed)}</Display>
          <Body>Tap the paw each time they pounce, bite, or chase.</Body>
        </View>
        <Pressable
          onPress={() => {
            paw();
            addPounce();
          }}
          style={({ pressed }) => [styles.bigPaw, shadow.paw, pressed && { transform: [{ scale: 0.96 }] }]}>
          <PawMark size={64} color={colors.white} />
        </Pressable>
        <Title style={styles.pounces}>{live.pounces} pounces</Title>
        <PawButton
          label="End hunt"
          variant="ghost"
          paw={false}
          onPress={() => {
            success();
            endPlay();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Label>Interactive play</Label>
      <Display>Start a hunt</Display>
      <Body style={{ marginTop: 8 }}>
        Pick what’s out, start the timer, then tap pounces. Ten to fifteen minutes is plenty.
      </Body>

      <View style={styles.grid}>
        {out.map((t) => {
          const on = t.id === selected;
          return (
            <Pressable
              key={t.id}
              onPress={() => {
                tap();
                setPicked(t.id);
              }}
              style={[styles.pick, on && styles.pickOn]}>
              <ToyGlyph kind={t.kind} size={28} />
              <Body style={styles.pickName}>{t.name}</Body>
            </Pressable>
          );
        })}
        {!out.length && <Body>No toys are out. Add some, or rotate a resting basket in.</Body>}
      </View>

      <Pressable
        disabled={!selected}
        onPress={() => {
          if (!selected) return;
          paw();
          startPlay(selected);
        }}
        style={({ pressed }) => [
          styles.bigPaw,
          shadow.paw,
          !selected && { opacity: 0.4 },
          pressed && { transform: [{ scale: 0.96 }] },
        ]}>
        <PawMark size={64} color={colors.white} />
      </Pressable>
      <Body style={styles.cta}>Paw to start</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 20 },
  pick: {
    width: '47%',
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    gap: 8,
  },
  pickOn: {
    borderColor: colors.terracotta,
    backgroundColor: '#F8E4DC',
  },
  pickName: { fontFamily: fonts.bodyBold, color: colors.ink },
  bigPaw: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cta: { textAlign: 'center', marginTop: 12 },
  timerBox: { alignItems: 'center', marginTop: 24, gap: 8 },
  clock: { fontSize: 64, lineHeight: 70 },
  pounces: { textAlign: 'center', marginVertical: 16 },
});
