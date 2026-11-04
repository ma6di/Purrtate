import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ToyCard } from '@/components/ToyCard';
import { Screen } from '@/components/ui/Screen';
import { Chip, PawButton } from '@/components/ui/PawButton';
import { Body, Display, Label, Title } from '@/components/ui/Type';
import { toySuggestions, type ToySuggestion } from '@/lib/toyAdvice';
import { useHousehold } from '@/store/useAppStore';
import { colors, radii } from '@/theme';
import type { ToyStatus } from '@/types/models';

type Filter = 'all' | ToyStatus;

const IDEA_LABEL: Record<ToySuggestion['kind'], string> = {
  add: 'Add toys',
  buy: 'Shopping idea',
  refresh: 'Novelty',
  safety: 'Play tip',
};

export default function ToysScreen() {
  const router = useRouter();
  const household = useHousehold();
  const [filter, setFilter] = useState<Filter>('all');

  const list = useMemo(() => {
    if (!household) return [];
    const toys = [...household.toys].sort((a, b) => a.name.localeCompare(b.name));
    if (filter === 'all') return toys;
    return toys.filter((t) => t.status === filter);
  }, [household, filter]);

  if (!household) return null;
  const ideas = toySuggestions(household).slice(0, 3);

  return (
    <Screen scroll>
      <Label>The cupboard</Label>
      <Display>Toys</Display>
      <Body style={{ marginTop: 6 }}>
        Names and types only — faster than photos, and every mouse looks like a mouse.
      </Body>

      {ideas.length ? (
        <View style={styles.ideas}>
          {ideas.map((idea) => (
            <View
              key={idea.id}
              style={[
                styles.idea,
                idea.kind === 'buy' && styles.ideaBuy,
                idea.kind === 'safety' && styles.ideaSafety,
              ]}>
              <Label>{IDEA_LABEL[idea.kind]}</Label>
              <Title style={{ marginTop: 2 }}>{idea.title}</Title>
              <Body style={{ marginTop: 4, fontSize: 14 }}>{idea.body}</Body>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.filters}>
        {(['all', 'active', 'resting', 'retired'] as Filter[]).map((f) => (
          <Chip
            key={f}
            label={f === 'active' ? 'Out' : f[0].toUpperCase() + f.slice(1)}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      <View style={styles.list}>
        {list.map((toy) => (
          <ToyCard key={toy.id} toy={toy} energy={household.cat.energy} />
        ))}
        {!list.length && (
          <View style={styles.empty}>
            <Body>Nothing in this basket yet.</Body>
          </View>
        )}
      </View>

      <PawButton label="Add a toy" onPress={() => router.push('/toy/new')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  ideas: { gap: 10, marginTop: 16 },
  idea: {
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ideaBuy: { backgroundColor: colors.honeySoft, borderColor: colors.honeySoft },
  ideaSafety: { backgroundColor: colors.sageSoft, borderColor: colors.sageSoft },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  list: { gap: 10, marginBottom: 18 },
  empty: {
    padding: 24,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
