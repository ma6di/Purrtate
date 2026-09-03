import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors } from '@/theme';
import type { ToyKind } from '@/types/models';

const KIND_COLOR: Record<ToyKind, string> = {
  wand: colors.terracotta,
  feather: colors.sage,
  mouse: colors.clay,
  ball: colors.honey,
  puzzle: '#7D8FBF',
  plush: colors.ear,
  tunnel: colors.inkSoft,
  crinkle: '#C9845A',
  laser: '#C45C6A',
};

export function kindColor(kind: ToyKind) {
  return KIND_COLOR[kind];
}

export function ToyGlyph({ kind, size = 28 }: { kind: ToyKind; size?: number }) {
  const c = KIND_COLOR[kind];
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      {kind === 'wand' && (
        <>
          <Path d="M7 27L18 12" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
          <Path d="M18 12c4-6 10-6 10-2-4 1-6 4-8 8-3-1-4-4-2-6Z" fill={c} />
        </>
      )}
      {kind === 'feather' && (
        <Path
          d="M16 28s-8-8-8-16c0-6 8-8 8-8s8 2 8 8c0 8-8 16-8 16Zm0 0V10"
          stroke={c}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      {kind === 'mouse' && (
        <>
          <Ellipse cx="17" cy="19" rx="9" ry="7" fill={c} />
          <Circle cx="10" cy="12" r="3.4" fill={c} />
          <Circle cx="16" cy="11" r="3.2" fill={c} />
          <Circle cx="22" cy="18" r="1.1" fill={colors.ink} />
          <Path d="M6 22c-3 2-4 6-2 8" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {kind === 'ball' && (
        <>
          <Circle cx="16" cy="16" r="9" stroke={c} strokeWidth="2.2" />
          <Path d="M8 13c5 2 11 2 16 0M9 19c4 1.4 10 1.4 14 0M16 7c2 6 2 12 0 18" stroke={c} strokeWidth="1.7" />
        </>
      )}
      {kind === 'puzzle' && (
        <>
          <Circle cx="16" cy="16" r="9" stroke={c} strokeWidth="2.2" />
          <Circle cx="16" cy="16" r="3.2" fill={c} />
          <Path d="M16 7v4M16 21v4M7 16h4M21 16h4" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {kind === 'plush' && (
        <>
          <Ellipse cx="16" cy="18" rx="9" ry="7.5" fill={c} />
          <Ellipse cx="9" cy="12" rx="3.5" ry="4" fill={c} />
          <Ellipse cx="23" cy="12" rx="3.5" ry="4" fill={c} />
          <Path d="M13 19h6M16 19v3" stroke={colors.ink} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {kind === 'tunnel' && (
        <Path
          d="M6 24V16c0-6 4.4-10 10-10s10 4 10 10v8"
          stroke={c}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
      {kind === 'crinkle' && (
        <Path
          d="M7 20c2-7 5-12 9-12 3 0 4 4 6 4 3 0 4-3 4-3-1 8 0 14-4 16-3 1-8-2-10-1-2 1-5-1-5-4Z"
          fill={c}
        />
      )}
      {kind === 'laser' && (
        <>
          <Circle cx="16" cy="16" r="3.2" fill={c} />
          <Path
            d="M16 6v4M16 22v4M6 16h4M22 16h4M8.5 8.5l2.8 2.8M20.7 20.7l2.8 2.8M8.5 23.5l2.8-2.8M20.7 11.3l2.8-2.8"
            stroke={c}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}
