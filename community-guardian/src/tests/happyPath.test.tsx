import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Mock Next.js navigation ──────────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush, back: vi.fn() }),
    usePathname: () => '/create',
}))

// ── Mock apiBase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/apiBase', () => ({
    apiBaseUrl: () => 'http://localhost:4000',
}))

// ── Mock fetch ───────────────────────────────────────────────────────────────
const mockAlert = {
    id: 'test-123',
    title: 'Test Phishing Alert',
    description: 'This is a test phishing description that is long enough.',
    category: 'Phishing',
    severity: 'high',
    summary: 'Test summary',
    suggested_action: 'Do not click links.',
    reason: 'Test reason',
    confidence: 'high',
    source: 'User',
    location: 'Downtown',
    date: '2024-03-01',
    resolved: false,
    affects_me: false,
    created_at: '2024-03-01T10:00:00Z',
}

beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
})

// ── Mock Zustand store ───────────────────────────────────────────────────────
vi.mock('@/store/useStore', () => {
    const alerts: any[] = []
    return {
        useStore: (selector?: any) => {
            const state = {
                alerts,
                loading: false,
                preferences: { concerns: [], theme: 'system' },
                guardians: [],
                setAlerts: (a: any) => alerts.push(...a),
                addAlert: (a: any) => alerts.push(a),
                updateAlert: vi.fn(),
                setLoading: vi.fn(),
                setPreferences: vi.fn(),
            }
            return selector ? selector(state) : state
        }
    }
})

describe('Happy Path — Create → Save', () => {
    it('creates an alert via manual form and saves successfully', async () => {
        // Mock POST /alerts to return our test alert
        ; (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockAlert,
        })

        const { default: CreatePage } = await import('@/app/create/page')
        render(<CreatePage />)

        // Switch to manual tab
        const manualTab = screen.getByText(/Add Manually/i)
        await userEvent.click(manualTab)

        // Fill in form fields
        await userEvent.type(
            screen.getByPlaceholderText(/Brief descriptive title/i),
            'Test Phishing Alert'
        )
        await userEvent.type(
            screen.getByPlaceholderText(/Detailed description/i),
            'This is a test phishing description that is long enough.'
        )

        // Select category
        const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement
        await userEvent.selectOptions(categorySelect, 'Phishing')

        // Select severity
        const severitySelect = screen.getByLabelText(/severity/i) as HTMLSelectElement
        await userEvent.selectOptions(severitySelect, 'high')

        // Save
        const saveBtn = screen.getByText(/Save Alert/i)
        await userEvent.click(saveBtn)

        // Assert fetch was called with correct data
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:4000/alerts',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        })

        // Assert navigation to detail page
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/alerts/test-123')
        })
    })
})