'use client'

import { useState } from 'react'

interface Props {
    text: string
}

export default function ReadAloud({ text }: Props) {
    const [speaking, setSpeaking] = useState(false)

    const handleSpeak = () => {
        if (!window.speechSynthesis) return

        if (speaking) {
            window.speechSynthesis.cancel()
            setSpeaking(false)
            return
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)

        window.speechSynthesis.speak(utterance)
        setSpeaking(true)
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) return null

    return (
        <button
            onClick={handleSpeak}
            aria-label={speaking ? 'Stop reading aloud' : 'Read alert aloud'}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg
                  border transition-colors
                  ${speaking
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
        >
            {speaking ? '⏹ Stop' : '🔊 Read aloud'}
        </button>
    )
}