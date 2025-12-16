import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';

// Create a new Expo SDK client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

export interface PushNotificationData {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: 'default' | null;
  categoryId?: string;
}

/**
 * Send a push notification to one or more devices
 */
export async function sendPushNotification(notification: PushNotificationData): Promise<ExpoPushTicket[]> {
  const pushTokens = Array.isArray(notification.to) ? notification.to : [notification.to];

  // Filter out invalid tokens
  const validTokens = pushTokens.filter((token) => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.log('No valid Expo push tokens to send to');
    return [];
  }

  // Create messages
  const messages: ExpoPushMessage[] = validTokens.map((pushToken) => ({
    to: pushToken,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    sound: notification.sound || 'default',
    badge: notification.badge,
    categoryId: notification.categoryId,
  }));

  // Chunk messages (Expo recommends chunks of ~100)
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notification chunk:', error);
    }
  }

  // Log any errors
  tickets.forEach((ticket, index) => {
    if (ticket.status === 'error') {
      console.error(
        `Push notification error for token ${validTokens[index]}:`,
        ticket.message,
        ticket.details
      );
    }
  });

  return tickets;
}

/**
 * Check delivery receipts for push notifications
 */
export async function checkPushReceipts(ticketIds: string[]): Promise<{ [id: string]: ExpoPushReceipt }> {
  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(ticketIds);
  const receipts: { [id: string]: ExpoPushReceipt } = {};

  for (const chunk of receiptIdChunks) {
    try {
      const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
      Object.assign(receipts, receiptChunk);
    } catch (error) {
      console.error('Error getting push receipts:', error);
    }
  }

  // Log errors and handle device not registered
  for (const receiptId in receipts) {
    const receipt = receipts[receiptId];
    if (receipt.status === 'error') {
      console.error(
        `Push receipt error for ${receiptId}:`,
        receipt.message,
        receipt.details
      );

      // If the device is no longer registered, we should remove the token
      if (receipt.details?.error === 'DeviceNotRegistered') {
        // TODO: Remove the push token from the user's record
        console.log('Device not registered, should remove token');
      }
    }
  }

  return receipts;
}

/**
 * Send notification for new chat message
 */
export async function sendNewMessageNotification(
  pushToken: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<void> {
  await sendPushNotification({
    to: pushToken,
    title: `New message from ${senderName}`,
    body: messagePreview.length > 100 ? messagePreview.substring(0, 97) + '...' : messagePreview,
    data: {
      type: 'new_message',
      conversationId,
    },
    categoryId: 'message',
  });
}

/**
 * Send notification for venue approval
 */
export async function sendVenueApprovedNotification(
  pushToken: string,
  venueName: string,
  venueId: string
): Promise<void> {
  await sendPushNotification({
    to: pushToken,
    title: 'Venue Approved! 🎉',
    body: `Great news! ${venueName} has been approved and is now live on Buzz.`,
    data: {
      type: 'venue_approved',
      venueId,
    },
  });
}

/**
 * Send notification for venue rejection
 */
export async function sendVenueRejectedNotification(
  pushToken: string,
  venueName: string,
  venueId: string,
  reason?: string
): Promise<void> {
  await sendPushNotification({
    to: pushToken,
    title: 'Venue Application Update',
    body: reason
      ? `${venueName} was not approved: ${reason}`
      : `${venueName} was not approved. Please review the requirements and try again.`,
    data: {
      type: 'venue_rejected',
      venueId,
    },
  });
}

/**
 * Send notification for nearby deals
 */
export async function sendNearbyDealNotification(
  pushTokens: string[],
  dealTitle: string,
  venueName: string,
  dealId: string,
  venueId: string
): Promise<void> {
  await sendPushNotification({
    to: pushTokens,
    title: `🔥 Hot Deal Nearby!`,
    body: `${dealTitle} at ${venueName}`,
    data: {
      type: 'deal_nearby',
      dealId,
      venueId,
    },
  });
}

/**
 * Send notification for deal expiring soon
 */
export async function sendDealExpiringNotification(
  pushToken: string,
  dealTitle: string,
  venueName: string,
  dealId: string,
  timeRemaining: string
): Promise<void> {
  await sendPushNotification({
    to: pushToken,
    title: '⏰ Deal Expiring Soon!',
    body: `"${dealTitle}" at ${venueName} ends in ${timeRemaining}`,
    data: {
      type: 'deal_expiring',
      dealId,
    },
  });
}

/**
 * Send notification for event reminder
 */
export async function sendEventReminderNotification(
  pushToken: string,
  eventTitle: string,
  venueName: string,
  eventId: string,
  startTime: string
): Promise<void> {
  const eventDate = new Date(startTime);
  const timeString = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  await sendPushNotification({
    to: pushToken,
    title: '📅 Event Starting Soon!',
    body: `${eventTitle} at ${venueName} starts at ${timeString}`,
    data: {
      type: 'event_reminder',
      eventId,
    },
  });
}

export default {
  sendPushNotification,
  checkPushReceipts,
  sendNewMessageNotification,
  sendVenueApprovedNotification,
  sendVenueRejectedNotification,
  sendNearbyDealNotification,
  sendDealExpiringNotification,
  sendEventReminderNotification,
};
