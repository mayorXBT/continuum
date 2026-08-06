import Link from "next/link";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";

export type Section = { heading: string; body: React.ReactNode };

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: React.ReactNode;
  sections: Section[];
}) {
  return (
    <div className="flex-1">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Logo href="/" />
          <Link
            href="/app"
            className="rounded-sm bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Launch app
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Last updated {updated}
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-6 text-base leading-relaxed text-ink-soft">{intro}</div>

        <nav aria-label="Contents" className="mt-10 rounded-sm border border-line bg-paper-raised p-5">
          <h2 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Contents
          </h2>
          <ol className="grid gap-1.5 sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.heading}>
                <a
                  href={`#s${i + 1}`}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <section key={s.heading} id={`s${i + 1}`} className="scroll-mt-8">
              <h2 className="font-display text-xl font-semibold">
                {i + 1}. {s.heading}
              </h2>
              <div className="legal-body mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
