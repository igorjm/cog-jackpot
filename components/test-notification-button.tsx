"use client";

import { useState } from "react";
import { sendTestNotification } from "@/app/actions/admin";

export function TestNotificationButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setStatus(null);
    const result = await sendTestNotification();
    if ("error" in result) {
      setStatus(`❌ ${result.error}`);
    } else {
      setStatus(`✅ ${result.message}`);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 text-sm rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] font-medium hover:bg-[#38BDF8]/25 transition-colors disabled:opacity-50"
      >
        {loading ? "Enviando..." : "🔔 Testar Notificação"}
      </button>
      {status && <span className="text-xs text-[#94B8D8]">{status}</span>}
    </div>
  );
}
