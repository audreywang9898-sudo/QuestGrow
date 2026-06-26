import webpush from 'web-push';
import pool from '../config/db.js';

// Setup VAPID details if keys are present
const initWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (publicKey && privateKey) {
    webpush.setVapidDetails(
      'mailto:support@questgrow.com',
      publicKey,
      privateKey
    );
    console.log('Web Push VAPID keys set successfully.');
  } else {
    console.warn('VAPID keys not configured in environment variables.');
  }
};

initWebPush();

/**
 * Send push notification to a specific user
 * @param {string} userId UUID of the user
 * @param {object} payload Notification payload containing { title, body, data }
 */
export const sendPushNotificationToUser = async (userId, payload) => {
  try {
    // 1. Fetch subscriptions for the user
    const res = await pool.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (res.rows.length === 0) {
      console.log(`No active push subscriptions found for user: ${userId}`);
      return;
    }

    const payloadString = JSON.stringify(payload);

    // 2. Send push to all registered subscriptions of this user
    const sendPromises = res.rows.map(sub => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      return webpush.sendNotification(subscription, payloadString)
        .catch(async (err) => {
          // If subscription is expired or invalid, remove it from the database (status 410 or 404)
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`Removing expired subscription: ${sub.endpoint}`);
            await pool.query(
              'DELETE FROM push_subscriptions WHERE endpoint = $1',
              [sub.endpoint]
            );
          } else {
            console.error(`Error sending push notification to endpoint ${sub.endpoint}:`, err);
          }
        });
    });

    await Promise.all(sendPromises);
    console.log(`Push notifications sent to user ${userId} successfully.`);
  } catch (error) {
    console.error('Failed to send push notification to user:', error);
  }
};
