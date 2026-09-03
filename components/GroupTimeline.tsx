import { StyleSheet, View } from 'react-native';

import { Body, Label } from '@/components/ui/Type';
import { colors, radii } from '@/theme';
import type { Group } from '@/types/models';

const PALETTE = [colors.terracotta, colors.honey, colors.sage];

export function GroupTimeline({
  groups,
  activeId,
}: {
  groups: Group[];
  activeId?: string;
}) {
  return (
    <View style={styles.card}>
      <Label>Rotation timeline</Label>
      {groups.map((g, i) => {
        const on = g.id === activeId;
        return (
          <View key={g.id} style={styles.row}>
            <Body style={styles.name}>{g.name.replace('Basket ', '')}</Body>
            <View style={styles.track}>
              {[0, 1, 2, 3].map((week) => {
                const lit = on ? week === 0 : week === ((i + 3) % 3) + 1;
                return (
                  <View
                    key={week}
                    style={[
                      styles.bar,
                      { backgroundColor: lit ? PALETTE[i % PALETTE.length] : colors.creamDeep },
                      lit && { opacity: 1 },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
      <View style={styles.caps}>
        <Body style={styles.cap}>This week</Body>
        <Body style={styles.cap}>+3</Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { width: 22, fontSize: 15, color: colors.ink },
  track: { flex: 1, flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 14, borderRadius: 8 },
  caps: { flexDirection: 'row', justifyContent: 'space-between' },
  cap: { fontSize: 12 },
});
