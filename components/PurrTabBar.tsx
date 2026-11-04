import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BasketGlyph, ToyMouseGlyph } from '@/components/icons/TabIcons';
import { tap } from '@/lib/haptics';
import { anyBasketIssues, newToyNudge, toySuggestions } from '@/lib/toyAdvice';
import { useHousehold } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

type TabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

const TABS: Record<string, { label: string; Icon: typeof BasketGlyph }> = {
  index: { label: 'Today', Icon: BasketGlyph },
  toys: { label: 'Toys', Icon: ToyMouseGlyph },
};

export function PurrTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const household = useHousehold();
  const toysNeedAttention =
    !!household &&
    (anyBasketIssues(household) || newToyNudge(household).due || toySuggestions(household).length > 0);
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const color = focused ? colors.terracotta : colors.whisker;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            tap();
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              style={[styles.item, focused && styles.itemOn]}>
              <View>
                <tab.Icon color={color} />
                {route.name === 'toys' && toysNeedAttention ? <View style={styles.badge} /> : null}
              </View>
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.cream,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.paper,
    borderRadius: 28,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 22,
  },
  itemOn: { backgroundColor: '#F8E4DC' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.paper,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 13,
    letterSpacing: 0.4,
  },
});
