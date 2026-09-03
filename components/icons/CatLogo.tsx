import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors } from '@/theme';

type Props = { size?: number };

export function CatLogo({ size = 88 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <Circle cx="44" cy="44" r="44" fill={colors.creamDeep} />
      <Path
        d="M22 38c0-14 8-26 14-26 3 8 4 16 4 24H22Z"
        fill={colors.terracotta}
      />
      <Path d="M26 24c2 4 3 8 3 12h-7c0-5 2-9 4-12Z" fill={colors.ear} />
      <Path
        d="M66 38c0-14-8-26-14-26-3 8-4 16-4 24h18Z"
        fill={colors.terracotta}
      />
      <Path d="M62 24c-2 4-3 8-3 12h7c0-5-2-9-4-12Z" fill={colors.ear} />
      <Ellipse cx="44" cy="50" rx="22" ry="20" fill={colors.terracotta} />
      <Ellipse cx="36" cy="48" rx="3.2" ry="5" fill={colors.ink} />
      <Ellipse cx="52" cy="48" rx="3.2" ry="5" fill={colors.ink} />
      <Ellipse cx="37.2" cy="46.6" rx="1.1" ry="1.4" fill={colors.white} />
      <Ellipse cx="53.2" cy="46.6" rx="1.1" ry="1.4" fill={colors.white} />
      <Path d="M44 54l-3 3h6l-3-3Z" fill={colors.ink} />
      <Path d="M24 52h12M24 56h11M64 52H52M64 56H53" stroke={colors.cream} strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="62" cy="66" r="8" fill={colors.honey} />
      <Path
        d="M62 60c3 2 5 4 5 7s-2 5-5 5-5-2-5-5 3-6 5-7Z"
        stroke={colors.ink}
        strokeWidth="1.2"
        fill="none"
      />
      <Path d="M54 62c-6-8-4-18 4-22" stroke={colors.honey} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Svg>
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
