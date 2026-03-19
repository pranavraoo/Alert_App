'use client'

import { useState } from 'react'
import type { Alert } from '@/types/alert'

interface ReportingTemplate {
  name: string
  description: string
  url: string
  email?: string
  fields: { name: string; label: string; required?: boolean }[]
}

const REPORTING_TEMPLATES: ReportingTemplate[] = [
  {
    name: 'FTC - Fraud Report',
    description: 'Report to Federal Trade Commission for consumer fraud, scams, and identity theft',
    url: 'https://reportfraud.ftc.gov/',
    email: 'fraud@ftc.gov',
    fields: [
      { name: 'subject', label: 'Subject', required: true },
      { name: 'details', label: 'Details of the fraud', required: true },
      { name: 'company', label: 'Company/Scammer Name', required: true },
      { name: 'date', label: 'Date of incident', required: true },
      { name: 'amount', label: 'Amount lost (if any)', required: false },
      { name: 'contact', label: 'Contact Information', required: false }
    ]
  },
  {
    name: 'CISA - Cyber Incident',
    description: 'Report to Cybersecurity & Infrastructure Security Agency for significant cyber incidents',
    url: 'https://www.cisa.gov/report-us',
    email: 'central@cisa.gov',
    fields: [
      { name: 'incident_type', label: 'Incident Type', required: true },
      { name: 'description', label: 'Incident Description', required: true },
      { name: 'impact', label: 'Business Impact', required: true },
      { name: 'date', label: 'Date/Time of Incident', required: true },
      { name: 'contact', label: 'Reporter Information', required: false }
    ]
  },
  {
    name: 'Google Safe Browsing',
    description: 'Report malicious URLs to Google Safe Browsing',
    url: 'https://safebrowsing.google.com/safebrowsing/report',
    email: 'safebrowsing-team@google.com',
    fields: [
      { name: 'url', label: 'Malicious URL', required: true },
      { name: 'threat_type', label: 'Threat Type', required: true },
      { name: 'details', label: 'Additional Details', required: false }
    ]
  },
  {
    name: 'PhishTank - Phishing Report',
    description: 'Submit verified phishing sites to PhishTank database',
    url: 'https://www.phishtank.com/submit.php',
    email: 'info@phishtank.com',
    fields: [
      { name: 'url', label: 'Phishing URL', required: true },
      { name: 'details', label: 'Phishing Details', required: false }
    ]
  }
]

interface ThreatReportingProps {
  alert: Alert
}

export default function ThreatReporting({ alert }: ThreatReportingProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportingTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTemplateSelect = (template: ReportingTemplate) => {
    setSelectedTemplate(template)
    // Pre-fill form with alert data
    setFormData({
      subject: `Community Guardian Alert: ${alert.title}`,
      details: `Alert Details:\n\nTitle: ${alert.title}\nCategory: ${alert.category}\nSeverity: ${alert.severity}\nDescription: ${alert.description}\n\nAI Summary: ${alert.summary}\nSuggested Action: ${alert.suggested_action}\n\nOriginal Alert ID: ${alert.id}`,
      url: alert.location || '',
      incident_type: alert.category,
      threat_type: alert.category,
      company: alert.category.includes('Scam') || alert.category.includes('Phishing') ? extractCompanyName(alert.description) : '',
      date: alert.date,
      impact: alert.severity.toUpperCase()
    })
  }

  const extractCompanyName = (text: string): string => {
    // Simple extraction of company names from scam text
    const patterns = [
      /(?:Microsoft|Apple|Google|Amazon|Facebook|Instagram|WhatsApp|PayPal|Bank of America|Chase|Wells Fargo)/gi,
      /(?:your\s+(?:account|profile))/gi
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[0]
    }
    
    return ''
  }

  const handleSubmit = async (template: ReportingTemplate) => {
    setIsSubmitting(true)
    
    try {
      const form = new FormData()
      
      // Add all form fields
      template.fields.forEach(field => {
        if (formData[field.name]) {
          form.append(field.name, formData[field.name])
        }
      })

      // Add additional context
      form.append('guardian_alert_id', alert.id)
      form.append('guardian_alert_title', alert.title)
      form.append('guardian_alert_category', alert.category)

      if (template.email) {
        // For email-based reporting, create mailto link
        const subject = encodeURIComponent(formData.subject || `Report: ${template.name}`)
        const body = encodeURIComponent(Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n\n'))
        window.open(`mailto:${template.email}?subject=${subject}&body=${body}`)
      } else {
        // For web-based reporting, submit form
        const response = await fetch(template.url, {
          method: 'POST',
          body: form,
          redirect: 'follow'
        })
        
        if (response.ok) {
          window.alert(`Successfully submitted to ${template.name}!`)
        } else {
          window.alert(`Failed to submit to ${template.name}. Please try again.`)
        }
      }
    } catch (error) {
      console.error('Reporting error:', error)
      window.alert('Error submitting report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
          🛡️ One-Click Threat Reporting
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Report this threat to official authorities with pre-filled information.
        </p>
      </div>

      {/* Alert Summary */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
          Alert Being Reported
        </h4>
        <div className="text-sm space-y-1">
          <div><strong>Title:</strong> {alert.title}</div>
          <div><strong>Category:</strong> {alert.category}</div>
          <div><strong>Severity:</strong> {alert.severity}</div>
          <div><strong>Description:</strong> {alert.description}</div>
        </div>
      </div>

      {/* Reporting Templates */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
          Choose Reporting Authority:
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REPORTING_TEMPLATES.map((template) => (
            <div
              key={template.name}
              className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => handleTemplateSelect(template)}
            >
              <h5 className="font-medium text-slate-800 dark:text-slate-100 mb-1">
                {template.name}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                {template.description}
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                📧 {template.email ? 'Email Report' : 'Web Form'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Template Form */}
      {selectedTemplate && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
            Reporting to: {selectedTemplate.name}
          </h5>
          
          <div className="space-y-3">
            {selectedTemplate.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.name === 'details' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    placeholder={field.label}
                  />
                ) : (
                  <input
                    type={field.name === 'date' ? 'datetime-local' : field.name === 'amount' ? 'number' : 'text'}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleSubmit(selectedTemplate)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  📤 Submit to {selectedTemplate.name}
                </>
              )}
            </button>
            
            <button
              onClick={() => setSelectedTemplate(null)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
