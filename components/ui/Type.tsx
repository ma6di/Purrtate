import { ReactNode } from 'react';
import { StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';

import { colors, fonts } from '@/theme';

export function Display({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.display, style]}>
      {children}
    </Text>
  );
}

export function Title({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.title, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.body, style]}>
      {children}
    </Text>
  );
}

export function Label({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.label, style]}>
      {children}
    </Text>
  );
}

export function Whisker({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.whiskerRow, style]}>
      <View style={styles.whisker} />
      <View style={styles.dot} />
      <View style={styles.whisker} />
    </View>
  );
}

export function EarCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.ears}>
        <View style={[styles.ear, styles.earL]} />
        <View style={[styles.ear, styles.earR]} />
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 32,
    lineHeight: 36,
  },
  title: {
    fontFamily: fonts.displaySoft,
    color: colors.ink,
    fontSize: 22,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 16,
    lineHeight: 22,
  },
  label: {
    fontFamily: fonts.label,
    color: colors.whisker,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  whiskerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  whisker: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ear,
  },
  wrap: {
    marginTop: 14,
  },
  ears: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    zIndex: 2,
  },
  ear: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.paper,
  },
  earL: { transform: [{ rotate: '-12deg' }] },
  earR: { transform: [{ rotate: '12deg' }] },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: -6,
  },
});
