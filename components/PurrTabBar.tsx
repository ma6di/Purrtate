import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PawMark } from '@/components/icons/CatLogo';
import { BasketGlyph, ChartGlyph, HomeGlyph } from '@/components/icons/TabIcons';
import { paw, tap } from '@/lib/haptics';
import { colors, fonts, shadow } from '@/theme';

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

const ICONS = {
  index: HomeGlyph,
  toys: BasketGlyph,
  play: null,
  insights: ChartGlyph,
};

export function PurrTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const color = focused ? colors.terracotta : colors.whisker;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (route.name === 'play') paw();
            else tap();
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          if (route.name === 'play') {
            return (
              <Pressable key={route.key} onPress={onPress} style={styles.pawWrap}>
                <View style={[styles.paw, shadow.paw, focused && styles.pawOn]}>
                  <PawMark size={28} color={colors.white} />
                </View>
              </Pressable>
            );
          }
          const Icon = ICONS[route.name as keyof typeof ICONS];
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item}>
              {Icon ? <Icon color={color} /> : null}
              <Text style={[styles.label, { color }]}>
                {route.name === 'index' ? 'Today' : route.name === 'toys' ? 'Toys' : 'Den'}
              </Text>
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingBottom: 4,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pawWrap: {
    width: 74,
    alignItems: 'center',
    marginTop: -28,
  },
  paw: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawOn: {
    backgroundColor: colors.terracottaDeep,
  },
});
