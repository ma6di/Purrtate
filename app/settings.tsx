import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

import { CatLogo } from '@/components/icons/CatLogo';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { PawButton } from '@/components/ui/PawButton';
import { Body, Display, Label, Title, Whisker } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { LINKS } from '@/lib/links';
import { ENERGY_PRESETS, SWAP_OPTIONS } from '@/lib/presets';
import { intervalDays } from '@/lib/rotation';
import { askNotificationPermission } from '@/lib/reminders';
import { useActiveCat, useAppStore } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';
import type { Energy } from '@/types/models';
import { MAX_NAME, cleanName } from '@/lib/sanitize';

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
  const interval = intervalDays(cat.energy, settings.rotationIntervalDays);

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
        onEndEditing={() => updateCat(cat.id, { name: cleanName(cat.name, 'Kitty') })}
        maxLength={MAX_NAME}
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
              // A new energy level means a new starting suggestion.
              updateSettings({ rotationIntervalDays: null });
            }}
            style={[styles.energy, cat.energy === id && styles.on]}>
            <Body style={styles.eLabel}>{ENERGY_PRESETS[id].label}</Body>
          </Pressable>
        ))}
      </View>

      <Label>Swap baskets every</Label>
      <View style={styles.grid}>
        {SWAP_OPTIONS.map((d) => {
          const on = interval === d;
          const suggested = ENERGY_PRESETS[cat.energy].intervalDays === d;
          return (
            <Pressable
              key={d}
              onPress={() => {
                tap();
                updateSettings({ rotationIntervalDays: suggested ? null : d });
              }}
              style={[styles.energy, on && styles.on]}>
              <Body style={styles.eLabel}>
                {d} days{suggested ? ' ·  suggested' : ''}
              </Body>
            </Pressable>
          );
        })}
      </View>
      <Body style={styles.note}>
        The suggestion is a starting point, not a rule. No study says how many days is right. Watch your cat: if
        they ignore the toys before the swap, pick fewer days. If they still play hard on swap day, pick more.
      </Body>

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
        maxLength={MAX_NAME}
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
          <Title>Swap reminder</Title>
          <Body>A notification at 9:30 on the morning a basket swap is due. Set up on this phone, no server.</Body>
        </View>
        <Switch
          value={settings.remindersOn}
          onValueChange={async (on) => {
            if (!on) return updateSettings({ remindersOn: false });
            const permission = await askNotificationPermission();
            if (permission === 'granted') return updateSettings({ remindersOn: true });
            updateSettings({ remindersOn: false });
            if (permission === 'blocked') {
              Alert.alert(
                'Notifications are off',
                'You said no earlier, so iPhone won’t ask again. Turn on notifications for Purrtate in Settings.',
                [{ text: 'Not now' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }]
              );
            }
          }}
          trackColor={{ true: colors.terracotta, false: colors.creamDeep }}
        />
      </View>

      <Whisker />
      <Title>Why no account?</Title>
      <Body>
        Your baskets and toy names are tiny. They live in this phone’s storage, with no login, photos or server.
      </Body>

      <View style={styles.links}>
        {(
          [
            ['Privacy policy', LINKS.privacy],
            ['Support', LINKS.support],
            ['Terms of use', LINKS.terms],
            ['Impressum', LINKS.impressum],
          ] as const
        ).map(([label, url]) => (
          <Pressable
            key={url}
            accessibilityRole="link"
            onPress={() => {
              tap();
              void Linking.openURL(url);
            }}
            hitSlop={6}>
            <Body style={styles.link}>{label}</Body>
          </Pressable>
        ))}
      </View>
      <Body style={styles.version}>Version {Constants.expoConfig?.version ?? ''}</Body>

      <PawButton
        label="Erase all data"
        variant="ghost"
        paw={false}
        style={{ marginTop: 24 }}
        onPress={() => {
          Alert.alert('Clear everything?', 'Toys, baskets and cats on this phone will be erased.', [
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
  note: { fontSize: 13, marginBottom: 14 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 24 },
  link: { fontFamily: fonts.bodyBold, color: colors.terracottaDeep, fontSize: 14 },
  version: { fontSize: 12, marginTop: 10 },
});
