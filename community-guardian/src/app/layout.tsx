import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import PreferencesLoader from '@/components/PreferencesLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Community Guardian',
  description: 'Calm, actionable community safety intelligence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-900 min-h-screen`}>
        <PreferencesLoader />
        <Nav />
        <main
          id="main-content"
          className="max-w-5xl mx-auto px-4 py-6"
          tabIndex={-1}
        >
          {children}
        </main>
      </body>
    </html>
  )
}