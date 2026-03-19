'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

const links = [
    { href: '/alerts', label: 'Alerts', icon: '🛡️' },
    { href: '/digest', label: 'Digest', icon: '📋' },
    { href: '/create', label: '+ Create', icon: null },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Nav() {
    const pathname = usePathname()

    // Hide nav on shared/read-only pages
    if (pathname?.startsWith('/shared')) return null

    return (
        <>
            {/* Skip to content — a11y */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
            focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white
            focus:rounded-lg focus:outline-none"
            >
                Skip to content
            </a >

            <nav
                className="sticky top-0 z-40 w-full border-b border-slate-200
                   bg-white/80 backdrop-blur-sm
                   dark:border-slate-700 dark:bg-slate-900/80"
                aria-label="Main navigation"
            >
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

                    {/* Logo */}
                    <Link
                        href="/alerts"
                        className="flex items-center gap-2 font-semibold text-slate-800
                       dark:text-slate-100 hover:opacity-80 transition-opacity"
                    >
                        <span className="text-xl">🛡️</span>
                        <span className="hidden sm:inline text-sm font-bold tracking-tight">
                            Community Guardian
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="flex items-center gap-1" role="list">
                        {links.map((link) => {
                            const isActive = pathname === link.href ||
                                (link.href === '/alerts' && pathname?.startsWith('/alerts'))

                            const isCreate = link.href === '/create'

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    role="listitem"
                                    className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${isCreate
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                            : isActive
                                                ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                                        }
                  `}
                                    aria-current={isActive && !isCreate ? 'page' : undefined}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Theme toggle */}
                    <ThemeToggle />
                </div>
            </nav>
        </>
    )
}