import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ToyGlyph } from '@/components/icons/ToyGlyph';
import { ColorRow } from '@/components/ToyPickers';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { PawButton } from '@/components/ui/PawButton';
import { Body, Display, Label, Title } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { PLAY_ROLES, TOY_KINDS, roleOf } from '@/lib/presets';
import { useAppStore, useHousehold } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';
import type { ToyKind } from '@/types/models';

export default function NewToyScreen() {
  const router = useRouter();
  const household = useHousehold();
  const addToy = useAppStore((s) => s.addToy);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<ToyKind>('mouse');
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);

  if (!household) return null;

  const save = () => {
    addToy({ name, kind, groupId, color });
    router.back();
  };

  return (
    <Screen scroll>
      <View style={styles.top}>
        <BackButton />
      </View>
      <Label>New friend</Label>
      <Display>Add a toy</Display>
      <Body style={{ marginTop: 6 }}>A name and a type is enough. “Red mouse” beats a blurry photo.</Body>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Feather wand, spring, crinkle sack…"
        placeholderTextColor={colors.whisker}
        style={styles.input}
      />

      <Label style={{ marginTop: 8 }}>Type</Label>
      <View style={styles.kinds}>
        {TOY_KINDS.map((k) => {
          const on = k.kind === kind;
          return (
            <Pressable
              key={k.kind}
              onPress={() => {
                tap();
                setKind(k.kind);
              }}
              style={[styles.kind, on && styles.kindOn]}>
              <ToyGlyph kind={k.kind} size={26} />
              <Title style={styles.kindLabel}>{k.label}</Title>
              <Body style={styles.hint}>{k.hint}</Body>
            </Pressable>
          );
        })}
      </View>

      <Body style={styles.role}>
        {(() => {
          const r = PLAY_ROLES.find((p) => p.role === roleOf(kind))!;
          return `${r.label} toy: ${r.blurb}`;
        })()}
      </Body>

      <Label>Colour (optional)</Label>
      <View style={{ marginVertical: 12 }}>
        <ColorRow value={color} onChange={setColor} />
      </View>

      <Label>Basket</Label>
      <View style={styles.groups}>
        <Pressable
          onPress={() => {
            tap();
            setGroupId(undefined);
          }}
          style={[styles.group, !groupId && styles.kindOn]}>
          <Body style={styles.gText}>Auto</Body>
        </Pressable>
        {household.groups.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => {
              tap();
              setGroupId(g.id);
            }}
            style={[styles.group, groupId === g.id && styles.kindOn]}>
            <Body style={styles.gText}>{g.name.replace('Basket ', '')}</Body>
          </Pressable>
        ))}
      </View>

      <PawButton label="Put it in the cupboard" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  role: { fontSize: 14, marginBottom: 14 },
  top: { marginBottom: 8 },
  input: {
    marginTop: 16,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  kind: {
    width: '31%',
    backgroundColor: colors.paper,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    minHeight: 108,
  },
  kindOn: { borderColor: colors.terracotta, backgroundColor: '#F8E4DC' },
  kindLabel: { fontSize: 16, marginTop: 6 },
  hint: { fontSize: 12 },
  groups: { flexDirection: 'row', gap: 8, marginVertical: 12 },
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
});
