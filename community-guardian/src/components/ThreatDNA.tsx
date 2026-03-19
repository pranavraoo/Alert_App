import { generateFingerprint } from '@/lib/fingerprint'
import type { Alert } from '@/types/alert'

interface Props {
    alert: Alert
    size?: 'sm' | 'lg'
}

export default function ThreatDNA({ alert, size = 'sm' }: Props) {
    const px = size === 'sm' ? 24 : 64
    const svg = generateFingerprint(alert, px)

    return (
        <div
            className={`flex-shrink-0 rounded-full overflow-hidden
        ${size === 'sm' ? 'w-6 h-6' : 'w-16 h-16'}
        bg-slate-100 dark:bg-slate-700`}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}