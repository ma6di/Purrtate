import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Body, Display, Label, Title } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { BASKET_TIPS, PLAY_ROLES } from '@/lib/presets';
import { colors, fonts, radii, shadow } from '@/theme';

const ROLE_COLOR = { chase: colors.terracotta, stalk: colors.honey, grab: colors.sage } as const;

export function LampIcon({ size = 22, color = colors.ink }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** One tip, sized to be the hero of a screen. */
export function TipCard({ index, compact }: { index: number; compact?: boolean }) {
  const tip = BASKET_TIPS[index];
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {!compact ? (
        <View style={styles.badge}>
          <LampIcon size={26} color={colors.terracottaDeep} />
        </View>
      ) : null}
      <Title style={compact ? styles.titleCompact : styles.title}>{tip.title}</Title>
      <Body style={compact ? styles.bodyCompact : styles.body}>{tip.body}</Body>
      {tip.id === 'mix' ? (
        <View style={styles.roles}>
          {PLAY_ROLES.map((r) => (
            <View key={r.role} style={styles.role}>
              <View style={[styles.roleDot, { backgroundColor: ROLE_COLOR[r.role] }]} />
              <View style={{ flex: 1 }}>
                <Body style={styles.roleName}>{r.label}</Body>
                <Body style={styles.roleBlurb}>
                  {r.blurb} e.g. {r.example}
                </Body>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function TipDots({ index }: { index: number }) {
  return (
    <View style={styles.dots}>
      {BASKET_TIPS.map((t, i) => (
        <View key={t.id} style={[styles.dot, i === index && styles.dotOn]} />
      ))}
    </View>
  );
}

/** Lamp button that opens every tip in a sheet. */
export function TipsLamp() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => {
          tap();
          setOpen(true);
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Show tips"
        style={({ pressed }) => [styles.lamp, shadow.card, { opacity: pressed ? 0.75 : 1 }]}>
        <LampIcon size={22} color={colors.terracottaDeep} />
      </Pressable>
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
          <View style={styles.sheetHead}>
            <View style={{ flex: 1 }}>
              <Label>Basket tips</Label>
              <Display style={{ fontSize: 28 }}>Good to know</Display>
            </View>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={10}
              style={styles.done}
              accessibilityRole="button">
              <Body style={styles.doneText}>Done</Body>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.sheetList}>
            {BASKET_TIPS.map((t, i) => (
              <TipCard key={t.id} index={i} compact />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    minHeight: 260,
  },
  cardCompact: { minHeight: 0, padding: 16, borderRadius: radii.lg, gap: 6 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.honeySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 24 },
  titleCompact: { fontSize: 18 },
  body: { fontSize: 17, lineHeight: 25 },
  bodyCompact: { fontSize: 14, lineHeight: 20 },
  roles: { gap: 10, marginTop: 6 },
  role: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  roleDot: { width: 14, height: 14, borderRadius: 7, marginTop: 4 },
  roleName: { fontFamily: fonts.bodyBold, color: colors.ink },
  roleBlurb: { fontSize: 14 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { width: 20, backgroundColor: colors.terracotta },
  lamp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.honeySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: { flex: 1, backgroundColor: colors.cream },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  done: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  doneText: { fontFamily: fonts.bodyBold, color: colors.ink },
  sheetList: { padding: 20, gap: 12, paddingBottom: 40 },
});
