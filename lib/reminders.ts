import { Platform } from 'react-native';

import type { RotationAlert } from '@/types/models';

export async function syncReminders(on: boolean, alert: RotationAlert | undefined) {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!on || !alert || alert.kind !== 'rotate') return;
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== 'granted') return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Purrtate',
        body: alert.title + ' — ' + alert.body,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 30,
      },
    });
  } catch {
    // Local reminders are optional; the Today screen always shows the same cue.
  }
}

