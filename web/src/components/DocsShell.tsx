"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export type DocSection = { id: string; title: string };

/**
 * Docs chrome: sticky sidebar of section links that highlights whichever
 * section is currently on screen.
 */
export function DocsShell({
  sections,
  children,
}: {
  sections: DocSection[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry nearest the top of the viewport that is visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [sections]);

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <Logo href="/" />
            <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft sm:inline">
              Docs
            </span>
          </div>
          <Link
            href="/app"
            className="rounded-sm bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Launch app
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-12 px-6 py-12">
        <nav
          aria-label="Documentation sections"
          className="sticky top-24 hidden h-fit w-56 shrink-0 lg:block"
        >
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            On this page
          </p>
          <ul className="space-y-1 border-l border-line">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`-ml-px block border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                    active === s.id
                      ? "border-ink font-medium text-ink"
                      : "border-transparent text-ink-soft hover:border-line hover:text-ink"
                  }`}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-10 first:border-0 first:pt-0">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="docs-prose mt-4 space-y-4 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}
