import { createContext, ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';

type ScrollCtx = {
  /** Scroll so `target` sits near the top of the screen, above the keyboard. */
  scrollIntoView: (target: View | null, gap?: number) => void;
};

const ScreenScroll = createContext<ScrollCtx>({ scrollIntoView: () => {} });

export function useScreenScroll() {
  return useContext(ScreenScroll);
}

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
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);

  const scrollIntoView = useCallback((target: View | null, gap = 12) => {
    const content = contentRef.current;
    if (!target || !content) return;
    const run = () =>
      target.measureLayout(
        content,
        (_x, y) =>
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - gap),
            animated: true,
          }),
        () => {},
      );
    // Run now, and again once the keyboard has finished moving so insets are final.
    requestAnimationFrame(run);
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      run();
      sub.remove();
    });
    setTimeout(() => sub.remove(), 1500);
  }, []);

  const ctx = useMemo(() => ({ scrollIntoView }), [scrollIntoView]);

  const inner = (
    <View ref={contentRef} collapsable={false} style={[styles.body, padded && styles.pad, style]}>
      {children}
    </View>
  );
  return (
    <ScreenScroll.Provider value={ctx}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode="interactive"
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
      </SafeAreaView>
    </ScreenScroll.Provider>
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
