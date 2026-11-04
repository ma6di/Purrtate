import * as Notifications from 'expo-notifications';

export type PermissionResult = 'granted' | 'denied' | 'blocked';

/**
 * Shows the native iOS "Allow notifications?" prompt if it hasn't been answered yet.
 * 'blocked' means the user said no before; iOS won't ask again, only Settings can change it.
 */
export async function askNotificationPermission(): Promise<PermissionResult> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (!current.canAskAgain) return 'blocked';
    const asked = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return asked.granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/**
 * One local notification at 9:30 on the day the next swap is due.
 * If it's already due, remind tomorrow morning.
 */
export async function syncReminders(
  on: boolean,
  swap: { dueAt: string; nextName: string; catName: string } | null
) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!on || !swap) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;

    const when = new Date(swap.dueAt);
    when.setHours(9, 30, 0, 0);
    if (when.getTime() <= Date.now()) {
      when.setTime(Date.now());
      when.setDate(when.getDate() + 1);
      when.setHours(9, 30, 0, 0);
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to swap in ${swap.nextName}`,
        body: `${swap.catName}’s toys have been out long enough. The next basket will feel new.`,
        sound: false,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  } catch {
    // Reminders are optional; the Today screen shows the same cue.
  }
}
