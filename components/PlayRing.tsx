import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Body, Display, Label } from '@/components/ui/Type';
import { formatMinutes } from '@/lib/dates';
import { colors } from '@/theme';

export function PlayRing({
  progress,
  currentMs,
  targetMs,
  sessions,
  targetSessions,
}: {
  progress: number;
  currentMs: number;
  targetMs: number;
  sessions: number;
  targetSessions: number;
}) {
  const size = 148;
  const r = 58;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle cx={74} cy={74} r={r} stroke={colors.creamDeep} strokeWidth={12} fill="none" />
        <Circle
          cx={74}
          cy={74}
          r={r}
          stroke={colors.terracotta}
          strokeWidth={12}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
          strokeLinecap="round"
          transform="rotate(-90 74 74)"
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Display style={styles.num}>{Math.round(currentMs / 60_000)}</Display>
        <Label>of {formatMinutes(targetMs)}</Label>
      </View>
      <Body style={styles.sub}>
        {sessions}/{targetSessions} hunts today
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    top: 42,
    alignItems: 'center',
    width: 148,
  },
  num: { fontSize: 36, lineHeight: 40 },
  sub: { marginTop: 4 },
});
