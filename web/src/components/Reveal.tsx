"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Fades content up the first time it enters the viewport. Uses an observer
 * rather than scroll listeners so it costs nothing while idle, and it self-
 * disconnects once fired.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer — show immediately rather than never.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    // Failsafe. Content starts at opacity 0, so anything that stops the
    // observer from firing — a backgrounded tab, an embedded viewport that
    // never composites — would otherwise leave the page blank. Reveal
    // regardless after a beat; the animation is decoration, the text is not.
    const failsafe = window.setTimeout(() => setShown(true), 1200);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            window.clearTimeout(failsafe);
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    io.observe(node);

    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
    };
  }, []);

  return (
    <Tag
      // @ts-expect-error — ref type varies with the chosen tag
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
