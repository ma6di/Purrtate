import { Image } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors } from '@/theme';

type Props = { size?: number };

export function CatLogo({ size = 88 }: Props) {
  return (
    <Image
      source={require('@/assets/images/icon.png')}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
      accessibilityLabel="Purrtate"
    />
  );
}

export function PawMark({ size = 28, color = colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Ellipse cx="16" cy="21" rx="7.5" ry="6.2" fill={color} />
      <Circle cx="8" cy="12.5" r="3.1" fill={color} />
      <Circle cx="13.2" cy="8.8" r="3.2" fill={color} />
      <Circle cx="19.2" cy="8.8" r="3.2" fill={color} />
      <Circle cx="24.2" cy="12.5" r="3.1" fill={color} />
    </Svg>
  );
}

export function YarnMark({ size = 22, color = colors.honey }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" />
      <Path d="M5 10c5 1 9 1 14 0M6 14c4 .8 8 .8 12 0" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Path d="M12 4c2 5 2 11 0 16" stroke={color} strokeWidth="1.6" fill="none" />
    </Svg>
  );
}
