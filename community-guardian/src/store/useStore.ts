import { create } from 'zustand'
import type { Alert, UserPreference, Guardian } from '@/types/alert'

interface Store {
    alerts: Alert[]
    preferences: UserPreference | null
    guardians: Guardian[]
    lastChecked: string | null
    loading: boolean

    setAlerts: (alerts: Alert[]) => void
    addAlert: (alert: Alert) => void
    updateAlert: (id: string, updates: Partial<Alert>) => void
    removeAlert: (id: string) => void
    setPreferences: (prefs: UserPreference) => void
    setGuardians: (guardians: Guardian[]) => void
    addGuardian: (guardian: Guardian) => void
    removeGuardian: (id: string) => void
    setLastChecked: (ts: string) => void
    setLoading: (loading: boolean) => void
}

export const useStore = create<Store>((set) => ({
    alerts: [] as Alert[],
    preferences: null,
    guardians: [] as Guardian[],
    lastChecked: null,
    loading: true,          // ← start as true so skeleton shows

    setAlerts: (alerts) => set({ alerts }),
    addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts] })),
    updateAlert: (id, updates) =>
        set((s) => ({
            alerts: s.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
    removeAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

    setPreferences: (preferences) => set({ preferences }),

    setGuardians: (guardians) => set({ guardians }),
    addGuardian: (guardian) =>
        set((s) => ({ guardians: [...s.guardians, guardian] })),
    removeGuardian: (id) =>
        set((s) => ({ guardians: s.guardians.filter((g) => g.id !== id) })),

    setLastChecked: (lastChecked) => set({ lastChecked }),
    setLoading: (loading) => set({ loading }),
}))