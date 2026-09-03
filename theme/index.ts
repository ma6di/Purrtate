export const colors = {
  cream: '#F3E6D4',
  creamDeep: '#EAD9C2',
  paper: '#FFF8F0',
  ink: '#2A2118',
  inkSoft: '#5C4E42',
  whisker: '#A89886',
  line: '#E4D3C0',
  terracotta: '#D4654A',
  terracottaDeep: '#B84E38',
  ear: '#E8A090',
  honey: '#D4A054',
  honeySoft: '#F0D7A8',
  sage: '#6B8F71',
  sageSoft: '#D7E4D4',
  clay: '#C17B5A',
  white: '#FFFBFC',
  danger: '#B54A3A',
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
} as const;

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fonts = {
  display: 'Fraunces_700Bold',
  displaySoft: 'Fraunces_600SemiBold',
  body: 'Nunito_500Medium',
  bodyBold: 'Nunito_700Bold',
  label: 'Nunito_800ExtraBold',
} as const;

export const shadow = {
  card: {
    shadowColor: '#2A2118',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  paw: {
    shadowColor: '#B84E38',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;
