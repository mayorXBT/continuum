import Image from "next/image";
import Link from "next/link";

/**
 * The Continuum mark plus wordmark. `tone` picks the asset that reads against
 * the surface it sits on — ink on paper, paper on ink.
 */
export function Logo({
  href = "/",
  tone = "ink",
  size = 28,
  className = "",
}: {
  href?: string | null;
  tone?: "ink" | "paper";
  size?: number;
  className?: string;
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src={tone === "ink" ? "/continuum-mark.png" : "/continuum-mark-light.png"}
        alt=""
        width={size}
        height={size}
        priority
        className="shrink-0"
      />
      <span
        className={`font-mono text-sm font-medium tracking-[0.22em] ${
          tone === "ink" ? "text-ink" : "text-paper"
        }`}
      >
        CONTINUUM
      </span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="Continuum home" className="inline-flex">
      {inner}
    </Link>
  );
}
