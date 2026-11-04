import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ToyGlyph } from '@/components/icons/ToyGlyph';
import { Body } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { TOY_COLORS, TOY_KINDS } from '@/lib/presets';
import { colors, fonts, radii } from '@/theme';
import type { ToyKind } from '@/types/models';

export function KindRow({ value, onChange }: { value: ToyKind; onChange: (k: ToyKind) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.kindRow}
      keyboardShouldPersistTaps="handled">
      {TOY_KINDS.map((k) => {
        const on = k.kind === value;
        return (
          <Pressable
            key={k.kind}
            onPress={() => {
              tap();
              onChange(k.kind);
            }}
            style={[styles.kind, on && styles.kindOn]}>
            <ToyGlyph kind={k.kind} size={22} />
            <Body style={[styles.kindText, on && { color: colors.terracottaDeep }]}>{k.label}</Body>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function ColorRow({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (hex: string | undefined) => void;
}) {
  return (
    <View style={styles.colorRow}>
      <Pressable
        accessibilityLabel="No colour"
        onPress={() => {
          tap();
          onChange(undefined);
        }}
        style={[styles.swatch, styles.none, !value && styles.swatchOn]}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Path d="M2 12L12 2" stroke={colors.whisker} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      </Pressable>
      {TOY_COLORS.map((c) => (
        <Pressable
          key={c.id}
          accessibilityLabel={c.label}
          onPress={() => {
            tap();
            onChange(c.hex);
          }}
          style={[styles.swatch, { backgroundColor: c.hex }, value === c.hex && styles.swatchOn]}
        />
      ))}
    </View>
  );
}

export function ColorDot({ hex, size = 12 }: { hex?: string; size?: number }) {
  if (!hex) return null;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hex,
        borderWidth: 1,
        borderColor: 'rgba(42,33,24,0.15)',
      }}
    />
  );
}

const styles = StyleSheet.create({
  kindRow: { gap: 8, paddingVertical: 2 },
  kind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  kindOn: { borderColor: colors.terracotta, backgroundColor: '#F8E4DC' },
  kindText: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(42,33,24,0.15)',
  },
  none: { backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  swatchOn: { borderWidth: 3, borderColor: colors.ink },
});
