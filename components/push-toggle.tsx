"use client";

import { useEffect, useState } from "react";

export function PushToggle() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(isSupported);

    if (!isSupported) return;

    setPermission(Notification.permission);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub);
      });
    });
  }, []);

  const handleToggle = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      if (subscribed) {
        // Unsubscribe
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setSubscribed(false);
      } else {
        // Subscribe
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== "granted") return;

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
        });

        const json = sub.toJSON();
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
          }),
        });

        setSubscribed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <p className="text-xs text-[#5A7A9A]">
        📱 No iOS, adicione o app à Tela Inicial para receber notificações.
        No Android, use Chrome.
      </p>
    );
  }
  if (permission === "denied") {
    return (
      <p className="text-xs text-[#5A7A9A]">
        Notificações bloqueadas pelo navegador
      </p>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-all ${
        subscribed
          ? "border-[#22C55E]/30 text-[#22C55E] bg-[#22C55E]/10"
          : "border-[#2A4A7A] text-[#94B8D8] hover:border-[#38BDF8]/30 hover:text-[#38BDF8]"
      }`}
    >
      <span>{subscribed ? "🔔" : "🔕"}</span>
      <span>{loading ? "..." : subscribed ? "Notificações ativas" : "Ativar notificações"}</span>
    </button>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
