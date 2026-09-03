import { StyleSheet, View } from 'react-native';

import { GroupTimeline } from '@/components/GroupTimeline';
import { Sparkline } from '@/components/Sparkline';
import { ToyGlyph } from '@/components/icons/ToyGlyph';
import { Screen } from '@/components/ui/Screen';
import { Body, Display, Label, Title } from '@/components/ui/Type';
import { formatMinutes } from '@/lib/dates';
import { ENERGY_PRESETS } from '@/lib/presets';
import { activeGroup, favoriteToy, playByDay } from '@/lib/rotation';
import { useHousehold } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';

export default function InsightsScreen() {
  const household = useHousehold();
  if (!household) return null;

  const { cat, toys, sessions, groups } = household;
  const series = playByDay(sessions, cat.id);
  const fav = favoriteToy(household);
  const group = activeGroup(household);
  const weekMs = series.slice(-7).reduce((sum, d) => sum + d.ms, 0);
  const declining = [...toys]
    .filter((t) => t.playCount >= 3)
    .sort((a, b) => a.totalPlayMs / a.playCount - b.totalPlayMs / b.playCount)[0];

  return (
    <Screen scroll>
      <Label>{cat.name}’s den</Label>
      <Display>Play patterns</Display>
      <Body style={{ marginTop: 6 }}>
        Drops after a few days are habituation, not a boring cat. Spikes after a swap mean the rotation is working.
      </Body>

      <View style={{ marginTop: 18 }}>
        <Sparkline points={series} label="Last 14 days" />
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Label>This week</Label>
          <Title>{formatMinutes(weekMs)}</Title>
        </View>
        <View style={styles.stat}>
          <Label>Hunts</Label>
          <Title>{sessions.length}</Title>
        </View>
      </View>

      {fav && fav.playCount > 0 ? (
        <View style={styles.fav}>
          <ToyGlyph kind={fav.kind} size={32} />
          <View style={{ flex: 1 }}>
            <Label>Favorite (for now)</Label>
            <Title>{fav.name}</Title>
            <Body>
              {formatMinutes(fav.totalPlayMs)} across {fav.playCount} hunts
            </Body>
          </View>
        </View>
      ) : null}

      {declining ? (
        <View style={styles.note}>
          <Label>Watch</Label>
          <Body>
            {declining.name} has shorter average sessions. Rest it for about a week and it often comes back “new.”
          </Body>
        </View>
      ) : null}

      <View style={{ marginTop: 16 }}>
        <GroupTimeline groups={groups} activeId={group?.id} />
      </View>

      <Body style={styles.foot}>
        {ENERGY_PRESETS[cat.energy].label} rhythm · {ENERGY_PRESETS[cat.energy].blurb}
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  fav: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  note: {
    marginTop: 14,
    backgroundColor: colors.honeySoft,
    borderRadius: radii.lg,
    padding: 16,
    gap: 6,
  },
  foot: { marginTop: 18, fontSize: 13, fontFamily: fonts.body },
});
