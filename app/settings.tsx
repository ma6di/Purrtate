import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CatLogo } from '@/components/icons/CatLogo';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { PawButton } from '@/components/ui/PawButton';
import { Body, Display, Label, Title, Whisker } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { ENERGY_PRESETS } from '@/lib/presets';
import { useActiveCat, useAppStore } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';
import type { Energy } from '@/types/models';

export default function SettingsScreen() {
  const router = useRouter();
  const cat = useActiveCat();
  const cats = useAppStore((s) => s.cats);
  const settings = useAppStore((s) => s.settings);
  const updateCat = useAppStore((s) => s.updateCat);
  const addCat = useAppStore((s) => s.addCat);
  const switchCat = useAppStore((s) => s.switchCat);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetAll = useAppStore((s) => s.resetAll);
  const [extraName, setExtraName] = useState('');

  if (!cat) return null;

  return (
    <Screen scroll>
      <View style={styles.top}>
        <BackButton />
      </View>
      <View style={styles.hero}>
        <CatLogo size={80} />
        <Display>Purrtate</Display>
        <Body>Keep toys feeling new.</Body>
      </View>

      <Label>This cat</Label>
      <TextInput
        value={cat.name}
        onChangeText={(name) => updateCat(cat.id, { name })}
        style={styles.input}
      />

      <Label>Energy</Label>
      <View style={styles.grid}>
        {(Object.keys(ENERGY_PRESETS) as Energy[]).map((id) => (
          <Pressable
            key={id}
            onPress={() => {
              tap();
              updateCat(cat.id, { energy: id });
            }}
            style={[styles.energy, cat.energy === id && styles.on]}>
            <Body style={styles.eLabel}>{ENERGY_PRESETS[id].label}</Body>
          </Pressable>
        ))}
      </View>

      {cats.length > 1 && (
        <>
          <Label>Switch cat</Label>
          <View style={styles.grid}>
            {cats.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  tap();
                  switchCat(c.id);
                }}
                style={[styles.energy, c.id === cat.id && styles.on]}>
                <Body style={styles.eLabel}>{c.name}</Body>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Label>Another cat in the house?</Label>
      <TextInput
        value={extraName}
        onChangeText={setExtraName}
        placeholder="Name"
        placeholderTextColor={colors.whisker}
        style={styles.input}
      />
      <PawButton
        label="Add cat"
        variant="ghost"
        onPress={() => {
          if (!extraName.trim()) return;
          addCat(extraName.trim(), 'adult');
          setExtraName('');
        }}
      />

      <Whisker />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Title>Morning nudge</Title>
          <Body>A local reminder on this phone if a basket is due. Nothing leaves the device.</Body>
        </View>
        <Switch
          value={settings.remindersOn}
          onValueChange={(remindersOn) => updateSettings({ remindersOn })}
          trackColor={{ true: colors.terracotta, false: colors.creamDeep }}
        />
      </View>

      <Whisker />
      <Title>Why no account?</Title>
      <Body>
        Play logs are personal and tiny. They live in this phone’s storage so Purrtate works on a walk, with no login, photos, or server.
      </Body>

      <PawButton
        label="Reset den"
        variant="ghost"
        paw={false}
        style={{ marginTop: 24 }}
        onPress={() => {
          Alert.alert('Clear everything?', 'Toys, hunts, and cats on this phone will be erased.', [
            { text: 'Keep' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: () => {
                resetAll();
                router.replace('/onboarding');
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { marginBottom: 4 },
  hero: { alignItems: 'center', gap: 6, marginBottom: 20 },
  input: {
    marginTop: 8,
    marginBottom: 14,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  energy: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  on: { borderColor: colors.terracotta, backgroundColor: '#F8E4DC' },
  eLabel: { fontFamily: fonts.bodyBold, color: colors.ink },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
});
