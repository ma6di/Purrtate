import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BasketBuilder, emptyBaskets } from '@/components/BasketBuilder';
import { TipCard, TipDots, TipsLamp } from '@/components/Tips';
import { CatLogo } from '@/components/icons/CatLogo';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { PawButton } from '@/components/ui/PawButton';
import { Body, Display, Label, Title } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { BASKET_TIPS, ENERGY_PRESETS, type DraftBasket } from '@/lib/presets';
import { askNotificationPermission } from '@/lib/reminders';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts, radii } from '@/theme';
import type { Energy } from '@/types/models';
import { MAX_NAME } from '@/lib/sanitize';

const TIPS_STEP = 3;
const BUILD_STEP = 4;
const LAST_STEP = BUILD_STEP;

const ENERGIES = (Object.keys(ENERGY_PRESETS) as Energy[]).map((id) => ({
  id,
  ...ENERGY_PRESETS[id],
}));

export default function Onboarding() {
  const router = useRouter();
  const complete = useAppStore((s) => s.completeOnboarding);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [step, setStep] = useState(0);
  const [tip, setTip] = useState(0);
  const [name, setName] = useState('');
  const [energy, setEnergy] = useState<Energy>('adult');
  const [baskets, setBaskets] = useState<DraftBasket[]>(emptyBaskets);
  const total = baskets.reduce((n, b) => n + b.toys.length, 0);
  const filled = baskets.filter((b) => b.toys.length).length;

  const next = () => setStep((s) => Math.min(LAST_STEP, s + 1));
  const back = () => {
    if (step === TIPS_STEP && tip > 0) return setTip((t) => t - 1);
    setStep((s) => Math.max(0, s - 1));
  };
  const nextTip = () => {
    if (tip < BASKET_TIPS.length - 1) setTip((t) => t + 1);
    else next();
  };
  const [finishing, setFinishing] = useState(false);
  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    // Native iOS prompt, asked here because a swap reminder makes sense right now.
    const permission = await askNotificationPermission();
    complete({ name, energy, baskets });
    updateSettings({ remindersOn: permission === 'granted' });
    router.replace('/(tabs)');
  };

  return (
    <Screen scroll>
      <View style={styles.top}>
        {step > 0 ? <BackButton onPress={back} /> : null}
        <Body style={styles.stepCount}>
          {step + 1} / {LAST_STEP + 1}
        </Body>
      </View>
      <View style={styles.hero}>
        <CatLogo size={step === 0 ? 108 : step >= TIPS_STEP ? 56 : 72} />
        <Label>Purrtate</Label>
      </View>

      {step === 0 && (
        <View style={styles.block}>
          <Display>Toys that feel new again.</Display>
          <Body style={styles.lead}>
            Cats get bored of the same toys fast. Purrtate keeps one basket out, rests the other two, and tells you when it’s time to swap. Everything stays on this phone, no account.
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
            maxLength={MAX_NAME}
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
          <Body>This picks a starting swap interval. It’s a suggestion, not a rule, and you can change it any time in Settings.</Body>
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

      {step === TIPS_STEP && (
        <View style={styles.block}>
          <Label>
            Before you build · tip {tip + 1} of {BASKET_TIPS.length}
          </Label>
          <TipCard index={tip} />
          <TipDots index={tip} />
          <PawButton
            label={tip < BASKET_TIPS.length - 1 ? 'Next tip' : 'Build my baskets'}
            onPress={nextTip}
          />
          {tip < BASKET_TIPS.length - 1 ? (
            <Pressable onPress={next} hitSlop={8} style={styles.skip}>
              <Body style={styles.skipText}>Skip tips</Body>
            </Pressable>
          ) : null}
        </View>
      )}

      {step === BUILD_STEP && (
        <View style={styles.block}>
          <View style={styles.buildHead}>
            <Title style={{ flex: 1 }}>Build {name.trim() || 'their'}{name.trim() ? '’s' : ''} three baskets</Title>
            <TipsLamp />
          </View>
          <Body>
            Split the toys you already own into three groups. Only one basket is out at a time. Name each toy so you can find it, and add a colour if two look alike.
          </Body>
          <BasketBuilder value={baskets} onChange={setBaskets} />
          <Body style={styles.foot}>
            {total === 0
              ? 'No toys yet? That’s fine. Add them later and we’ll suggest what’s worth buying.'
              : `${total} toy${total === 1 ? '' : 's'} across ${filled} basket${filled === 1 ? '' : 's'}. You can change all of this later.`}
          </Body>
          <Body style={styles.foot}>
            Next, iPhone will ask if Purrtate can send notifications. We only send one when it’s time to swap
            baskets, nothing else.
          </Body>
          <PawButton
            disabled={finishing}
            label={total ? `Put ${baskets[0].name.trim() || 'Basket A'} out` : 'Finish setup'}
            onPress={finish}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    marginTop: 8,
  },
  stepCount: { marginLeft: 'auto', fontFamily: fonts.bodyBold, fontSize: 13 },
  hero: { alignItems: 'center', marginTop: 4, marginBottom: 18, gap: 8 },
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
  buildHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skip: { alignSelf: 'center', paddingVertical: 4 },
  skipText: { fontFamily: fonts.bodyBold, color: colors.inkSoft },
  foot: { fontSize: 14, textAlign: 'center' },
});
