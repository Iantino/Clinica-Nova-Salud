import Image from "next/image";

type BrandLogoProps = {
  size: number;
  className?: string;
  iconOnly?: boolean;
};

export default function BrandLogo({ size, className = "", iconOnly = false }: BrandLogoProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-transparent ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Clínica NovaSalud — Tu salud en buenas manos"
    >
      {iconOnly ? (
        <Image
          src="/clinica-nova-salud-logo-transparente.png"
          alt=""
          width={1254}
          height={1254}
          priority
          className="absolute left-1/2 top-0 h-[150%] w-[150%] max-w-none -translate-x-1/2 object-contain object-top"
        />
      ) : (
        <>
          <div className="relative h-[68%] w-full overflow-hidden" aria-hidden="true">
            <Image
              src="/clinica-nova-salud-logo-transparente.png"
              alt=""
              width={1254}
              height={1254}
              priority
              className="absolute left-0 top-0 h-auto w-full max-w-none"
            />
          </div>
          <div className="flex h-[32%] flex-col items-center justify-center leading-none" aria-hidden="true">
            <span className="text-[0.48rem] font-medium tracking-[0.42em] text-white/90 uppercase">Clínica</span>
            <span className="mt-0.5 font-display text-[1.35rem] leading-none font-bold tracking-[-0.07em]">
              <span className="text-white">Nova</span><span className="text-[#55d5a2]">Salud</span>
            </span>
            <span className="mt-1 text-[0.36rem] font-medium tracking-[0.2em] text-white/75 uppercase">
              Tu salud en buenas manos
            </span>
          </div>
        </>
      )}
    </div>
  );
}
