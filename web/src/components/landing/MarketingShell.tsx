import type { ReactNode } from 'react'
import Navbar from './Navbar'
import CollapsibleFooter from './CollapsibleFooter'

/**
 * Shared chrome for the long marketing pages: sticky nav, content, and the
 * collapsed footer. These pages are long reads, so the sitemap stays folded
 * away until it is asked for. The landing page renders the full Footer itself.
 */
export default function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <Navbar />
      <main className="flex-1">{children}</main>
      <CollapsibleFooter />
    </div>
  )
}
