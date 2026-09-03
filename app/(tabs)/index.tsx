import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PlayRing } from '@/components/PlayRing';
import { ToyGlyph } from '@/components/icons/ToyGlyph';
import { Screen } from '@/components/ui/Screen';
import { Chip, IconButton, PawButton } from '@/components/ui/PawButton';
import { Body, Display, EarCard, Label, Title } from '@/components/ui/Type';
import { YarnMark } from '@/components/icons/CatLogo';
import { formatMinutes, greeting } from '@/lib/dates';
import { ENERGY_PRESETS } from '@/lib/presets';
import { syncReminders } from '@/lib/reminders';
import {
  activeGroup,
  dailyTargetMs,
  nextGroup,
  rotationAlerts,
  todaySessions,
} from '@/lib/rotation';
import { useHousehold, useAppStore } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';

export default function TodayScreen() {
  const router = useRouter();
  const household = useHousehold();
  const rotate = useAppStore((s) => s.rotate);
  const cats = useAppStore((s) => s.cats);
  const switchCat = useAppStore((s) => s.switchCat);

  const remindersOn = useAppStore((s) => s.settings.remindersOn);
  const lastRotationAt = useAppStore((s) => s.settings.lastRotationAt);
  const sessionCount = useAppStore((s) => s.sessions.length);
  const activeCatId = useAppStore((s) => s.activeCatId);

  useEffect(() => {
    const s = useAppStore.getState();
    const cat = s.cats.find((c) => c.id === s.activeCatId);
    if (!cat) return;
    const snapshot = {
      cat,
      toys: s.toys.filter((t) => t.catId === cat.id),
      groups: s.groups.filter((g) => g.catId === cat.id),
      sessions: s.sessions.filter((x) => x.catId === cat.id),
      settings: s.settings,
    };
    void syncReminders(
      s.settings.remindersOn,
      rotationAlerts(snapshot).find((a) => a.kind === 'rotate')
    );
  }, [remindersOn, lastRotationAt, sessionCount, activeCatId]);

  if (!household) return null;

  const { cat, toys, sessions, settings } = household;
  const group = activeGroup(household);
  const nxt = nextGroup(household);
  const out = toys.filter((t) => t.status === 'active');
  const today = todaySessions(sessions, cat.id);
  const todayMs = today.reduce((sum, s) => sum + s.durationMs, 0);
  const target = dailyTargetMs(cat.energy);
  const preset = ENERGY_PRESETS[cat.energy];
  const alerts = rotationAlerts(household);
  const last = [...sessions].sort((a, b) => (a.endedAt < b.endedAt ? 1 : -1))[0];
  const lastToy = toys.find((t) => t.id === last?.toyId);

  return (
    <Screen scroll>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Label>{greeting()}</Label>
          <Display>{cat.name}</Display>
        </View>
        <IconButton onPress={() => router.push('/settings')}>
          <YarnMark size={20} color={colors.ink} />
        </IconButton>
      </View>

      {cats.length > 1 && (
        <View style={styles.cats}>
          {cats.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              selected={c.id === cat.id}
              onPress={() => switchCat(c.id)}
            />
          ))}
        </View>
      )}

      <EarCard>
        <Label>{group?.name ?? 'No basket yet'}</Label>
        <Title style={{ marginTop: 4 }}>Out on the rug</Title>
        {out.length ? (
          <View style={styles.toys}>
            {out.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/toy/${t.id}`)}
                style={styles.toyChip}>
                <ToyGlyph kind={t.kind} size={22} />
                <Body style={styles.toyName}>{t.name}</Body>
              </Pressable>
            ))}
          </View>
        ) : (
          <Body style={{ marginTop: 8 }}>Add a few toys and we’ll split them into rotating baskets.</Body>
        )}
      </EarCard>

      <View style={styles.ringCard}>
        <PlayRing
          progress={todayMs / target}
          currentMs={todayMs}
          targetMs={target}
          sessions={today.length}
          targetSessions={preset.sessionsPerDay}
        />
        <Body style={styles.hint}>
          Aim for two short hunts (~{preset.sessionMin} min). Stop while it’s still fun.
        </Body>
        <PawButton label="Start a hunt" onPress={() => router.push('/(tabs)/play')} />
      </View>

      {alerts.map((a) => (
        <View key={a.title} style={[styles.alert, a.kind === 'rotate' && styles.alertRotate]}>
          <Label>{a.kind === 'rotate' ? 'Rotation' : a.kind === 'play' ? 'Play' : 'Novelty'}</Label>
          <Title style={{ marginTop: 4 }}>{a.title}</Title>
          <Body style={{ marginTop: 6 }}>{a.body}</Body>
          {a.kind === 'rotate' && nxt ? (
            <View style={{ marginTop: 12 }}>
              <PawButton label={`Bring out ${nxt.name}`} onPress={rotate} />
            </View>
          ) : null}
        </View>
      ))}

      {last && lastToy ? (
        <View style={styles.last}>
          <Label>Last pounce</Label>
          <Body style={styles.lastLine}>
            {lastToy.name} · {formatMinutes(last.durationMs)}
            {last.pounces ? ` · ${last.pounces} pounces` : ''}
          </Body>
        </View>
      ) : (
        <View style={styles.last}>
          <Label>Last pounce</Label>
          <Body>No hunts logged yet. The big paw is waiting.</Body>
        </View>
      )}

      <Body style={styles.foot}>
        Cycle: every {settings.rotationIntervalDays ?? preset.intervalDays} days · rest{' '}
        {preset.restDays} days
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6, marginBottom: 8 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  toys: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  toyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cream,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  toyName: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  ringCard: {
    marginTop: 18,
    backgroundColor: colors.paper,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    gap: 12,
  },
  hint: { textAlign: 'center', fontSize: 14 },
  alert: {
    marginTop: 14,
    backgroundColor: colors.sageSoft,
    borderRadius: 22,
    padding: 16,
  },
  alertRotate: {
    backgroundColor: colors.honeySoft,
  },
  last: {
    marginTop: 18,
    gap: 4,
  },
  lastLine: { color: colors.ink, fontFamily: fonts.bodyBold },
  foot: { marginTop: 20, fontSize: 13 },
});
