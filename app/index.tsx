import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CatLogo } from '@/components/icons/CatLogo';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

export default function Gate() {
  const hydrated = useAppStore((s) => s._hasHydrated);
  const onboarded = useAppStore((s) => s.settings.onboardingComplete);

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <CatLogo size={96} />
        <ActivityIndicator color={colors.terracotta} style={{ marginTop: 18 }} />
      </View>
    );
  }

  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
