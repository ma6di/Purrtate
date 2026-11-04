import * as Haptics from 'expo-haptics';

export function tap() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function success() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function warning() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
