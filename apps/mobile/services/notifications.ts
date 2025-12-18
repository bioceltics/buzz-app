// Notifications disabled for Expo Go compatibility
// Re-enable when building with EAS Build

/**
 * Stub functions for push notifications
 * These are placeholder implementations that don't require expo-notifications
 */

export async function registerForPushNotifications(): Promise<string | null> {
  console.log('Push notifications disabled in Expo Go');
  return null;
}

export async function savePushToken(token: string): Promise<void> {
  console.log('Push notifications disabled in Expo Go');
}

export function addNotificationReceivedListener(
  callback: (notification: any) => void
): { remove: () => void } {
  return { remove: () => {} };
}

export function addNotificationResponseListener(
  callback?: (response: any) => void
): { remove: () => void } {
  return { remove: () => {} };
}

export async function getLastNotificationResponse(): Promise<null> {
  return null;
}

export async function clearAllNotifications(): Promise<void> {}

export async function setBadgeCount(count: number): Promise<void> {}

export async function getBadgeCount(): Promise<number> {
  return 0;
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  triggerSeconds?: number
): Promise<string> {
  console.log('Local notifications disabled in Expo Go');
  return '';
}

export async function cancelScheduledNotification(notificationId: string): Promise<void> {}

export async function cancelAllScheduledNotifications(): Promise<void> {}

export default {
  registerForPushNotifications,
  savePushToken,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  clearAllNotifications,
  setBadgeCount,
  getBadgeCount,
  scheduleLocalNotification,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
};
