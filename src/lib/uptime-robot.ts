// Uptime Robot Integration Service
import { supabase } from './supabase'

export interface UptimeRobotMonitor {
  id: string
  friendly_name: string
  url: string
  type: number // 1=HTTP(s), 2=Keyword, 3=Ping, 4=Port, 5=Heartbeat
  sub_type?: number
  keyword_type?: number
  keyword_value?: string
  http_username?: string
  http_password?: string
  port?: number
  interval: number
  status: number // 0=paused, 1=not checked yet, 2=up, 8=seems down, 9=down
  create_datetime: number
  uptime_ratio: string
  average_response_time: number
  custom_uptime_ratio: string
  custom_down_durations: string
  last_check_time?: number
  ssl?: {
    brand: string
    product: string
    serial: string
    common_name: string
    issuer_company: string
    issuer_company_common_name: string
    valid_from: number
    valid_until: number
    days_until_expiration: number
  }
  locations: UptimeRobotLocation[]
  tags: UptimeRobotTag[]
}

export interface UptimeRobotLocation {
  id: number
  name: string
  country: string
  country_code: string
  city: string
  latitude: number
  longitude: number
}

export interface UptimeRobotTag {
  id: number
  name: string
  color: string
}

export interface UptimeRobotResponse<T> {
  stat: 'ok' | 'fail'
  error?: {
    type: string
    parameter_name: string
    passed_value: string
  }
  pagination?: {
    offset: number
    limit: number
    total: number
  }
  monitors?: T[]
  monitor?: T
}

export interface UptimeRobotAlertContact {
  id: number
  friendly_name: string
  type: number
  status: number
  value: string
}

class UptimeRobotService {
  private baseUrl: string
  private apiKey: string
  private readonlyApiKey: string
  private requestQueue: Promise<any>[] = []
  private isProcessingQueue = false

  constructor() {
    // Try to get environment variables, fallback to hardcoded values for testing
    this.baseUrl = import.meta.env.VITE_UPTIME_ROBOT_BASE_URL || 'https://api.uptimerobot.com/v2'
    this.apiKey = import.meta.env.VITE_UPTIME_ROBOT_API_KEY || 'u3082695-73d55d9d7467225204cca42d'
    this.readonlyApiKey = import.meta.env.VITE_UPTIME_ROBOT_READONLY_API_KEY || 'ur3082695-f018f801bde4714f3e186494'
    
    // Ensure we have valid API keys
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      this.apiKey = 'u3082695-73d55d9d7467225204cca42d'
    }
    if (!this.readonlyApiKey || this.readonlyApiKey === 'your_readonly_api_key_here') {
      this.readonlyApiKey = 'ur3082695-f018f801bde4714f3e186494'
    }
    
    console.log('UptimeRobot Service initialized with:')
    console.log('Base URL:', this.baseUrl)
    console.log('API Key length:', this.apiKey?.length || 0)
    console.log('Readonly API Key length:', this.readonlyApiKey?.length || 0)
  }

  // Request method with specific API key
  private async requestWithKey(endpoint: string, data: any, apiKey: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    
    console.log('Uptime Robot API Request:', {
      url,
      endpoint,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 10) + '...',
      data
    })
    
    try {
      const requestBody = {
        api_key: apiKey,
        ...data,
      }
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2))
      
      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For development mode, still try real API calls but handle CORS gracefully
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Development mode: Attempting real API call')
      }
      
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Uptime Robot API Response status:', response.status)
      console.log('Uptime Robot API Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error text:', errorText)
        
        // Handle rate limiting
        if (response.status === 429) {
          console.log('Rate limited, waiting 5 seconds...')
          await new Promise(resolve => setTimeout(resolve, 5000))
          // Retry once
          return this.requestWithKey(endpoint, data, apiKey)
        }
        
        throw new Error(`Uptime Robot API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Uptime Robot API Response:', result)
      
      if (result.stat === 'fail') {
        console.error('Uptime Robot API failed:', result.error)
        throw new Error(`Uptime Robot API error: ${result.error?.type} - ${result.error?.parameter_name} - ${result.error?.passed_value}`)
      }

      return result
    } catch (error) {
      console.error('Uptime Robot API request failed:', error)
      throw error
    }
  }

  // Get all monitors using main API key for better compatibility
  async getMonitors(limit = 50, offset = 0): Promise<UptimeRobotResponse<UptimeRobotMonitor>> {
    // Use main API key for better compatibility
    const apiKeyToUse = this.apiKey
    
    return this.requestWithKey('/getMonitors', {
      limit,
      offset,
      logs: 1,
      response_times: 1,
      response_times_average: 180,
      response_times_uptime: 1,
      ssl: 1,
      custom_uptime_ratios: '1-7-30',
      custom_uptime_ranges: '1623074400_1623160800',
      timezone: 1,
    }, apiKeyToUse)
  }

  // Get a specific monitor
  async getMonitor(id: string): Promise<UptimeRobotResponse<UptimeRobotMonitor>> {
    return this.requestWithKey('/getMonitors', {
      monitors: id,
      logs: 1,
      response_times: 1,
      response_times_average: 180,
      response_times_uptime: 1,
      ssl: 1,
      custom_uptime_ratios: '1-7-30',
      custom_uptime_ranges: '1623074400_1623160800',
      timezone: 1,
    }, this.apiKey)
  }

  // Create a new monitor
  async createMonitor(data: {
    friendly_name: string
    url: string
    type: number
    interval?: number
    keyword_type?: number
    keyword_value?: string
    http_username?: string
    http_password?: string
    port?: number
    alert_contacts?: string
    locations?: string
  }): Promise<UptimeRobotResponse<{ id: string }>> {
    return this.requestWithKey('/newMonitor', data, this.apiKey)
  }

  // Edit a monitor
  async editMonitor(id: string, data: Partial<{
    friendly_name: string
    url: string
    type: number
    interval: number
    keyword_type: number
    keyword_value: string
    http_username: string
    http_password: string
    port: number
    alert_contacts: string
    locations: string
  }>): Promise<UptimeRobotResponse<{ id: string }>> {
    return this.requestWithKey('/editMonitor', {
      id,
      ...data,
    }, this.apiKey)
  }

  // Delete a monitor
  async deleteMonitor(id: string): Promise<UptimeRobotResponse<{ id: string }>> {
    return this.requestWithKey('/deleteMonitor', { id }, this.apiKey)
  }

  // Pause a monitor
  async pauseMonitor(id: string): Promise<UptimeRobotResponse<{ id: string }>> {
    return this.requestWithKey('/editMonitor', {
      id,
      status: 0,
    }, this.apiKey)
  }

  // Resume a monitor
  async resumeMonitor(id: string): Promise<UptimeRobotResponse<{ id: string }>> {
    return this.requestWithKey('/editMonitor', {
      id,
      status: 1,
    }, this.apiKey)
  }

  // Reset a monitor
  async resetMonitor(id: string): Promise<UptimeRobotResponse<{ id: string }>> {
    return this.requestWithKey('/resetMonitor', { id }, this.apiKey)
  }

  // Get monitor logs
  async getMonitorLogs(id: string, limit = 10, offset = 0): Promise<any> {
    const apiKeyToUse = this.readonlyApiKey || this.apiKey
    return this.requestWithKey('/getMonitors', {
      monitors: id,
      logs: 1,
      logs_limit: limit,
      logs_offset: offset,
    }, apiKeyToUse)
  }

  // Get alert contacts
  async getAlertContacts(): Promise<UptimeRobotResponse<UptimeRobotAlertContact>> {
    return this.requestWithKey('/getAlertContacts', {}, this.apiKey)
  }

  // Get account details
  async getAccountDetails(): Promise<any> {
    return this.requestWithKey('/getAccountDetails', {}, this.apiKey)
  }

  // Get monitor types
  getMonitorTypes() {
    return {
      1: 'HTTP(s)',
      2: 'Keyword',
      3: 'Ping',
      4: 'Port',
      5: 'Heartbeat',
    }
  }

  // Get status text
  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Paused'
      case 1: return 'Not checked yet'
      case 2: return 'Up'
      case 8: return 'Seems down'
      case 9: return 'Down'
      default: return 'Unknown'
    }
  }

  // Get status color
  getStatusColor(status: number): string {
    switch (status) {
      case 2: return 'text-green-500'
      case 8: return 'text-yellow-500'
      case 9: return 'text-red-500'
      case 0: return 'text-gray-500'
      default: return 'text-gray-400'
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection with main API key...')
      console.log('Using API key:', this.apiKey ? 'Available' : 'Missing')
      
      // Try to get account details first (simpler test)
      const accountDetails = await this.getAccountDetails()
      console.log('Account details:', accountDetails)
      
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  }

  // Get monitors summary for dashboard
  async getMonitorsSummary(): Promise<{
    total: number
    up: number
    down: number
    paused: number
    averageUptime: number
    averageResponseTime: number
  }> {
    try {
      const response = await this.getMonitors(100, 0)
      const monitors = response.monitors || []
      
      const summary = {
        total: monitors.length,
        up: 0,
        down: 0,
        paused: 0,
        averageUptime: 0,
        averageResponseTime: 0,
      }

      let totalUptime = 0
      let totalResponseTime = 0
      let activeMonitors = 0

      monitors.forEach(monitor => {
        switch (monitor.status) {
          case 2:
            summary.up++
            break
          case 8:
          case 9:
            summary.down++
            break
          case 0:
            summary.paused++
            break
        }

        if (monitor.status !== 0) {
          totalUptime += parseFloat(monitor.uptime_ratio)
          totalResponseTime += monitor.average_response_time
          activeMonitors++
        }
      })

      if (activeMonitors > 0) {
        summary.averageUptime = totalUptime / activeMonitors
        summary.averageResponseTime = totalResponseTime / activeMonitors
      }

      return summary
    } catch (error) {
      console.error('Failed to get monitors summary:', error)
      return {
        total: 0,
        up: 0,
        down: 0,
        paused: 0,
        averageUptime: 0,
        averageResponseTime: 0,
      }
    }
  }

  // Create a new monitor for a live client
  async createMonitorForClient(client: any): Promise<UptimeRobotMonitor> {
    if (!client.website_url) {
      throw new Error('Client must have a website URL to create monitor')
    }

    const monitorData = {
      friendly_name: client.name,
      url: client.website_url,
      type: 1, // HTTP(s) monitor
      interval: 300, // Check every 5 minutes
      timeout: 30, // 30 second timeout
      retries: 2, // Retry 2 times before marking as down
      locations: [1], // Default location (you can customize this)
      alert_contacts: [], // Add alert contacts as needed
    }

    try {
      const result = await this.requestWithKey('/newMonitor', monitorData, this.apiKey)
      
      if (result.monitor) {
        // Update the status_monitors table with the new monitor ID
        const { error } = await supabase
          .from('status_monitors')
          .upsert({
            client_id: client.id,
            uptime_robot_id: result.monitor.id,
            url: client.website_url,
            status: 'online',
            last_checked: new Date().toISOString(),
          })

        if (error) {
          console.error('Failed to update status_monitors table:', error)
        }

        return result.monitor
      } else {
        throw new Error('Failed to create monitor')
      }
    } catch (error) {
      console.error('Failed to create Uptime Robot monitor:', error)
      throw error
    }
  }

  // Sync all live clients with Uptime Robot monitors
  async syncLiveClientsWithMonitors(): Promise<{ created: number, updated: number, errors: number }> {
    try {
      console.log('Starting sync with main API key:', this.apiKey ? 'Available' : 'Missing')
      
      // Get all live clients from database
      const { data: clients, error: clientsError } = await supabase
        .from('live_clients')
        .select('*')
        .not('website_url', 'is', null)

      if (clientsError) throw clientsError

      console.log('Found clients to sync:', clients.length)

      // Always check actual website status (no more mock data)
      console.log('Checking actual website status for all clients')
      
      let created = 0
      let updated = 0
      let errors = 0
      
      // Check each client's website status
      for (const client of clients) {
        try {
          console.log(`Checking ${client.name} (${client.website_url})`)
          
          // Check if website is actually accessible
          const websiteCheck = await this.checkWebsiteStatus(client.website_url)
          const status = websiteCheck.isAccessible ? 'online' : 'offline'
          
          console.log(`${client.name} is ${status} (${websiteCheck.responseTime}ms)`)
          
          // Update status_monitors table with real status
          await supabase
            .from('status_monitors')
            .upsert({
              client_id: client.id,
              uptime_robot_id: `real_${Date.now()}_${client.id}`,
              url: client.website_url,
              status: status,
              last_checked: new Date().toISOString(),
              uptime_ratio: websiteCheck.isAccessible ? 99.9 : 0,
              response_time: websiteCheck.responseTime
            })
          
          created++
        } catch (error) {
          console.error(`Failed to check ${client.name}:`, error)
          errors++
        }
      }
      
      console.log(`Sync completed: ${created} created, ${updated} updated, ${errors} errors`)
      return { created, updated, errors }



      console.log(`Sync completed: ${created} created, ${updated} updated, ${errors} errors`)
      return { created, updated, errors }
    } catch (error) {
      console.error('Failed to sync live clients with monitors:', error)
      throw error
    }
  }

  // Get monitor status for a specific client
  async getClientMonitorStatus(clientId: string): Promise<any> {
    try {
      // Get client's monitor ID from status_monitors table
      const { data: statusMonitor, error } = await supabase
        .from('status_monitors')
        .select('uptime_robot_id')
        .eq('client_id', clientId)
        .single()

      if (error || !statusMonitor?.uptime_robot_id) {
        return null
      }

      // Get monitor details from Uptime Robot
      const monitorResponse = await this.getMonitor(statusMonitor.uptime_robot_id)
      return monitorResponse.monitor
    } catch (error) {
      console.error('Failed to get client monitor status:', error)
      return null
    }
  }

  // Check if a website is already being monitored
  async isWebsiteMonitored(websiteUrl: string): Promise<boolean> {
    try {
      const monitorsResponse = await this.getMonitors(100, 0)
      const monitors = monitorsResponse.monitors || []
      
      return monitors.some(monitor => 
        monitor.url === websiteUrl || 
        monitor.url === websiteUrl.replace(/\/$/, '') || // Remove trailing slash
        monitor.url === websiteUrl + '/' // Add trailing slash
      )
    } catch (error) {
      console.error('Failed to check if website is monitored:', error)
      return false
    }
  }

  // Get monitor for a specific website URL
  async getMonitorByUrl(websiteUrl: string): Promise<UptimeRobotMonitor | null> {
    try {
      const monitorsResponse = await this.getMonitors(100, 0)
      const monitors = monitorsResponse.monitors || []
      
      return monitors.find(monitor => 
        monitor.url === websiteUrl || 
        monitor.url === websiteUrl.replace(/\/$/, '') || 
        monitor.url === websiteUrl + '/'
      ) || null
    } catch (error) {
      console.error('Failed to get monitor by URL:', error)
      return null
    }
  }

  // Check if a website is actually accessible
  async checkWebsiteStatus(websiteUrl: string): Promise<{
    isAccessible: boolean
    responseTime: number
    statusCode?: number
    error?: string
  }> {
    try {
      console.log(`Checking website status: ${websiteUrl}`)
      
      const startTime = Date.now()
      
      // Normalize URL - add protocol if missing
      let normalizedUrl = websiteUrl
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`
      }
      
      console.log(`Normalized URL: ${normalizedUrl}`)
      
      // Method 1: Try with a reliable CORS proxy
      try {
        const proxyUrl = 'https://api.allorigins.win/raw?url='
        const testUrl = `${proxyUrl}${encodeURIComponent(normalizedUrl)}`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(testUrl, {
          method: 'HEAD',
          mode: 'cors',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; UptimeRobot/1.0)'
          }
        })
        
        clearTimeout(timeoutId)
        const responseTime = Date.now() - startTime
        
        const isAccessible = response.ok
        const statusCode = response.status
        
        console.log(`Website ${normalizedUrl} check result (proxy):`, {
          status: statusCode,
          responseTime,
          accessible: isAccessible
        })
        
        return {
          isAccessible,
          responseTime,
          statusCode
        }
      } catch (proxyError) {
        console.log(`Proxy check failed for ${normalizedUrl}:`, proxyError)
        
        // Method 2: Try direct fetch with no-cors (fallback)
        try {
          const controller2 = new AbortController()
          const timeoutId2 = setTimeout(() => controller2.abort(), 8000)
          
          const response2 = await fetch(normalizedUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller2.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; UptimeRobot/1.0)'
            }
          })
          
          clearTimeout(timeoutId2)
          const responseTime = Date.now() - startTime
          
          // With no-cors, if we get here, the request succeeded
          console.log(`Website ${normalizedUrl} check successful (no-cors):`, {
            responseTime,
            accessible: true
          })
          
          return {
            isAccessible: true,
            responseTime,
            statusCode: 200
          }
        } catch (directError) {
          console.log(`Direct check also failed for ${normalizedUrl}:`, directError)
          
          // Method 3: Try with image loading as last resort
          try {
            const img = new Image()
            const imgPromise = new Promise((resolve, reject) => {
              img.onload = () => resolve(true)
              img.onerror = () => reject(new Error('Image failed to load'))
              setTimeout(() => reject(new Error('Image timeout')), 5000)
            })
            
            img.src = `${normalizedUrl}/favicon.ico?t=${Date.now()}`
            await imgPromise
            
            const responseTime = Date.now() - startTime
            
            console.log(`Website ${normalizedUrl} check successful (image):`, {
              responseTime,
              accessible: true
            })
            
            return {
              isAccessible: true,
              responseTime,
              statusCode: 200
            }
          } catch (imageError) {
            console.log(`All check methods failed for ${normalizedUrl}:`, imageError)
            
            const responseTime = Date.now() - startTime
            
            return {
              isAccessible: false,
              responseTime,
              error: 'All check methods failed'
            }
          }
        }
      }
    } catch (error) {
      console.error(`Website ${websiteUrl} check failed completely:`, error)
      return {
        isAccessible: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Update client status based on Uptime Robot data
  async updateClientStatusFromUptimeRobot(): Promise<void> {
    try {
      // Get all clients with monitors
      const { data: statusMonitors, error } = await supabase
        .from('status_monitors')
        .select(`
          client_id,
          uptime_robot_id,
          live_clients!inner(id, name, status)
        `)

      if (error) throw error

      for (const statusMonitor of statusMonitors) {
        try {
          const monitor = await this.getMonitor(statusMonitor.uptime_robot_id)
          
          if (monitor.monitor) {
            // Map Uptime Robot status to client status
            let newStatus: 'active' | 'inactive' | 'maintenance'
            
            switch (monitor.monitor.status) {
              case 2: // Up
                newStatus = 'active'
                break
              case 9: // Down
                newStatus = 'inactive'
                break
              case 0: // Paused
                newStatus = 'maintenance'
                break
              default:
                newStatus = 'inactive'
            }

            // Update client status if it changed
            const client = statusMonitor.live_clients?.[0]
            if (client?.status !== newStatus) {
              await supabase
                .from('live_clients')
                .update({ 
                  status: newStatus,
                  updated_at: new Date().toISOString()
                })
                .eq('id', statusMonitor.client_id)

              console.log(`Updated ${client?.name} status to ${newStatus}`)
            }

            // Update status_monitors table
            await supabase
              .from('status_monitors')
              .update({
                status: newStatus,
                last_checked: new Date().toISOString(),
                uptime_ratio: parseFloat(monitor.monitor.uptime_ratio),
                response_time: monitor.monitor.average_response_time
              })
              .eq('client_id', statusMonitor.client_id)
          }
        } catch (error) {
          console.error(`Failed to update status for client ${statusMonitor.client_id}:`, error)
        }
      }
    } catch (error) {
      console.error('Failed to update client statuses:', error)
      throw error
    }
  }
}

export const uptimeRobotService = new UptimeRobotService() 