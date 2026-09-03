import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { PawMark } from '@/components/icons/CatLogo';
import { tap } from '@/lib/haptics';
import { colors, fonts, radii, shadow } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'fill' | 'ghost' | 'honey';
  paw?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PawButton({ label, onPress, variant = 'fill', paw = true, disabled, style }: Props) {
  const bg =
    variant === 'fill' ? colors.terracotta : variant === 'honey' ? colors.honey : colors.paper;
  const fg = variant === 'ghost' ? colors.ink : colors.white;
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        shadow.card,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.86 : 1 },
        variant === 'ghost' && styles.ghost,
        style,
      ]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
      {paw ? <PawMark size={18} color={fg} /> : null}
    </Pressable>
  );
}

export function IconButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.icon, { opacity: pressed ? 0.7 : 1 }]}>
      {children}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        if (!onPress) return;
        tap();
        onPress();
      }}
      style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 54,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ghost: {
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    color: colors.inkSoft,
    fontSize: 13,
  },
  chipTextOn: {
    color: colors.white,
  },
});
