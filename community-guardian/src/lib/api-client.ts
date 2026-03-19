import { apiBaseUrl } from './apiBase'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

export interface PaginatedAlertsResponse {
  data: any[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiBaseUrl()
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.text()
      
      let parsedData: T | undefined
      try {
        parsedData = response.ok ? JSON.parse(data) : undefined
      } catch {
        parsedData = undefined
      }
      
      return {
        data: parsedData,
        error: response.ok ? undefined : data,
        status: response.status,
      }
    } catch (error) {
      return {
        data: undefined,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  // Alerts
  async getAlerts(params?: Record<string, any>): Promise<ApiResponse<PaginatedAlertsResponse>> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/alerts${query}`)
  }

  async createAlert(alert: any): Promise<ApiResponse<any>> {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    })
  }

  async getAlert(id: string): Promise<ApiResponse<any>> {
    return this.request(`/alerts/${id}`)
  }

  async updateAlert(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteAlert(id: string): Promise<ApiResponse<any>> {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE',
    })
  }

  // Categorization
  async categorizeText(text: string): Promise<ApiResponse<any>> {
    return this.request('/categorize', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  }

  // Guardians
  async getGuardians(): Promise<ApiResponse<any[]>> {
    return this.request('/guardians')
  }

  async createGuardian(guardian: any): Promise<ApiResponse<any>> {
    return this.request('/guardians', {
      method: 'POST',
      body: JSON.stringify(guardian),
    })
  }

  async deleteGuardian(id: string): Promise<ApiResponse<any>> {
    return this.request(`/guardians/${id}`, {
      method: 'DELETE',
    })
  }

  // Preferences
  async getPreferences(): Promise<ApiResponse<any>> {
    return this.request('/preferences')
  }

  async updatePreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.request('/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    })
  }

  // Verification methods
  async verifyAlert(id: string, verificationType: string): Promise<ApiResponse<any>> {
    return this.request(`/alerts/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verification_type: verificationType }),
    })
  }

  async getVerificationHistory(id: string): Promise<ApiResponse<any[]>> {
    return this.request(`/alerts/${id}/verifications`)
  }

  // Query method
  async query(params: { question: string }): Promise<ApiResponse<any>> {
    return this.request('/query', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }
}

export const apiClient = new ApiClient()
