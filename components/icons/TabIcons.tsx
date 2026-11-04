import Svg, { Circle, Path } from 'react-native-svg';

type GlyphProps = { color: string; size?: number };

/** Today: the basket that's out on the rug. */
export function BasketGlyph({ color, size = 26 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M4.5 12h19l-1.8 10.3A2 2 0 0 1 19.7 24H8.3a2 2 0 0 1-2-1.7L4.5 12Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M9 12V9.5a5 5 0 0 1 10 0V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M10 16v4M14 16v4M18 16v4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

/** Toys: a toy mouse with a curly tail. */
export function ToyMouseGlyph({ color, size = 26 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        d="M4 19.5c0-4.7 3.9-8.5 8.8-8.5 3.4 0 6.4 1.9 7.9 4.7l2.3.9c.7.3.7 1.2 0 1.5l-2 .8c-.6 2.4-2.9 4.1-5.6 4.1H6a2 2 0 0 1-2-2v-1.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="14.5" cy="10.5" r="2.6" stroke={color} strokeWidth="1.8" />
      <Circle cx="18.2" cy="16.2" r="1.1" fill={color} />
      <Path d="M4.2 20.5C2 20.5 1.5 17.5 3.5 16.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
