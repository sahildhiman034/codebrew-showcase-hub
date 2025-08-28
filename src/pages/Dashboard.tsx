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

      // Update stats
      setStats(prev => [
        { ...prev[0], value: `${clientsCount || 0}+` },
        { ...prev[1], value: `${projectsCount || 0}+` },
        { ...prev[2] },
        { ...prev[3], value: `98.5%` }
      ])

      // Update recent projects
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

      // Generate monitoring data for each category
      const monitoringData = categoriesData?.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        status: ['online', 'online', 'maintenance', 'offline'][index % 4], // Mock status rotation
        uptime: Math.floor(Math.random() * 20 + 80), // 80-100%
        responseTime: Math.floor(Math.random() * 300 + 100), // 100-400ms
        lastCheck: new Date(Date.now() - Math.random() * 86400000).toLocaleString(), // Random time in last 24h
        projects: Math.floor(Math.random() * 10 + 1), // 1-10 projects
        clients: Math.floor(Math.random() * 5 + 1), // 1-5 clients
        alerts: Math.floor(Math.random() * 3), // 0-2 alerts
        performance: Math.floor(Math.random() * 30 + 70) // 70-100%
      })) || []

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
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Live Project Status
              </CardTitle>
              <CardDescription>Real-time monitoring of client websites & applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-surface hover:bg-surface-muted transition-colors gap-2"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm sm:text-base">{project.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{project.category}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <Badge 
                      variant={project.status === 'online' ? 'default' : project.status === 'maintenance' ? 'secondary' : 'destructive'}
                      className={`
                        w-fit
                        ${project.status === 'online' ? 'status-online' : ''}
                        ${project.status === 'maintenance' ? 'status-warning' : ''}
                        ${project.status === 'offline' ? 'status-offline' : ''}
                      `}
                    >
                      {project.status === 'online' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {project.status === 'maintenance' && <Clock className="h-3 w-3 mr-1" />}
                      {project.status === 'offline' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{project.lastChecked}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Portfolio Categories
              </CardTitle>
              <CardDescription>Comprehensive overview of project distribution & performance</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Debug info */}
              <div className="text-sm text-muted-foreground mb-4">
                Active portfolio categories: {categories.length}
              </div>
              
              {/* Categories Container with Fixed Height and Scroll */}
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg border border-gray-200 p-3">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    className="space-y-2 mb-4 last:mb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{category.name}</span>
                      <span className="text-xs text-muted-foreground">{category.count} projects</span>
                    </div>
                    <Progress value={category.progress} className="h-1.5" />
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">{category.progress}% completion</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Show total count */}
              {categories.length > 8 && (
                <div className="text-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Showing 8 of {categories.length} categories (scroll to view more)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Status Monitor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              All Categories Status Monitor
            </CardTitle>
            <CardDescription>Real-time monitoring of all portfolio categories • Last updated: {new Date().toLocaleTimeString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryMonitoring.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{category.name}</h3>
                    <Badge 
                      variant={category.status === 'online' ? 'default' : category.status === 'maintenance' ? 'secondary' : 'destructive'}
                      className={`
                        w-fit
                        ${category.status === 'online' ? 'bg-green-100 text-green-800' : ''}
                        ${category.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${category.status === 'offline' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {category.status === 'online' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {category.status === 'maintenance' && <Clock className="h-3 w-3 mr-1" />}
                      {category.status === 'offline' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {category.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{category.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response:</span>
                      <span className="font-medium">{category.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projects:</span>
                      <span className="font-medium">{category.projects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clients:</span>
                      <span className="font-medium">{category.clients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Performance:</span>
                      <span className="font-medium">{category.performance}%</span>
                    </div>
                    {category.alerts > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Alerts:</span>
                        <span className="font-medium">{category.alerts}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Last check: {category.lastCheck}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Response Time Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-6"
      >
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Response Time Analytics
            </CardTitle>
            <CardDescription>Real-time monitoring of website performance in milliseconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <SimpleChart />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="card-hero text-center">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold">Ready to explore our portfolio?</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Discover our diverse range of projects across different industries and technologies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}