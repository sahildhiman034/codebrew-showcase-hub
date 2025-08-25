import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UptimeDataPoint {
  timestamp: string
  responseTime: number
  status: 'up' | 'down' | 'maintenance'
  uptime: number
}

interface UptimeChartProps {
  monitorId: string
  monitorName: string
  apiKey?: string
  timeRange?: '1h' | '24h' | '7d' | '30d'
}

export const UptimeChart: React.FC<UptimeChartProps> = ({
  monitorId,
  monitorName,
  apiKey,
  timeRange = '24h'
}) => {
  const [chartData, setChartData] = useState<UptimeDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  // Mock data for demonstration
  const generateMockData = (range: string): UptimeDataPoint[] => {
    const now = new Date()
    const dataPoints: UptimeDataPoint[] = []
    
    let points = 24 // Default 24 hours
    let interval = 60 * 60 * 1000 // 1 hour in milliseconds
    
    switch (range) {
      case '1h':
        points = 60
        interval = 60 * 1000 // 1 minute
        break
      case '24h':
        points = 24
        interval = 60 * 60 * 1000 // 1 hour
        break
      case '7d':
        points = 168
        interval = 60 * 60 * 1000 // 1 hour
        break
      case '30d':
        points = 30
        interval = 24 * 60 * 60 * 1000 // 1 day
        break
    }
    
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * interval))
      const baseResponseTime = 150 + Math.random() * 200 // 150-350ms base
      const status = Math.random() > 0.95 ? 'down' : 'up' // 5% chance of downtime
      const responseTime = status === 'down' ? 0 : baseResponseTime + Math.random() * 100
      
      dataPoints.push({
        timestamp: timestamp.toISOString(),
        responseTime: Math.round(responseTime),
        status,
        uptime: status === 'up' ? 100 : 0
      })
    }
    
    return dataPoints
  }

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true)
      try {
        if (apiKey) {
          // Real Uptime Robot API call for logs
          const response = await fetch(`https://api.uptimerobot.com/v2/getMonitors`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
              api_key: apiKey,
              format: 'json',
              logs: '1',
              logs_limit: selectedTimeRange === '1h' ? 60 : 
                         selectedTimeRange === '24h' ? 24 : 
                         selectedTimeRange === '7d' ? 168 : 30
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to fetch chart data')
          }
          
          const data = await response.json()
          // Transform Uptime Robot logs to our format
          const transformedData = data.monitors
            .find((m: any) => m.id === monitorId)
            ?.logs?.map((log: any) => ({
              timestamp: log.datetime,
              responseTime: log.response_time || 0,
              status: log.type === 1 ? 'up' : log.type === 2 ? 'down' : 'maintenance',
              uptime: log.type === 1 ? 100 : 0
            })) || []
          
          setChartData(transformedData)
        } else {
          // Use mock data if no API key
          setChartData(generateMockData(selectedTimeRange))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data')
        setChartData(generateMockData(selectedTimeRange)) // Fallback to mock data
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [apiKey, monitorId, selectedTimeRange])

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime === 0) return '#ef4444' // red for downtime
    if (responseTime < 200) return '#10b981' // green for fast
    if (responseTime < 500) return '#f59e0b' // yellow for slow
    return '#ef4444' // red for very slow
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    switch (selectedTimeRange) {
      case '1h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      case '24h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      case '7d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case '30d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      default:
        return date.toLocaleString()
    }
  }

  const getAverageResponseTime = () => {
    const validTimes = chartData.filter(d => d.responseTime > 0)
    if (validTimes.length === 0) return 0
    return Math.round(validTimes.reduce((sum, d) => sum + d.responseTime, 0) / validTimes.length)
  }

  const getUptimePercentage = () => {
    if (chartData.length === 0) return 0
    const upCount = chartData.filter(d => d.status === 'up').length
    return Math.round((upCount / chartData.length) * 100)
  }

  const getMaxResponseTime = () => {
    return Math.max(...chartData.map(d => d.responseTime))
  }

  const getMinResponseTime = () => {
    const validTimes = chartData.filter(d => d.responseTime > 0)
    return validTimes.length > 0 ? Math.min(...validTimes.map(d => d.responseTime)) : 0
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Response Time Chart
          </CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
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
              <TrendingUp className="h-5 w-5" />
              Response Time Chart
            </CardTitle>
            <CardDescription>
              {monitorName} - Response time trends in milliseconds
            </CardDescription>
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Uptime</span>
            </div>
            <p className="text-xl font-bold text-green-800">{getUptimePercentage()}%</p>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">Avg Response</span>
            </div>
            <p className="text-xl font-bold text-blue-800">{getAverageResponseTime()}ms</p>
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">Max Response</span>
            </div>
            <p className="text-xl font-bold text-yellow-800">{getMaxResponseTime()}ms</p>
          </div>
          
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Min Response</span>
            </div>
            <p className="text-xl font-bold text-purple-800">{getMinResponseTime()}ms</p>
          </div>
        </div>
        
        {/* Simple Chart */}
        <div className="relative h-64 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="absolute inset-4">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-r border-gray-200"></div>
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-b border-gray-200"></div>
              ))}
            </div>
            
            {/* Response Time Line Chart */}
            {chartData.length > 0 && (
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id={`responseTimeGradient-${monitorId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path
                  d={chartData.map((point, index) => {
                    const x = (index / (chartData.length - 1)) * 100
                    const y = 100 - (point.responseTime / 1000) * 100 // Scale to 0-1000ms range
                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
                  }).join(' ') + ' L 100% 100% L 0% 100% Z'}
                  fill={`url(#responseTimeGradient-${monitorId})`}
                  stroke="none"
                />
                
                {/* Line */}
                <path
                  d={chartData.map((point, index) => {
                    const x = (index / (chartData.length - 1)) * 100
                    const y = 100 - (point.responseTime / 1000) * 100
                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
                  }).join(' ')}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 100
                  const y = 100 - (point.responseTime / 1000) * 100
                  return (
                    <circle
                      key={index}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="3"
                      fill={getResponseTimeColor(point.responseTime)}
                      stroke="white"
                      strokeWidth="2"
                    />
                  )
                })}
              </svg>
            )}
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>1000ms</span>
              <span>750ms</span>
              <span>500ms</span>
              <span>250ms</span>
              <span>0ms</span>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
              {chartData.length > 0 && (
                <>
                  <span>{formatTime(chartData[0].timestamp)}</span>
                  <span>{formatTime(chartData[Math.floor(chartData.length / 2)].timestamp)}</span>
                  <span>{formatTime(chartData[chartData.length - 1].timestamp)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Fast (&lt;200ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Slow (200-500ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Very Slow (&gt;500ms)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
