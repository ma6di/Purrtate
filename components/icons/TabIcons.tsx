import Svg, { Circle, Path } from 'react-native-svg';

export function HomeGlyph({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M5 13.5 14 6l9 7.5V23a1.5 1.5 0 0 1-1.5 1.5h-5V18h-6v6.5h-5A1.5 1.5 0 0 1 5 23V13.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M11 4.5c.4-2 2.2-3 3.2-1.2.8-1.4 2.6-.6 2.8 1" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function BasketGlyph({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M5 12h18l-1.6 10.2A2 2 0 0 1 19.4 24H8.6a2 2 0 0 1-2-1.8L5 12Z" stroke={color} strokeWidth="2" />
      <Path d="M9 12V9.5A5 5 0 0 1 14 5a5 5 0 0 1 5 4.5V12" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export function ChartGlyph({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M5 22V8M5 22h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M9 16l4-5 4 3 5-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="22" cy="7" r="1.6" fill={color} />
    </Svg>
  );
}
