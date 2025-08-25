// Combined Integration Service for Supabase, N8N, and Uptime Robot
import { supabase } from './supabase'
import { n8nService, N8NWorkflow } from './n8n'
import { uptimeRobotService, UptimeRobotMonitor } from './uptime-robot'

export interface IntegrationStatus {
  supabase: boolean
  n8n: boolean
  uptimeRobot: boolean
}

export interface MonitoringAlert {
  id: string
  client_id: string
  monitor_id: string
  status: 'up' | 'down' | 'warning'
  message: string
  timestamp: string
  resolved: boolean
  resolved_at?: string
}

export interface AutomatedWorkflow {
  id: string
  name: string
  description: string
  trigger: 'uptime_alert' | 'status_change' | 'manual' | 'scheduled'
  n8n_workflow_id: string
  active: boolean
  created_at: string
  updated_at: string
}

class IntegrationService {
  // Test all service connections
  async testAllConnections(): Promise<IntegrationStatus> {
    const [supabaseStatus, n8nStatus, uptimeRobotStatus] = await Promise.allSettled([
      this.testSupabaseConnection(),
      this.testN8NConnection(),
      this.testUptimeRobotConnection(),
    ])

    return {
      supabase: supabaseStatus.status === 'fulfilled' && supabaseStatus.value,
      n8n: n8nStatus.status === 'fulfilled' && n8nStatus.value,
      uptimeRobot: uptimeRobotStatus.status === 'fulfilled' && uptimeRobotStatus.value,
    }
  }

  // Test Supabase connection
  async testSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('categories').select('count').limit(1)
      return !error
    } catch (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
  }

  // Test N8N connection
  async testN8NConnection(): Promise<boolean> {
    return n8nService.testConnection()
  }

  // Test Uptime Robot connection
  async testUptimeRobotConnection(): Promise<boolean> {
    return uptimeRobotService.testConnection()
  }

  // Sync Uptime Robot monitors with Supabase
  async syncUptimeRobotMonitors(): Promise<void> {
    try {
      const response = await uptimeRobotService.getMonitors(100, 0)
      const monitors = response.monitors || []

      for (const monitor of monitors) {
        // Check if monitor exists in Supabase
        const { data: existingMonitor } = await supabase
          .from('status_monitors')
          .select('*')
          .eq('uptime_robot_id', monitor.id)
          .single()

        const monitorData = {
          uptime_robot_id: monitor.id,
          url: monitor.url,
          status: this.mapUptimeRobotStatus(monitor.status),
          last_checked: new Date().toISOString(),
          response_time: monitor.average_response_time,
          uptime_ratio: parseFloat(monitor.uptime_ratio),
        }

        if (existingMonitor) {
          // Update existing monitor
          await supabase
            .from('status_monitors')
            .update(monitorData)
            .eq('id', existingMonitor.id)
        } else {
          // Create new monitor
          await supabase
            .from('status_monitors')
            .insert(monitorData)
        }
      }

      console.log(`Synced ${monitors.length} Uptime Robot monitors`)
    } catch (error) {
      console.error('Failed to sync Uptime Robot monitors:', error)
      throw error
    }
  }

  // Map Uptime Robot status to our status format
  private mapUptimeRobotStatus(status: number): 'online' | 'offline' | 'maintenance' {
    switch (status) {
      case 2: return 'online'
      case 8:
      case 9: return 'offline'
      case 0: return 'maintenance'
      default: return 'offline'
    }
  }

  // Create automated workflow for monitoring alerts
  async createMonitoringWorkflow(
    name: string,
    description: string,
    trigger: AutomatedWorkflow['trigger'],
    n8nWorkflowData: Partial<N8NWorkflow>
  ): Promise<AutomatedWorkflow> {
    try {
      // Create N8N workflow
      const n8nWorkflow = await n8nService.createWorkflow({
        name,
        active: true,
        ...n8nWorkflowData,
      })

      // Create workflow record in Supabase
      const { data: workflow, error } = await supabase
        .from('automated_workflows')
        .insert({
          name,
          description,
          trigger,
          n8n_workflow_id: n8nWorkflow.id,
          active: true,
        })
        .select()
        .single()

      if (error) throw error

      return workflow
    } catch (error) {
      console.error('Failed to create monitoring workflow:', error)
      throw error
    }
  }

  // Handle Uptime Robot alert and trigger N8N workflow
  async handleUptimeRobotAlert(monitorId: string, status: number): Promise<void> {
    try {
      // Get monitor details
      const monitorResponse = await uptimeRobotService.getMonitor(monitorId)
      const monitor = monitorResponse.monitor

      if (!monitor) {
        throw new Error(`Monitor ${monitorId} not found`)
      }

      // Create alert record in Supabase
      const alertData = {
        monitor_id: monitorId,
        status: this.mapUptimeRobotStatus(status),
        message: `Monitor ${monitor.friendly_name} is ${uptimeRobotService.getStatusText(status)}`,
        timestamp: new Date().toISOString(),
        resolved: false,
      }

      const { data: alert, error: alertError } = await supabase
        .from('monitoring_alerts')
        .insert(alertData)
        .select()
        .single()

      if (alertError) throw alertError

      // Find and trigger relevant N8N workflows
      const { data: workflows } = await supabase
        .from('automated_workflows')
        .select('*')
        .eq('trigger', 'uptime_alert')
        .eq('active', true)

      if (workflows) {
        for (const workflow of workflows) {
          try {
            await n8nService.executeWorkflow(workflow.n8n_workflow_id, {
              alert: alert,
              monitor: monitor,
              status: status,
              timestamp: new Date().toISOString(),
            })
          } catch (error) {
            console.error(`Failed to execute workflow ${workflow.id}:`, error)
          }
        }
      }

      console.log(`Handled alert for monitor ${monitorId}`)
    } catch (error) {
      console.error('Failed to handle Uptime Robot alert:', error)
      throw error
    }
  }

  // Get monitoring dashboard data
  async getMonitoringDashboard() {
    try {
      const [uptimeSummary, supabaseMonitors, alerts] = await Promise.all([
        uptimeRobotService.getMonitorsSummary(),
        supabase.from('status_monitors').select('*'),
        supabase.from('monitoring_alerts').select('*').eq('resolved', false).order('timestamp', { ascending: false }).limit(10),
      ])

      return {
        uptimeSummary,
        monitors: supabaseMonitors.data || [],
        recentAlerts: alerts.data || [],
      }
    } catch (error) {
      console.error('Failed to get monitoring dashboard data:', error)
      throw error
    }
  }

  // Setup automated monitoring for a client
  async setupClientMonitoring(clientId: string, websiteUrl: string): Promise<void> {
    try {
      // Create Uptime Robot monitor
      const monitorResponse = await uptimeRobotService.createMonitor({
        friendly_name: `Client ${clientId} - ${websiteUrl}`,
        url: websiteUrl,
        type: 1, // HTTP(s)
        interval: 300, // 5 minutes
      })

      if (monitorResponse.monitor) {
        // Create status monitor in Supabase
        await supabase.from('status_monitors').insert({
          client_id: clientId,
          uptime_robot_id: monitorResponse.monitor.id,
          url: websiteUrl,
          status: 'online',
          last_checked: new Date().toISOString(),
        })

        console.log(`Setup monitoring for client ${clientId}`)
      }
    } catch (error) {
      console.error('Failed to setup client monitoring:', error)
      throw error
    }
  }

  // Get integration health status
  async getIntegrationHealth(): Promise<{
    status: IntegrationStatus
    lastSync: string
    activeWorkflows: number
    activeMonitors: number
  }> {
    try {
      const [status, workflows, monitors] = await Promise.all([
        this.testAllConnections(),
        supabase.from('automated_workflows').select('count').eq('active', true),
        supabase.from('status_monitors').select('count'),
      ])

      return {
        status,
        lastSync: new Date().toISOString(),
        activeWorkflows: workflows.count || 0,
        activeMonitors: monitors.count || 0,
      }
    } catch (error) {
      console.error('Failed to get integration health:', error)
      throw error
    }
  }
}

export const integrationService = new IntegrationService() 