import { api } from './api';

// Helper to convert base64 VAPID key to Uint8Array for the browser push manager
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Request notification permission and subscribe to browser push service
 * @param {object} currentUser Current logged-in user object
 */
export const setupPushNotifications = async (currentUser) => {
  if (!currentUser) return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported in this browser.');
    return;
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission was denied or not set.');
      return;
    }

    // 2. Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // 3. Fetch VAPID key from backend
    const { publicKey } = await api.getPushKey();
    if (!publicKey) {
      console.error('No VAPID public key returned from backend.');
      return;
    }

    // 4. Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // 5. Subscribe to push manager
      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });
      console.log('Browser Push Subscription created successfully:', subscription);
    }

    // 6. Save subscription to backend
    // Parse keys for easy database storage
    const subJSON = subscription.toJSON();
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subJSON.keys.p256dh,
        auth: subJSON.keys.auth
      }
    };

    await api.subscribePush(subscriptionData);
    console.log('Push subscription successfully stored on backend.');
  } catch (error) {
    console.error('Failed to setup push notifications:', error);
  }
};
