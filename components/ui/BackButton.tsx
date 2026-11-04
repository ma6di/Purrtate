import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { tap } from '@/lib/haptics';
import { colors, fonts, radii } from '@/theme';

type Props = {
  /** Defaults to router.back(), or the home tab if there is no history. */
  onPress?: () => void;
  label?: string;
  style?: ViewStyle;
};

export function BackButton({ onPress, label = 'Back', style }: Props) {
  const router = useRouter();
  const handle = () => {
    tap();
    if (onPress) return onPress();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <Pressable
      onPress={handle}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }, style]}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 5l-7 7 7 7"
          stroke={colors.ink}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
});
