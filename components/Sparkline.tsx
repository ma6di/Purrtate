import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { Body, Label } from '@/components/ui/Type';
import { colors } from '@/theme';

export function Sparkline({
  points,
  label,
}: {
  points: { date: string; ms: number }[];
  label?: string;
}) {
  const w = 320;
  const h = 92;
  const max = Math.max(15 * 60_000, ...points.map((p) => p.ms), 1);
  const coords = points.map((p, i) => {
    const x = points.length === 1 ? w / 2 : (i / (points.length - 1)) * (w - 16) + 8;
    const y = h - 12 - (p.ms / max) * (h - 24);
    return `${x},${y}`;
  });
  return (
    <View style={styles.card}>
      {label ? <Label style={styles.label}>{label}</Label> : null}
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <Polyline
          points={coords.join(' ')}
          fill="none"
          stroke={colors.terracotta}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => {
          const x = points.length === 1 ? w / 2 : (i / (points.length - 1)) * (w - 16) + 8;
          const y = h - 12 - (p.ms / max) * (h - 24);
          const last = i === points.length - 1;
          return (
            <Circle
              key={p.date}
              cx={x}
              cy={y}
              r={last ? 5 : 3}
              fill={last ? colors.terracotta : colors.honey}
            />
          );
        })}
      </Svg>
      <View style={styles.row}>
        <Body style={styles.cap}>{points[0]?.date.slice(5)}</Body>
        <Body style={styles.cap}>today</Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: { marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cap: { fontSize: 12 },
});
