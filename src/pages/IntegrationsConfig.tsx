import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Settings, 
  Database, 
  Zap, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Save,
  TestTube,
  Key,
  Globe,
  Server
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { integrationService } from "@/lib/integrations"
import { n8nService } from "@/lib/n8n"
import { uptimeRobotService } from "@/lib/uptime-robot"

interface IntegrationConfig {
  supabase: {
    url: string
    anonKey: string
    enabled: boolean
  }
  n8n: {
    baseUrl: string
    apiKey: string
    webhookUrl: string
    enabled: boolean
  }
  uptimeRobot: {
    apiKey: string
    baseUrl: string
    enabled: boolean
  }
}

export default function IntegrationsConfig() {
  const [config, setConfig] = useState<IntegrationConfig>({
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      enabled: true
    },
    n8n: {
      baseUrl: import.meta.env.VITE_N8N_BASE_URL || '',
      apiKey: import.meta.env.VITE_N8N_API_KEY || '',
      webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
      enabled: false
    },
    uptimeRobot: {
      apiKey: import.meta.env.VITE_UPTIME_ROBOT_API_KEY || '',
      baseUrl: import.meta.env.VITE_UPTIME_ROBOT_BASE_URL || '',
      enabled: false
    }
  })

  const [status, setStatus] = useState<any>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkIntegrationStatus()
  }, [])

  const checkIntegrationStatus = async () => {
    try {
      const integrationStatus = await integrationService.testAllConnections()
      setStatus(integrationStatus)
    } catch (error) {
      console.error('Failed to check integration status:', error)
    }
  }

  const testConnection = async (service: string) => {
    setTesting(service)
    try {
      let result = false
      
      switch (service) {
        case 'supabase':
          result = await integrationService.testSupabaseConnection()
          break
        case 'n8n':
          result = await n8nService.testConnection()
          break
        case 'uptimeRobot':
          result = await uptimeRobotService.testConnection()
          break
      }

      // Update status
      setStatus(prev => ({
        ...prev,
        [service]: result
      }))

      return result
    } catch (error) {
      console.error(`Failed to test ${service} connection:`, error)
      return false
    } finally {
      setTesting(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, you would save these to environment variables or a config service
      console.log('Saving configuration:', config)
      
      // For now, just update the status
      await checkIntegrationStatus()
      
      // Show success message
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Failed to save configuration:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (service: string) => {
    const isConnected = status?.[service]
    const isTesting = testing === service

    if (isTesting) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    }

    return isConnected ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (service: string) => {
    const isConnected = status?.[service]
    const isTesting = testing === service

    if (isTesting) {
      return <Badge variant="secondary">Testing...</Badge>
    }

    return isConnected ? (
      <Badge className="bg-green-100 text-green-800">Connected</Badge>
    ) : (
      <Badge variant="destructive">Disconnected</Badge>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-text">Integration Configuration</h1>
          <p className="text-muted-foreground">
            Configure and manage your Supabase, N8N, and Uptime Robot integrations
          </p>
        </div>
        <Button 
          onClick={checkIntegrationStatus} 
          variant="outline"
          className="btn-secondary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Status
        </Button>
      </motion.div>

      {/* Supabase Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Supabase Database
                    {getStatusIcon('supabase')}
                  </CardTitle>
                  <CardDescription>
                    Configure your Supabase database connection
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge('supabase')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input
                  id="supabase-url"
                  value={config.supabase.url}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    supabase: { ...prev.supabase, url: e.target.value }
                  }))}
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supabase-key">Anonymous Key</Label>
                <Input
                  id="supabase-key"
                  type="password"
                  value={config.supabase.anonKey}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    supabase: { ...prev.supabase, anonKey: e.target.value }
                  }))}
                  placeholder="Your Supabase anon key"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="supabase-enabled"
                  checked={config.supabase.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    supabase: { ...prev.supabase, enabled: checked }
                  }))}
                />
                <Label htmlFor="supabase-enabled">Enable Supabase Integration</Label>
              </div>
              <Button
                onClick={() => testConnection('supabase')}
                disabled={testing === 'supabase'}
                variant="outline"
                size="sm"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* N8N Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    N8N Workflow Automation
                    {getStatusIcon('n8n')}
                  </CardTitle>
                  <CardDescription>
                    Configure N8N for automated workflows and alerts
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge('n8n')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="n8n-url">N8N Base URL</Label>
                <Input
                  id="n8n-url"
                  value={config.n8n.baseUrl}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    n8n: { ...prev.n8n, baseUrl: e.target.value }
                  }))}
                  placeholder="http://localhost:5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="n8n-api-key">API Key</Label>
                <Input
                  id="n8n-api-key"
                  type="password"
                  value={config.n8n.apiKey}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    n8n: { ...prev.n8n, apiKey: e.target.value }
                  }))}
                  placeholder="Your N8N API key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="n8n-webhook">Webhook URL</Label>
                <Input
                  id="n8n-webhook"
                  value={config.n8n.webhookUrl}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    n8n: { ...prev.n8n, webhookUrl: e.target.value }
                  }))}
                  placeholder="http://localhost:5678/webhook"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="n8n-enabled"
                  checked={config.n8n.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    n8n: { ...prev.n8n, enabled: checked }
                  }))}
                />
                <Label htmlFor="n8n-enabled">Enable N8N Integration</Label>
              </div>
              <Button
                onClick={() => testConnection('n8n')}
                disabled={testing === 'n8n'}
                variant="outline"
                size="sm"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Uptime Robot Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Uptime Robot Monitoring
                    {getStatusIcon('uptimeRobot')}
                  </CardTitle>
                  <CardDescription>
                    Configure Uptime Robot for website monitoring
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge('uptimeRobot')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="uptime-api-key">API Key</Label>
                <Input
                  id="uptime-api-key"
                  type="password"
                  value={config.uptimeRobot.apiKey}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    uptimeRobot: { ...prev.uptimeRobot, apiKey: e.target.value }
                  }))}
                  placeholder="Your Uptime Robot API key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uptime-url">API Base URL</Label>
                <Input
                  id="uptime-url"
                  value={config.uptimeRobot.baseUrl}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    uptimeRobot: { ...prev.uptimeRobot, baseUrl: e.target.value }
                  }))}
                  placeholder="https://api.uptimerobot.com/v2"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="uptime-enabled"
                  checked={config.uptimeRobot.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    uptimeRobot: { ...prev.uptimeRobot, enabled: checked }
                  }))}
                />
                <Label htmlFor="uptime-enabled">Enable Uptime Robot Integration</Label>
              </div>
              <Button
                onClick={() => testConnection('uptimeRobot')}
                disabled={testing === 'uptimeRobot'}
                variant="outline"
                size="sm"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-end"
      >
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </motion.div>

      {/* Integration Status Summary */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Integration Status Summary
              </CardTitle>
              <CardDescription>
                Current status of all configured integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Supabase</span>
                  </div>
                  {getStatusBadge('supabase')}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>N8N</span>
                  </div>
                  {getStatusBadge('n8n')}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Uptime Robot</span>
                  </div>
                  {getStatusBadge('uptimeRobot')}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
} 