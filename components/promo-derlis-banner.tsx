import Image from "next/image";

export function PromoDerlisBanner() {
  return (
    <div className="relative mt-6 w-full overflow-hidden rounded-2xl border border-[#FACC15]/20 shadow-lg shadow-black/20">
      <Image
        src="/promo-derlis.png"
        alt="O Derlis já sabe quem vai ganhar — será que você consegue acertar?"
        width={1200}
        height={480}
        className="h-auto w-full"
        sizes="(max-width: 640px) 100vw, 640px"
      />
    </div>
  );
}
