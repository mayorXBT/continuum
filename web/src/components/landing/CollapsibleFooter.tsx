"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { COLUMNS, FOOTER_TAGLINE } from "./Footer";

/**
 * Footer for the reading pages (docs, product, developers, security).
 * Collapsed to a single quiet bar by default so it does not compete with long
 * page content, and expandable to the full column set for anyone who wants it.
 * The landing page keeps the full Footer, since that is where the sitemap
 * earns its space.
 */
export default function CollapsibleFooter() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <footer className="bg-dark text-darktext">
      <div className="container-cv py-8">
        {open && (
          <div
            id={panelId}
            className="mb-8 grid grid-cols-2 gap-8 border-b border-darkline pb-8 sm:grid-cols-4"
          >
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="eyebrow text-darkmuted">{col.heading}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.file ? (
                        <a
                          href={l.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-darkmuted transition-colors hover:text-darktext"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.to}
                          className="text-sm text-darkmuted transition-colors hover:text-darktext"
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/continuum-mark-light.png"
              alt=""
              className="h-7 w-7"
              width={28}
              height={28}
            />
            <span className="font-mono text-[12px] font-medium tracking-[0.22em]">
              CONTINUUM
            </span>
          </div>

          <p className="max-w-[46ch] text-sm leading-relaxed text-darkmuted">
            {FOOTER_TAGLINE}
          </p>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              className="flex items-center gap-1.5 font-mono text-xs text-darkmuted transition-colors hover:text-darktext"
            >
              {open ? "Less" : "More"}
              <span
                aria-hidden
                className={`transition-transform ${open ? "rotate-180" : ""}`}
              >
                &#9662;
              </span>
            </button>
            <p className="font-mono text-xs text-darkmuted">
              &copy; {new Date().getFullYear()} Continuum
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
