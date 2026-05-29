"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-lg font-bold font-[family-name:var(--font-oswald)] uppercase">
        Erro ao carregar página
      </h2>
      <p className="text-sm text-[#94B8D8] max-w-xs">
        Algo deu errado ao carregar esta seção. Tente novamente ou volte mais tarde.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-[#22C55E] text-white font-bold rounded-full text-sm hover:bg-[#16a34a] transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
