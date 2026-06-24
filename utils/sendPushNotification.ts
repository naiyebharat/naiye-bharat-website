import * as admin from "firebase-admin";
import * as path from "path";

// Initialize Firebase Admin SDK once
if (admin.apps.length === 0) {
  try {
    const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
  }
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  extraData: Record<string, string> = {}
) {
  if (!fcmToken) return;

  const message = {
    notification: {
      title,
      body,
    },
    android: {
      priority: "high" as const,
      notification: {
        channelId: "default_notification_channel",
        sound: "default",
        vibrateTimingsMillis: [300, 500, 300, 500],
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
    data: extraData,
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Push notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}
