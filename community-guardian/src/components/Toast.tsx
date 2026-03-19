'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
    message: string
    type?: 'success' | 'error' | 'info' | 'warning'
    onClose: () => void
    duration?: number
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [onClose, duration])

    const styles = {
        success: 'bg-green-50  border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100',
        error: 'bg-red-50    border-red-200   text-red-800   dark:bg-red-900   dark:border-red-700   dark:text-red-100',
        warning: 'bg-amber-50  border-amber-200 text-amber-800 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-100',
        info: 'bg-blue-50   border-blue-200  text-blue-800  dark:bg-blue-900  dark:border-blue-700  dark:text-blue-100',
    }

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    }

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`
        fixed bottom-4 right-4 z-50 flex items-center gap-3
        px-4 py-3 rounded-xl border shadow-lg text-sm font-medium
        animate-in slide-in-from-bottom-2 duration-200
        ${styles[type]}
      `}
        >
            <span className="font-bold">{icons[type]}</span>
            <span>{message}</span>
            <button
                onClick={onClose}
                aria-label="Dismiss notification"
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            >
                ✕
            </button>
        </div>
    )
}

// Global toast hook
interface ToastState {
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    id: number
}

let toastCount = 0

export function useToast() {
    const [toast, setToast] = useState<ToastState | null>(null)

    const showToast = (
        message: string,
        type: 'success' | 'error' | 'info' | 'warning' = 'info'
    ) => {
        setToast({ message, type, id: toastCount++ })
    }

    const hideToast = () => setToast(null)

    const ToastComponent = toast ? (
        <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
        />
    ) : null

    return { showToast, ToastComponent }
}