import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ColorDot, ColorRow, KindRow } from '@/components/ToyPickers';
import { ToyGlyph } from '@/components/icons/ToyGlyph';
import { useScreenScroll } from '@/components/ui/Screen';
import { Body, Label } from '@/components/ui/Type';
import { tap } from '@/lib/haptics';
import { uid } from '@/lib/ids';
import { PLAY_ROLES, STARTER_BASKETS, roleOf, type DraftBasket, type DraftToy } from '@/lib/presets';
import { basketMix, mixHint } from '@/lib/toyAdvice';
import { colors, fonts, radii } from '@/theme';
import type { ToyKind } from '@/types/models';
import { MAX_NAME } from '@/lib/sanitize';

export function emptyBaskets(): DraftBasket[] {
  return ['Basket A', 'Basket B', 'Basket C'].map((name) => ({ key: uid('b'), name, toys: [] }));
}

export function starterBaskets(): DraftBasket[] {
  return STARTER_BASKETS.map((b) => ({
    key: uid('b'),
    name: b.name,
    toys: b.toys.map((t) => ({ key: uid('t'), ...t })),
  }));
}

type Editing = { basket: string; toy: string | null } | null;

export function BasketBuilder({
  value,
  onChange,
}: {
  value: DraftBasket[];
  onChange: (next: DraftBasket[]) => void;
}) {
  const [editing, setEditing] = useState<Editing>(null);
  const total = value.reduce((n, b) => n + b.toys.length, 0);

  const patchBasket = (key: string, fn: (b: DraftBasket) => DraftBasket) =>
    onChange(value.map((b) => (b.key === key ? fn(b) : b)));

  return (
    <View style={styles.wrap}>
      <View style={styles.roles}>
        {PLAY_ROLES.map((r) => (
          <View key={r.role} style={styles.roleKey}>
            <RoleDot role={r.role} on />
            <View style={{ flex: 1 }}>
              <Body style={styles.roleName}>{r.label}</Body>
              <Body style={styles.roleBlurb}>{r.blurb}</Body>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            tap();
            setEditing(null);
            onChange(starterBaskets());
          }}
          style={styles.action}>
          <Body style={styles.actionText}>{total ? 'Replace with a starter mix' : 'Fill with a starter mix'}</Body>
        </Pressable>
        {total ? (
          <Pressable
            onPress={() => {
              tap();
              setEditing(null);
              onChange(emptyBaskets());
            }}
            style={styles.action}>
            <Body style={styles.actionText}>Clear</Body>
          </Pressable>
        ) : null}
      </View>

      {value.map((basket, i) => {
        const mix = basketMix(basket.toys.map((t) => t.kind));
        const hint = mixHint(basket.name || `Basket ${i + 1}`, mix, basket.toys.length);
        const isEditingHere = editing?.basket === basket.key;
        return (
          <View key={basket.key} style={[styles.basket, i === 0 && styles.basketFirst]}>
            <View style={styles.basketHead}>
              <TextInput
                value={basket.name}
                onChangeText={(name) => patchBasket(basket.key, (b) => ({ ...b, name }))}
                style={styles.basketName}
                maxLength={24}
                accessibilityLabel="Basket name"
              />
              <View style={styles.dots}>
                {PLAY_ROLES.map((r) => (
                  <RoleDot key={r.role} role={r.role} on={mix.have.includes(r.role)} />
                ))}
              </View>
            </View>
            <Label style={styles.basketSub}>{i === 0 ? 'Out first' : 'Resting until its turn'}</Label>

            {basket.toys.map((toy) =>
              isEditingHere && editing?.toy === toy.key ? (
                <ToyForm
                  key={toy.key}
                  initial={toy}
                  onCancel={() => setEditing(null)}
                  onRemove={() => {
                    patchBasket(basket.key, (b) => ({ ...b, toys: b.toys.filter((t) => t.key !== toy.key) }));
                    setEditing(null);
                  }}
                  onSave={(next) => {
                    patchBasket(basket.key, (b) => ({
                      ...b,
                      toys: b.toys.map((t) => (t.key === toy.key ? { ...next, key: toy.key } : t)),
                    }));
                    setEditing(null);
                  }}
                />
              ) : (
                <Pressable
                  key={toy.key}
                  onPress={() => {
                    tap();
                    setEditing({ basket: basket.key, toy: toy.key });
                  }}
                  style={styles.toy}>
                  <ToyGlyph kind={toy.kind} size={22} />
                  <Body style={styles.toyName} numberOfLines={1}>
                    {toy.name}
                  </Body>
                  <ColorDot hex={toy.color} />
                  <Body style={styles.toyRole}>
                    {PLAY_ROLES.find((r) => r.role === roleOf(toy.kind))!.label}
                  </Body>
                </Pressable>
              )
            )}

            {isEditingHere && editing?.toy === null ? (
              <ToyForm
                initial={{ name: '', kind: suggestKind(mix.missing[0]) }}
                onCancel={() => setEditing(null)}
                onSave={(next) => {
                  patchBasket(basket.key, (b) => ({ ...b, toys: [...b.toys, { ...next, key: uid('t') }] }));
                  setEditing(null);
                }}
              />
            ) : (
              <Pressable
                onPress={() => {
                  tap();
                  setEditing({ basket: basket.key, toy: null });
                }}
                style={styles.add}>
                <Body style={styles.addText}>+ Add a toy</Body>
              </Pressable>
            )}

            {hint ? (
              <Body style={[styles.hint, mix.missing.length === 0 && { color: colors.sage }]}>{hint}</Body>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function suggestKind(role: string | undefined): ToyKind {
  if (role === 'chase') return 'wand';
  if (role === 'grab') return 'plush';
  return 'mouse';
}

function ToyForm({
  initial,
  onSave,
  onCancel,
  onRemove,
}: {
  initial: Omit<DraftToy, 'key'>;
  onSave: (t: Omit<DraftToy, 'key'>) => void;
  onCancel: () => void;
  onRemove?: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [kind, setKind] = useState<ToyKind>(initial.kind);
  const [color, setColor] = useState<string | undefined>(initial.color);
  const canSave = name.trim().length > 0;
  const formRef = useRef<View>(null);
  const { scrollIntoView } = useScreenScroll();

  useEffect(() => {
    scrollIntoView(formRef.current);
  }, [scrollIntoView]);

  return (
    <View ref={formRef} collapsable={false} style={styles.form}>
      <TextInput
        value={name}
        onChangeText={setName}
        maxLength={MAX_NAME}
        placeholder="Red mouse, feather wand…"
        placeholderTextColor={colors.whisker}
        style={styles.input}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => canSave && onSave({ name: name.trim(), kind, color })}
      />
      <Label>Type</Label>
      <KindRow value={kind} onChange={setKind} />
      <Label>Colour (optional)</Label>
      <ColorRow value={color} onChange={setColor} />
      <View style={styles.formBtns}>
        {onRemove ? (
          <Pressable onPress={onRemove} style={styles.formBtn} hitSlop={6}>
            <Body style={{ color: colors.danger, fontFamily: fonts.bodyBold }}>Remove</Body>
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }} />
        <Pressable onPress={onCancel} style={styles.formBtn} hitSlop={6}>
          <Body style={{ fontFamily: fonts.bodyBold }}>Cancel</Body>
        </Pressable>
        <Pressable
          disabled={!canSave}
          onPress={() => {
            tap();
            onSave({ name: name.trim(), kind, color });
          }}
          style={[styles.formBtn, styles.save, !canSave && { opacity: 0.4 }]}>
          <Body style={{ color: colors.white, fontFamily: fonts.bodyBold }}>{onRemove ? 'Save' : 'Add'}</Body>
        </Pressable>
      </View>
    </View>
  );
}

const ROLE_COLOR = { chase: colors.terracotta, stalk: colors.honey, grab: colors.sage } as const;

function RoleDot({ role, on }: { role: keyof typeof ROLE_COLOR; on: boolean }) {
  const c = ROLE_COLOR[role];
  return (
    <View style={[styles.roleDot, { borderColor: c, backgroundColor: on ? c : 'transparent' }]}>
      {on ? (
        <Svg width={10} height={10} viewBox="0 0 10 10">
          <Path d="M2 5.2l2 2 4-4.4" stroke={colors.white} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  roles: { gap: 8 },
  roleKey: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  roleName: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  roleBlurb: { fontSize: 13 },
  roleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  actionText: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  basket: {
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  basketFirst: { borderColor: colors.terracotta, borderWidth: 1.5 },
  basketHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  basketName: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    paddingVertical: 2,
  },
  basketSub: { marginTop: -6 },
  dots: { flexDirection: 'row', gap: 4 },
  toy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
  },
  toyName: { flex: 1, fontFamily: fonts.bodyBold, color: colors.ink },
  toyRole: { fontSize: 12 },
  add: {
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
    alignItems: 'center',
  },
  addText: { fontFamily: fonts.bodyBold, color: colors.terracottaDeep },
  hint: { fontSize: 13, color: colors.inkSoft },
  form: {
    gap: 10,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.cream,
  },
  input: {
    backgroundColor: colors.paper,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  formBtns: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  formBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill },
  save: { backgroundColor: colors.terracotta },
});
