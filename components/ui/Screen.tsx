import { ReactNode } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export function Screen({
  children,
  scroll,
  style,
  padded = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  padded?: boolean;
}) {
  const inner = (
    <View style={[styles.body, padded && styles.pad, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={styles.webRoot}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  body: {
    flex: 1,
  },
  pad: {
    paddingHorizontal: 20,
  },
  scroll: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  webRoot: {
    flex: 1,
    backgroundColor: '#1F1812',
    alignItems: 'center',
  },
  phone: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    backgroundColor: colors.cream,
    overflow: 'hidden',
  },
});
