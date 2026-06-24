export function requestWebNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Web Desktop notification permission:", permission);
      });
    }
  }
}

export function showWebNotification(title: string, body: string) {
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    // Only show if document is currently hidden/unfocused (matches WhatsApp Web behavior)
    if (document.visibilityState === "hidden") {
      new Notification(title, {
        body,
        icon: "/favicon.ico", // Standard browser icon path
      });
    }
  }
}
