"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="pt-BR">
      <body className="min-h-screen flex items-center justify-center bg-[#0F2347] text-white">
        <div className="text-center space-y-4 px-6">
          <p className="text-5xl">💥</p>
          <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
            Algo deu errado
          </h1>
          <p className="text-[#94B8D8] text-sm">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[#22C55E] text-white font-bold rounded-full text-sm hover:bg-[#16a34a] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
