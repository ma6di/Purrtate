import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ToyGlyph } from '@/components/icons/ToyGlyph';
import { ColorRow } from '@/components/ToyPickers';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { PawButton } from '@/components/ui/PawButton';
import { Body, Display, Label, Title } from '@/components/ui/Type';
import { formatMinutes } from '@/lib/dates';
import { tap } from '@/lib/haptics';
import { TOY_KINDS } from '@/lib/presets';
import { freshnessLabel, freshnessScore } from '@/lib/rotation';
import { useAppStore, useHousehold } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';
import type { ToyKind, ToyStatus } from '@/types/models';

export default function ToyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const household = useHousehold();
  const updateToy = useAppStore((s) => s.updateToy);
  const setToyStatus = useAppStore((s) => s.setToyStatus);
  const toy = household?.toys.find((t) => t.id === id);
  const [name, setName] = useState(toy?.name ?? '');

  useEffect(() => {
    if (toy) setName(toy.name);
  }, [toy?.id, toy?.name]);

  if (!household || !toy) {
    return (
      <Screen>
        <Body>That toy wandered off.</Body>
        <PawButton label="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const score = freshnessScore(toy, household.cat.energy);
  const sessions = household.sessions.filter((s) => s.toyId === toy.id);
  const avg = toy.playCount ? toy.totalPlayMs / toy.playCount : 0;

  const statusBtn = (status: ToyStatus, label: string) => (
    <Pressable
      onPress={() => {
        tap();
        setToyStatus(toy.id, status);
      }}
      style={[styles.status, toy.status === status && styles.statusOn]}>
      <Body style={styles.statusText}>{label}</Body>
    </Pressable>
  );

  return (
    <Screen scroll>
      <View style={styles.top}>
        <BackButton />
      </View>

      <View style={styles.hero}>
        <View style={styles.glyph}>
          <ToyGlyph kind={toy.kind} size={42} />
        </View>
        <Display>{toy.name}</Display>
        <Label>
          {freshnessLabel(score, toy.status)} · {Math.round(score)} freshness
        </Label>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        onEndEditing={() => name.trim() && updateToy(toy.id, { name: name.trim() })}
        style={styles.input}
      />

      <Label>Type</Label>
      <View style={styles.kinds}>
        {TOY_KINDS.map((k) => (
          <Pressable
            key={k.kind}
            onPress={() => {
              tap();
              updateToy(toy.id, { kind: k.kind });
            }}
            style={[styles.kind, toy.kind === k.kind && styles.kindOn]}>
            <ToyGlyph kind={k.kind} size={22} />
          </Pressable>
        ))}
      </View>

      <Label>Colour</Label>
      <View style={{ marginVertical: 12 }}>
        <ColorRow value={toy.color} onChange={(color) => updateToy(toy.id, { color })} />
      </View>

      <Label>Basket</Label>
      <View style={styles.groups}>
        {household.groups.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => {
              tap();
              updateToy(toy.id, { groupId: g.id });
            }}
            style={[styles.group, toy.groupId === g.id && styles.kindOn]}>
            <Body style={styles.gText}>{g.name.replace('Basket ', '')}</Body>
          </Pressable>
        ))}
      </View>

      <Label>Status</Label>
      <View style={styles.groups}>
        {statusBtn('active', 'Out')}
        {statusBtn('resting', 'Rest')}
        {statusBtn('retired', 'Retired')}
      </View>

      <View style={styles.stats}>
        <Stat label="Hunts" value={String(toy.playCount)} />
        <Stat label="Total" value={toy.playCount ? formatMinutes(toy.totalPlayMs) : '—'} />
        <Stat label="Average" value={toy.playCount ? formatMinutes(avg) : '—'} />
      </View>

      {sessions.slice(-3).reverse().map((s) => (
        <Body key={s.id} style={styles.session}>
          {s.endedAt.slice(0, 10)} · {formatMinutes(s.durationMs)}
          {s.pounces ? ` · ${s.pounces} pounces` : ''}
        </Body>
      ))}

      <Body style={styles.worn}>
        Frayed string, loose feathers or a split seam? Retire it. Swallowed string or small parts need a vet the same day.
      </Body>

      <PawButton
        label="Forget this toy"
        variant="ghost"
        paw={false}
        onPress={() => {
          Alert.alert('Retire this toy?', 'It will sit in Retired until you bring it back.', [
            { text: 'Keep' },
            {
              text: 'Retire',
              style: 'destructive',
              onPress: () => {
                setToyStatus(toy.id, 'retired');
                router.back();
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Label>{label}</Label>
      <Title>{value}</Title>
    </View>
  );
}

const styles = StyleSheet.create({
  worn: { fontSize: 13, marginTop: 18, marginBottom: 12 },
  top: { marginBottom: 8 },
  hero: { alignItems: 'center', gap: 8, marginBottom: 16 },
  glyph: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  kind: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  kindOn: { borderColor: colors.terracotta, backgroundColor: '#F8E4DC' },
  groups: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  group: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  gText: { fontFamily: fonts.bodyBold, color: colors.ink },
  status: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  statusOn: { borderColor: colors.sage, backgroundColor: colors.sageSoft },
  statusText: { fontFamily: fonts.bodyBold, color: colors.ink },
  stats: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  session: { marginBottom: 6 },
});
