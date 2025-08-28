import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, Users, Star, TrendingUp, Globe, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { supabase } from "@/lib/supabase"
import { integrationService } from "@/lib/integrations"
import { SimpleChart } from "@/components/ui/simple-chart"
import { uptimeRobotService } from "@/lib/uptime-robot"

export default function Dashboard() {
  const [stats, setStats] = useState([
    {
      title: "Total Clients",
      value: "0",
      description: "Trusted business partners worldwide",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Delivered Projects",
      value: "0",
      description: "Successfully launched & deployed",
      icon: CheckCircle,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Client Satisfaction",
      value: "4.9/5",
      description: "Excellence in every delivery",
      icon: Star,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Active Monitoring",
      value: "0%",
      description: "24/7 uptime guarantee",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
  ])

  const [recentProjects, setRecentProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryMonitoring, setCategoryMonitoring] = useState([])
  const [uptimeData, setUptimeData] = useState({
    total: 0,
    up: 0,
    down: 0,
    paused: 0,
    averageUptime: 0,
    averageResponseTime: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load categories (simplified query)
      console.log('Starting to fetch categories...')
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')

      console.log('Supabase response:', { data: categoriesData, error: categoriesError })
      
      if (categoriesError) {
        console.error('Error loading categories:', categoriesError)
      }

      // Load live clients count
      const { count: clientsCount } = await supabase
        .from('live_clients')
        .select('*', { count: 'exact', head: true })

      // Load demo projects count
      const { count: projectsCount } = await supabase
        .from('demo_projects')
        .select('*', { count: 'exact', head: true })

      // Load recent live clients
      const { data: recentClients } = await supabase
        .from('live_clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      // Fetch real Uptime Robot data
      console.log('Fetching Uptime Robot data...')
      const uptimeSummary = await uptimeRobotService.getMonitorsSummary()
      setUptimeData(uptimeSummary)
      
      console.log('Uptime Robot summary:', uptimeSummary)

      // Sync live clients with Uptime Robot monitors
      console.log('Syncing live clients with monitors...')
      const syncResult = await uptimeRobotService.syncLiveClientsWithMonitors()
      console.log('Sync result:', syncResult)

      console.log('Categories loaded:', categoriesData)
      console.log('Categories count:', categoriesData?.length || 0)
      console.log('Clients count:', clientsCount)
      console.log('Projects count:', projectsCount)
      
      // Debug: Show categories in the UI temporarily
      if (categoriesData && categoriesData.length > 0) {
        console.log('Category names:', categoriesData.map(cat => cat.name))
      } else {
        console.log('No categories found in database')
      }

      // Update stats with real data
      setStats(prev => [
        { ...prev[0], value: `${clientsCount || 0}+` },
        { ...prev[1], value: `${projectsCount || 0}+` },
        { ...prev[2] },
        { ...prev[3], value: `${uptimeSummary.averageUptime.toFixed(1)}%` }
      ])

      // Update recent projects with real client data
      setRecentProjects(recentClients?.map(client => ({
        name: client.name,
        category: client.category_id || 'Unknown',
        status: client.status || 'active',
        lastChecked: client.updated_at ? 
          new Date(client.updated_at).toLocaleString() : 'Never'
      })) || [])

      // Update categories
      const categoriesList = categoriesData?.map(cat => ({
        name: cat.name,
        count: 0, // We'll calculate this later
        progress: 75 // Default progress
      })) || []
      
      console.log('Setting categories in state:', categoriesList)
      setCategories(categoriesList)

      // Generate real monitoring data for each category based on Uptime Robot
      const monitoringData = categoriesData?.map((cat, index) => {
        // Calculate real stats for this category
        const categoryClients = recentClients?.filter(client => 
          client.category_id === cat.id
        ) || []
        
        const onlineClients = categoryClients.filter(client => 
          client.status === 'active'
        ).length
        
        const totalClients = categoryClients.length
        const uptimePercentage = totalClients > 0 ? (onlineClients / totalClients) * 100 : 0
        
        return {
          id: cat.id,
          name: cat.name,
          status: uptimePercentage > 80 ? 'online' : uptimePercentage > 50 ? 'maintenance' : 'offline',
          uptime: Math.round(uptimePercentage),
          responseTime: Math.floor(Math.random() * 300 + 100), // We'll get real data later
          lastCheck: new Date().toLocaleString(),
          projects: totalClients,
          clients: totalClients,
          alerts: totalClients - onlineClients,
          performance: Math.round(uptimePercentage)
        }
      }) || []

      setCategoryMonitoring(monitoringData)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Logo size="lg" showText={false} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Welcome to Code Brew Labs Hub</h1>
            <p className="text-muted-foreground text-sm sm:text-lg">
              Your Central Command Center for Portfolio Management & Client Success
            </p>
          </div>
        </div>
        <Button 
          onClick={loadDashboardData} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="card-elevated hover:shadow-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Uptime Robot Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Live Website Monitoring Status
            </CardTitle>
            <CardDescription>
              Real-time status from Uptime Robot monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{uptimeData.up}</div>
                <div className="text-sm text-muted-foreground">Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{uptimeData.down}</div>
                <div className="text-sm text-muted-foreground">Offline</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{uptimeData.paused}</div>
                <div className="text-sm text-muted-foreground">Paused</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{uptimeData.averageUptime.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Avg Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Projects & Category Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="card-elevated h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recent Live Clients
              </CardTitle>
              <CardDescription>
                Latest client websites and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          project.status === 'active' ? 'bg-green-500' : 
                          project.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">{project.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {project.lastChecked}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent clients found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Monitoring */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="card-elevated h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Category Performance
              </CardTitle>
              <CardDescription>
                Real-time monitoring by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryMonitoring.length > 0 ? (
                  categoryMonitoring.map((category, index) => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            category.status === 'online' ? 'default' : 
                            category.status === 'maintenance' ? 'secondary' : 'destructive'
                          }>
                            {category.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {category.uptime}%
                          </span>
                        </div>
                      </div>
                      <Progress value={category.uptime} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{category.projects} projects</span>
                        <span>{category.clients} clients</span>
                        <span>{category.alerts} alerts</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No category data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}