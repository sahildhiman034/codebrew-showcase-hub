// N8N Integration Service
export interface N8NWorkflow {
  id: string
  name: string
  active: boolean
  nodes: N8NNode[]
  connections: Record<string, any>
  settings: Record<string, any>
  staticData: Record<string, any>
  tags: string[]
  versionId: string
  meta: {
    templateCredsSetupCompleted: boolean
    templateCredsName: string
    instanceId: string
  }
  updatedAt: string
  createdAt: string
}

export interface N8NNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters: Record<string, any>
  credentials?: Record<string, any>
}

export interface N8NExecution {
  id: string
  finished: boolean
  mode: string
  retryOf: string | null
  retrySuccessId: string | null
  startedAt: string
  stoppedAt: string | null
  waitTill: string | null
  workflowId: string
  workflowData: {
    id: string
    name: string
    nodes: N8NNode[]
    connections: Record<string, any>
    active: boolean
    settings: Record<string, any>
    staticData: Record<string, any>
    tags: string[]
    versionId: string
    meta: Record<string, any>
    updatedAt: string
    createdAt: string
  }
  data: Record<string, any>
}

class N8NService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678'
    this.apiKey = import.meta.env.VITE_N8N_API_KEY || ''
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey }),
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`N8N API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('N8N API request failed:', error)
      throw error
    }
  }

  // Get all workflows
  async getWorkflows(): Promise<N8NWorkflow[]> {
    return this.request('/api/v1/workflows')
  }

  // Get a specific workflow
  async getWorkflow(id: string): Promise<N8NWorkflow> {
    return this.request(`/api/v1/workflows/${id}`)
  }

  // Activate a workflow
  async activateWorkflow(id: string): Promise<N8NWorkflow> {
    return this.request(`/api/v1/workflows/${id}/activate`, {
      method: 'POST',
    })
  }

  // Deactivate a workflow
  async deactivateWorkflow(id: string): Promise<N8NWorkflow> {
    return this.request(`/api/v1/workflows/${id}/deactivate`, {
      method: 'POST',
    })
  }

  // Execute a workflow
  async executeWorkflow(id: string, data?: any): Promise<N8NExecution> {
    return this.request(`/api/v1/workflows/${id}/execute`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Get workflow executions
  async getExecutions(workflowId?: string, limit = 50): Promise<N8NExecution[]> {
    const params = new URLSearchParams()
    if (workflowId) params.append('workflowId', workflowId)
    params.append('limit', limit.toString())

    return this.request(`/api/v1/executions?${params.toString()}`)
  }

  // Trigger webhook
  async triggerWebhook(webhookId: string, data: any): Promise<any> {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || `${this.baseUrl}/webhook`
    const url = `${webhookUrl}/${webhookId}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Webhook trigger failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Webhook trigger failed:', error)
      throw error
    }
  }

  // Create a new workflow
  async createWorkflow(workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> {
    return this.request('/api/v1/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    })
  }

  // Update a workflow
  async updateWorkflow(id: string, workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> {
    return this.request(`/api/v1/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    })
  }

  // Delete a workflow
  async deleteWorkflow(id: string): Promise<void> {
    return this.request(`/api/v1/workflows/${id}`, {
      method: 'DELETE',
    })
  }

  // Get system status
  async getSystemStatus(): Promise<any> {
    return this.request('/api/v1/system/status')
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getSystemStatus()
      return true
    } catch (error) {
      return false
    }
  }
}

export const n8nService = new N8NService() 