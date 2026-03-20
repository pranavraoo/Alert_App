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

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        createAlert: vi.fn().mockResolvedValue({ data: { id: '1', title: 'Test' } }),
        getAlerts: vi.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0, hasNext: false, hasPrev: false } }),
        updateAlert: vi.fn(),
        deleteAlert: vi.fn(),
        getPreferences: vi.fn().mockResolvedValue({ data: { concerns: [], theme: 'system' } }),
        updatePreferences: vi.fn().mockResolvedValue({ data: { concerns: [], theme: 'system' } }),
        getGuardians: vi.fn().mockResolvedValue({ data: [] }),
        createGuardian: vi.fn(),
        updateGuardian: vi.fn(),
        deleteGuardian: vi.fn(),
        verifyAlert: vi.fn(),
        getVerificationHistory: vi.fn().mockResolvedValue({ data: [] }),
        queryWithAI: vi.fn().mockResolvedValue({ data: { summary: 'Test response' } }),
        categorizeText: vi.fn().mockRejectedValue({ error: 'Network error' }),
    }
}))

beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => '',
    })
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
                screen.getByText(/Unable to connect to categorization service. Please try again./i)
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