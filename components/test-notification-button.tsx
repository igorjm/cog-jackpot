"use client";

import { useState } from "react";
import { sendCustomNotification } from "@/app/actions/admin";

export function SendNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const result = await sendCustomNotification(title, body);
    if ("error" in result) {
      setStatus(`❌ ${result.error}`);
    } else {
      setStatus(`✅ ${result.message}`);
      setTitle("");
      setBody("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Título da notificação"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg bg-[#0F2347] border border-[#2A4A7A] text-white placeholder:text-[#5A7A9A] focus:outline-none focus:border-[#38BDF8]"
      />
      <textarea
        placeholder="Mensagem..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 text-sm rounded-lg bg-[#0F2347] border border-[#2A4A7A] text-white placeholder:text-[#5A7A9A] focus:outline-none focus:border-[#38BDF8] resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !title.trim() || !body.trim()}
          className="px-4 py-2 text-sm rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] font-medium hover:bg-[#38BDF8]/25 transition-colors disabled:opacity-50"
        >
          {loading ? "Enviando..." : "🔔 Enviar Notificação"}
        </button>
        {status && <span className="text-xs text-[#94B8D8]">{status}</span>}
      </div>
    </form>
  );
}
