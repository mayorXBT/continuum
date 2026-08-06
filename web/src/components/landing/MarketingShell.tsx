import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

/** Shared chrome for the marketing pages: sticky nav + content + footer. */
export default function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
