import type { AlertCategory, Severity, AlertSource } from '@/types/alert'

export const CATEGORIES: AlertCategory[] = [
    'Scam',
    'Phishing',
    'Imposter',
    'Data breach',
    'Local safety',
    'CVE',
    'Other',
]

export const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical']

export const SOURCES: AlertSource[] = ['CISA', 'PhishTank', 'NVD', 'User']

export const LOCATIONS = [
    'Nationwide',
    'Downtown',
    'Riverside',
    'Northside',
    'Southside',
    'Eastside',
    'Westside',
    'Midtown',
    'Harbor',
    'Valley',
]

// Severity colours — calm, no pure red
export const SEVERITY_STYLES: Record<Severity, string> = {
    low: 'bg-emerald-100  text-emerald-800  dark:bg-emerald-900  dark:text-emerald-200',
    medium: 'bg-amber-100  text-amber-800  dark:bg-amber-900  dark:text-amber-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100    text-red-800    dark:bg-red-900    dark:text-red-200',
}

// Source badge colours
export const SOURCE_STYLES: Record<AlertSource, string> = {
    CISA: 'bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200',
    PhishTank: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    NVD: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    User: 'bg-slate-100  text-slate-700  dark:bg-slate-700  dark:text-slate-200',
}

// Category colours
export const CATEGORY_STYLES: Record<AlertCategory, string> = {
    'Scam': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Phishing': 'bg-red-100    text-red-800    dark:bg-red-900    dark:text-red-200',
    'Imposter': 'bg-pink-100   text-pink-800   dark:bg-pink-900   dark:text-pink-200',
    'Data breach': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Local safety': 'bg-teal-100   text-teal-800   dark:bg-teal-900   dark:text-teal-200',
    'CVE': 'bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200',
    'Other': 'bg-slate-100  text-slate-700  dark:bg-slate-700  dark:text-slate-200',
}

// Category checklists (mirrors data/category_checklists.json)
export const CHECKLISTS: Record<AlertCategory, string[]> = {
    'Phishing': ['Do not click any links in the message.', 'Log in to the service directly via its official website.', 'Enable 2FA on the affected account immediately.'],
    'Scam': ['Stop all contact with the sender immediately.', 'Do not send money, gift cards, or personal information.', 'Report to the FTC at reportfraud.ftc.gov.'],
    'Imposter': ['Hang up or stop responding immediately.', 'Call the real organisation using the number on their official website.', 'Report the impersonation to local authorities if threatened.'],
    'Data breach': ['Change your password on the affected service right now.', 'Check haveibeenpwned.com to see what else may be exposed.', 'Enable 2FA and monitor accounts for suspicious activity.'],
    'Local safety': ['Stay informed via official local emergency channels.', 'Avoid the affected area until authorities issue an all-clear.', 'Check in with neighbours and share this alert with your community.'],
    'CVE': ['Check if your software or device version is listed as affected.', 'Apply the vendor patch or update immediately.', 'Monitor CISA.gov and the vendor\'s security advisory for further updates.'],
    'Other': ['Verify the information through a trusted official source.', 'Do not share unverified information further.', 'Report to relevant authorities if you believe a crime has occurred.'],
}