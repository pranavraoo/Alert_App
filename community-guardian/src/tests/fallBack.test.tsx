import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fallbackCategorize } from '@/lib/fallback'
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

describe('Fallback — AI Failure', () => {

    it('uses keyword fallback when AI categorize API fails', async () => {
        // Mock /categorize to throw network error
        ; (global.fetch as any).mockRejectedValueOnce(
            new Error('Network error')
        )

        const { default: CreatePage } = await import('@/app/create/page')
        render(<CreatePage />)

        // Paste phishing text
        const textarea = screen.getByPlaceholderText(
            /Paste a suspicious email/i
        )
        await userEvent.type(
            textarea,
            'Click here to verify your account credentials immediately'
        )

        // Click categorize
        await userEvent.click(screen.getByRole('button', { name: '🤖 Categorize' }))

        // Should show fallback warning
        await waitFor(() => {
            expect(
                screen.getByText(/AI service unavailable. Using smart categorization instead./i)
            ).toBeInTheDocument()
        })
    })

    it('fallbackCategorize correctly identifies phishing text', () => {
        const result = fallbackCategorize(
            'Click here to verify your account credentials immediately'
        )

        expect(result.category).toBe('Phishing')
        expect(result.confidence).toBe('low')
        expect(result.reason).toMatch(/Matched keywords/i)
    })

    it('fallbackCategorize correctly identifies scam text', () => {
        const result = fallbackCategorize(
            'Congratulations! You have won a prize. Send money to claim your gift card reward.'
        )

        expect(result.category).toBe('Scam')
        expect(result.confidence).toBe('low')
    })

    it('fallbackCategorize bumps severity for urgent text', () => {
        const result = fallbackCategorize(
            'URGENT: Click here to verify your account credentials immediately or lose access'
        )

        expect(result.severity).toBe('high')
    })

})