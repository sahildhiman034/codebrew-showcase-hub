import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Clock, Wifi, WifiOff, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface UptimeStatus {
  id: string
  name: string
  url: string
  status: 'up' | 'down' | 'maintenance'
  uptime: number
  responseTime: number
  lastCheck: string
  type: 'website' | 'api' | 'server'
}

interface UptimeMonitorProps {
  apiKey?: string
  monitors?: UptimeStatus[]
}

export const UptimeMonitor: React.FC<UptimeMonitorProps> = ({
  apiKey,
  monitors = []
}) => {
  const [uptimeData, setUptimeData] = useState<UptimeStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for demonstration
  const mockMonitors: UptimeStatus[] = [
    {
      id: "1",
      name: "Main Website",
      url: "https://example.com",
      status: "up",
      uptime: 99.98,
      responseTime: 245,
      lastCheck: "2024-01-15T10:30:00Z",
      type: "website"
    },
    {
      id: "2",
      name: "API Server",
      url: "https://api.example.com",
      status: "up",
      uptime: 99.95,
      responseTime: 180,
      lastCheck: "2024-01-15T10:30:00Z",
      type: "api"
    },
    {
      id: "3",
      name: "Database Server",
      url: "https://db.example.com",
      status: "down",
      uptime: 98.5,
      responseTime: 0,
      lastCheck: "2024-01-15T10:25:00Z",
      type: "server"
    }
  ]

  useEffect(() => {
    const fetchUptimeData = async () => {
      setLoading(true)
      try {
        if (apiKey) {
          // Real Uptime Robot API call
          const response = await fetch(`https://api.uptimerobot.com/v2/getMonitors`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
              api_key: apiKey,
              format: 'json',
              logs: '1'
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to fetch uptime data')
          }
          
          const data = await response.json()
          // Transform Uptime Robot data to our format
          const transformedData = data.monitors.map((monitor: any) => ({
            id: monitor.id,
            name: monitor.friendly_name,
            url: monitor.url,
            status: monitor.status === 2 ? 'up' : monitor.status === 9 ? 'down' : 'maintenance',
            uptime: parseFloat(monitor.uptime_ratio) || 0,
            responseTime: monitor.response_times?.[0]?.value || 0,
            lastCheck: monitor.last_check_time,
            type: monitor.type === 1 ? 'website' : monitor.type === 2 ? 'api' : 'server'
          }))
          
          setUptimeData(transformedData)
        } else {
          // Use mock data if no API key
          setUptimeData(mockMonitors)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load uptime data')
        setUptimeData(mockMonitors) // Fallback to mock data
      } finally {
        setLoading(false)
      }
    }

    fetchUptimeData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUptimeData, 30000)
    return () => clearInterval(interval)
  }, [apiKey])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'down':
        return <WifiOff className="h-4 w-4 text-red-500" />
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'up':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Online</Badge>
      case 'down':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Offline</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Maintenance</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Unknown</Badge>
    }
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-green-600"
    if (uptime >= 99.0) return "text-yellow-600"
    return "text-red-600"
  }

  const formatLastCheck = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hours ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Uptime Monitor
          </CardTitle>
          <CardDescription>Loading monitoring data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Uptime Monitor
            </CardTitle>
            <CardDescription>
              Real-time monitoring of your services
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Wifi className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {uptimeData.map((monitor) => (
          <motion.div
            key={monitor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(monitor.status)}
                <div>
                  <h4 className="font-medium text-gray-900">{monitor.name}</h4>
                  <p className="text-sm text-gray-500">{monitor.url}</p>
                </div>
              </div>
              {getStatusBadge(monitor.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600">Uptime</span>
                  <span className={`font-medium ${getUptimeColor(monitor.uptime)}`}>
                    {monitor.uptime.toFixed(2)}%
                  </span>
                </div>
                <Progress value={monitor.uptime} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium text-gray-900">
                    {monitor.responseTime > 0 ? `${monitor.responseTime}ms` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Check</span>
                  <span className="text-gray-900">
                    {formatLastCheck(monitor.lastCheck)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Overall Uptime</span>
            <span className="font-medium text-green-600">
              {uptimeData.length > 0 
                ? (uptimeData.reduce((sum, m) => sum + m.uptime, 0) / uptimeData.length).toFixed(2)
                : 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
