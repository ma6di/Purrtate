import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CatLogo } from '@/components/icons/CatLogo';
import { Screen } from '@/components/ui/Screen';
import { PawButton } from '@/components/ui/PawButton';
import { Body, Display, Label, Title, Whisker } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { ENERGY_PRESETS } from '@/lib/presets';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';
import type { Energy } from '@/types/models';

const ENERGIES = (Object.keys(ENERGY_PRESETS) as Energy[]).map((id) => ({
  id,
  ...ENERGY_PRESETS[id],
}));

export default function Onboarding() {
  const router = useRouter();
  const complete = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [energy, setEnergy] = useState<Energy>('adult');
  const [seed, setSeed] = useState(true);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const finish = () => {
    complete({ name, energy, seedToys: seed });
    router.replace('/(tabs)');
  };

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <CatLogo size={step === 0 ? 108 : 72} />
        <Label>Purrtate</Label>
      </View>

      {step === 0 && (
        <View style={styles.block}>
          <Display>Toys that feel new again.</Display>
          <Body style={styles.lead}>
            Cats habituate fast. Purrtate keeps a small basket out, rests the rest, and nudges you when play goes quiet — all on this phone, no account.
          </Body>
          <PawButton label="Meet my cat" onPress={next} />
        </View>
      )}

      {step === 1 && (
        <View style={styles.block}>
          <Title>What’s their name?</Title>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Mochi, Bean, Pip…"
            placeholderTextColor={colors.whisker}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={next}
          />
          <PawButton label="That’s the one" onPress={next} />
        </View>
      )}

      {step === 2 && (
        <View style={styles.block}>
          <Title>How wild is the hunt?</Title>
          <Body>This sets how often baskets swap. You can change it later.</Body>
          <View style={styles.grid}>
            {ENERGIES.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => {
                  tap();
                  setEnergy(e.id);
                }}
                style={[styles.energy, energy === e.id && styles.energyOn]}>
                <Label style={energy === e.id ? styles.onLabel : undefined}>{e.label}</Label>
                <Body style={styles.energyBlurb}>{e.blurb}</Body>
              </Pressable>
            ))}
          </View>
          <PawButton label="Continue" onPress={next} />
        </View>
      )}

      {step === 3 && (
        <View style={styles.block}>
          <Title>Start with a basket?</Title>
          <Body>
            Six classic toys, split into A / B / C. Rename them to match the real ones on the floor — no photos needed.
          </Body>
          <Whisker />
          <Pressable
            onPress={() => {
              tap();
              setSeed(true);
            }}
            style={[styles.choice, seed && styles.choiceOn]}>
            <Label>Starter basket</Label>
            <Body>Wand, mouse, yarn, puzzle, kick fish, tunnel</Body>
          </Pressable>
          <Pressable
            onPress={() => {
              tap();
              setSeed(false);
            }}
            style={[styles.choice, !seed && styles.choiceOn]}>
            <Label>Empty den</Label>
            <Body>I’ll add our own toys by name</Body>
          </Pressable>
          <PawButton label="Open the den" onPress={finish} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 12, marginBottom: 18, gap: 8 },
  block: { gap: 16, paddingBottom: 24 },
  lead: { fontSize: 17, lineHeight: 24 },
  input: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  grid: { gap: 10 },
  energy: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    gap: 4,
  },
  energyOn: {
    borderColor: colors.terracotta,
    backgroundColor: '#F8E4DC',
  },
  onLabel: { color: colors.terracotta },
  energyBlurb: { fontSize: 14 },
  choice: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    gap: 4,
  },
  choiceOn: {
    borderColor: colors.honey,
    backgroundColor: colors.honeySoft,
  },
});
