import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
    usePathname: () => '/create',
}))

vi.mock('@/lib/apiBase', () => ({
    apiBaseUrl: () => 'http://localhost:4000',
}))

vi.mock('@/store/useStore', () => ({
    useStore: (selector?: any) => {
        const state = {
            alerts: [],
            loading: false,
            preferences: { concerns: [], theme: 'system' },
            setAlerts: vi.fn(),
            addAlert: vi.fn(),
            setLoading: vi.fn(),
            setPreferences: vi.fn(),
        }
        return selector ? selector(state) : state
    }
}))

beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
})

describe('Edge Cases — Validation', () => {

    it('shows error when paste tab submitted with empty text', async () => {
        const { default: CreatePage } = await import('@/app/create/page')
        render(<CreatePage />)

        // Stay on paste tab, click categorize without text
        const categorizeBtn = screen.getByRole('button', { name: '🤖 Categorize' })
        await userEvent.click(categorizeBtn)

        await waitFor(() => {
            expect(
                screen.getByText(/Please paste some text first/i)
            ).toBeInTheDocument()
        })

        // No fetch should have been made
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('shows validation error when title is too short', async () => {
        const { default: CreatePage } = await import('@/app/create/page')
        render(<CreatePage />)

        // Switch to manual tab
        await userEvent.click(screen.getByText(/Add Manually/i))

        // Type a too-short title
        await userEvent.type(
            screen.getByPlaceholderText(/Brief descriptive title/i),
            'Hi'
        )

        // Type valid description
        await userEvent.type(
            screen.getByPlaceholderText(/Detailed description/i),
            'This is a long enough description for the test.'
        )

        // Try to save
        await userEvent.click(screen.getByText(/Save Alert/i))

        await waitFor(() => {
            expect(
                screen.getByText(/Title must be at least 3 characters/i)
            ).toBeInTheDocument()
        })

        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('shows error when description is too short', async () => {
        const { default: CreatePage } = await import('@/app/create/page')
        render(<CreatePage />)

        await userEvent.click(screen.getByText(/Add Manually/i))

        await userEvent.type(
            screen.getByPlaceholderText(/Brief descriptive title/i),
            'Valid title here'
        )
        await userEvent.type(
            screen.getByPlaceholderText(/Detailed description/i),
            'Too short'
        )

        await userEvent.click(screen.getByText(/Save Alert/i))

        await waitFor(() => {
            expect(
                screen.getByText(/Description must be at least 10 characters/i)
            ).toBeInTheDocument()
        })

        expect(global.fetch).not.toHaveBeenCalled()
    })

})