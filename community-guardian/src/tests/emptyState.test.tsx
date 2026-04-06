/**
 * EMPTY STATE & UI TESTS
 * ----------------------
 * This suite tests the user experience when no data is found after applying filters.
 * Key UI verifications:
 * - Empty Alert Messages: Checking that the 'No alerts match your filters' message appears.
 * - Icon Checks: Ensuring the magnifying glass or other relevant icons are rendered.
 * - Clear UX: Verifying clear instructions are provided for how a user should recover.
 * - Loading Skeletons: (Indirectly) ensures the page can initialize without crashing.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
    usePathname: () => '/alerts',
    useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/apiBase', () => ({
    apiBaseUrl: () => 'http://localhost:4000',
}))

// ── Mock store with empty alerts ─────────────────────────────────────────────
vi.mock('@/store/useStore', () => ({
    useStore: (selector?: any) => {
        const state = {
            alerts: [],
            loading: false,
            preferences: { concerns: [], theme: 'system' },
            guardians: [],
            setAlerts: vi.fn(),
            addAlert: vi.fn(),
            setLoading: vi.fn(),
            setPreferences: vi.fn(),
            setLastChecked: vi.fn(),
        }
        return selector ? selector(state) : state
    }
}))

beforeEach(() => {
    vi.resetAllMocks()
    // Mock fetch to return empty array
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
    })
})

describe('Empty State', () => {

    it('shows friendly empty state when no alerts match filters', async () => {
        const { default: AlertsPage } = await import('@/app/alerts/page')
        render(<AlertsPage />)

        await waitFor(() => {
            expect(
                screen.getByText(/No alerts match your filters/i)
            ).toBeInTheDocument()
        })
    })

    it('shows search icon in empty state', async () => {
        const { default: AlertsPage } = await import('@/app/alerts/page')
        render(<AlertsPage />)

        await waitFor(() => {
            const icons = screen.getAllByText('🔍')
            expect(icons[1]).toBeInTheDocument()
        })
    })

    it('shows helper text in empty state', async () => {
        const { default: AlertsPage } = await import('@/app/alerts/page')
        render(<AlertsPage />)

        await waitFor(() => {
            expect(
                screen.getByText(/Try clearing your filters or adding a new alert/i)
            ).toBeInTheDocument()
        })
    })

})