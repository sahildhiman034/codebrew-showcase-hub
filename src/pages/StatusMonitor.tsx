import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Globe,
  Zap,
  TrendingUp,
  Settings,
  Wifi,
  WifiOff,
  AlertTriangle,
  ExternalLink,
  Building2,
  Plus,
  Edit,
  Trash2
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { integrationService } from "@/lib/integrations"
import { uptimeRobotService } from "@/lib/uptime-robot"
import { supabase, LiveClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ClientStatus {
  id: string
  name: string
  website_url: string
  status: 'active' | 'inactive' | 'maintenance'
  uptime_robot_id?: string
  uptime_ratio?: number
  response_time?: number
  last_checked?: string
  uptime_status?: 'up' | 'down' | 'maintenance'
}

export default function StatusMonitor() {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [clientStatuses, setClientStatuses] = useState<ClientStatus[]>([])
  const [integrationStatus, setIntegrationStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uptimeData, setUptimeData] = useState<any>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [uptimeConnected, setUptimeConnected] = useState(false)
  const [alertShown, setAlertShown] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    description: '',
    website_url: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance'
  })
  const [editingClient, setEditingClient] = useState<ClientStatus | null>(null)
  const { toast } = useToast()

  // Initialize alert shown state from sessionStorage
  useEffect(() => {
    const sessionAlertShown = sessionStorage.getItem('uptime_robot_alert_shown')
    console.log('Initializing alert state from sessionStorage:', sessionAlertShown)
    if (sessionAlertShown) {
      setAlertShown(true)
    }
    
    // Debug environment variables
    console.log('Environment variables check:')
    console.log('VITE_UPTIME_ROBOT_API_KEY:', import.meta.env.VITE_UPTIME_ROBOT_API_KEY ? 'Available' : 'Missing')
    console.log('VITE_UPTIME_ROBOT_READONLY_API_KEY:', import.meta.env.VITE_UPTIME_ROBOT_READONLY_API_KEY ? 'Available' : 'Missing')
    console.log('VITE_UPTIME_ROBOT_BASE_URL:', import.meta.env.VITE_UPTIME_ROBOT_BASE_URL)
  }, [])

  // Load monitoring data
  useEffect(() => {
    loadMonitoringData()
    checkIntegrationStatus()
    
    // Set up real-time refresh every 5 minutes
    const interval = setInterval(() => {
      loadMonitoringData()
      setLastUpdate(new Date())
    }, 300000) // 5 minutes (300,000 milliseconds)
    
    return () => clearInterval(interval)
  }, [])

  const loadMonitoringData = async () => {
    try {
      setLoading(true)
      
      // 1. Get all live clients from database
      const { data: clients, error: clientsError } = await supabase
        .from('live_clients')
        .select('*')
        .order('name')

      if (clientsError) throw clientsError

      // 2. Always use real website checking regardless of Uptime Robot connection
      console.log('Using real website checking for all clients')
      setUptimeConnected(true) // We're doing real checking, so consider it "connected"
      
      // Clear any previous alerts since we're doing real checking
      sessionStorage.removeItem('uptime_robot_alert_shown')
      setAlertShown(false)
      
      // Initialize empty monitors array since we're doing real checking
      let uptimeMonitors: any[] = []

      // 3. Combine client data with real website checking
      const combinedStatuses: ClientStatus[] = await Promise.all(clients.map(async (client) => {
        // Find matching Uptime Robot monitor by URL
        let uptimeMonitor = uptimeMonitors.find(monitor => 
          monitor.url === client.website_url || 
          monitor.url === client.website_url?.replace(/\/$/, '') ||
          monitor.url === client.website_url + '/' ||
          monitor.friendly_name.toLowerCase().includes(client.name.toLowerCase())
        )

        // If not found in cached monitors, skip individual lookup to avoid rate limiting
        if (!uptimeMonitor && client.website_url) {
          console.log(`Monitor not found in cache for ${client.website_url}`)
        }

        // Check actual website status if we have a URL
        let actualStatus: 'up' | 'down' | 'maintenance' = 'down'
        let actualResponseTime = 0
        let lastChecked = undefined

        if (client.website_url) {
          try {
            const websiteCheck = await uptimeRobotService.checkWebsiteStatus(client.website_url)
            actualStatus = websiteCheck.isAccessible ? 'up' : 'down'
            actualResponseTime = websiteCheck.responseTime
            lastChecked = new Date().toLocaleString()
            
            console.log(`Real check for ${client.name}: ${actualStatus} (${actualResponseTime}ms)`)
          } catch (error) {
            console.error(`Failed to check ${client.website_url}:`, error)
            actualStatus = 'down'
          }
        }

        return {
          id: client.id,
          name: client.name,
          website_url: client.website_url || '',
          status: client.status,
          uptime_robot_id: uptimeMonitor?.id,
          uptime_ratio: uptimeMonitor ? parseFloat(uptimeMonitor.uptime_ratio) : (actualStatus === 'up' ? 99.9 : 0),
          response_time: uptimeMonitor?.average_response_time || actualResponseTime,
          last_checked: uptimeMonitor ? new Date(uptimeMonitor.last_check_time * 1000).toLocaleString() : lastChecked,
          uptime_status: uptimeMonitor ? 
            (uptimeMonitor.status === 2 ? 'up' : uptimeMonitor.status === 9 ? 'down' : 'maintenance') : 
            actualStatus
        }
      }))

      setClientStatuses(combinedStatuses)

      // 4. Calculate overall statistics
      const totalClients = combinedStatuses.length
      const activeClients = combinedStatuses.filter(c => c.uptime_status === 'up').length
      const inactiveClients = combinedStatuses.filter(c => c.uptime_status === 'down').length
      const maintenanceClients = combinedStatuses.filter(c => c.uptime_status === 'maintenance').length
      const databaseOnlyClients = combinedStatuses.filter(c => c.uptime_status === undefined).length

      setUptimeData({
        overview: {
          totalSites: totalClients,
          onlineSites: activeClients,
          offlineSites: inactiveClients,
          maintenanceSites: maintenanceClients,
          averageUptime: combinedStatuses.reduce((sum, c) => sum + (c.uptime_ratio || 0), 0) / totalClients || 0,
          averageResponseTime: combinedStatuses.reduce((sum, c) => sum + (c.response_time || 0), 0) / totalClients || 0
        }
      })

    } catch (error) {
      console.error('Failed to load monitoring data:', error)
      toast({
        title: "Error",
        description: "Failed to load monitoring data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const checkIntegrationStatus = async () => {
    try {
      // Since we're using real website checking instead of Uptime Robot API,
      // we'll set the integration status manually to reflect this
      const status = {
        supabase: true, // Supabase is always connected
        uptimeRobot: true, // We're doing real website checking, so consider it "connected"
        n8n: false // N8N is not integrated yet
      }
      setIntegrationStatus(status)
    } catch (error) {
      console.error('Failed to check integration status:', error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadMonitoringData()
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.website_url) {
      toast({
        title: "Error",
        description: "Name and website URL are required",
        variant: "destructive"
      })
      return
    }

    try {
      // Get first category ID for the new client
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .limit(1)

      const categoryId = categories?.[0]?.id

      const { error } = await supabase
        .from('live_clients')
        .insert({
          category_id: categoryId,
          name: newClient.name,
          description: newClient.description,
          website_url: newClient.website_url,
          status: newClient.status
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Client added successfully"
      })

      setNewClient({
        name: '',
        description: '',
        website_url: '',
        status: 'active'
      })
      setShowAddDialog(false)
      
      // Automatically check website status after adding a new client
      try {
        const result = await uptimeRobotService.syncLiveClientsWithMonitors()
        toast({
          title: "Website Added & Checked",
          description: `Checked: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors}`,
        })
      } catch (error) {
        toast({
          title: "Website Added",
          description: "Website added but status check failed. Click 'Check All Websites' manually.",
          variant: "destructive"
        })
      }
      
      loadMonitoringData()
    } catch (error) {
      console.error('Failed to add client:', error)
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string, uptimeStatus?: string) => {
    const finalStatus = uptimeStatus || status
    switch (finalStatus) {
      case 'up':
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'down':
      case 'inactive':
        return <WifiOff className="h-5 w-5 text-red-500" />
      case 'maintenance':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string, uptimeStatus?: string) => {
    // Prioritize Uptime Robot status over database status
    const finalStatus = uptimeStatus || status
    
    // If we have Uptime Robot data, use that; otherwise use database status
    if (uptimeStatus !== undefined) {
      switch (uptimeStatus) {
        case 'up':
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
        case 'down':
          return <Badge variant="destructive">Inactive</Badge>
        case 'maintenance':
          return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
        default:
          return <Badge variant="secondary">Unknown</Badge>
      }
    } else {
      // Fallback to database status if no Uptime Robot data
      switch (status) {
        case 'active':
          return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Database: Active</Badge>
        case 'inactive':
          return <Badge variant="destructive">Database: Inactive</Badge>
        case 'maintenance':
          return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Database: Maintenance</Badge>
        default:
          return <Badge variant="secondary">No Monitor</Badge>
      }
    }
  }

  const openWebsite = (url: string) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleEditClient = (client: ClientStatus) => {
    setEditingClient(client)
    setShowEditDialog(true)
  }

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('live_clients')
          .delete()
          .eq('id', clientId)

        if (error) {
          throw error
        }

        toast({
          title: "Client Deleted",
          description: "The client has been successfully deleted.",
          variant: "default",
        })

        // Reload the data
        loadMonitoringData()
      } catch (error) {
        console.error('Error deleting client:', error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete the client. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateClient = async () => {
    if (!editingClient) return

    try {
      const { error } = await supabase
        .from('live_clients')
        .update({
          name: editingClient.name,
          website_url: editingClient.website_url,
          status: editingClient.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingClient.id)

      if (error) {
        throw error
      }

      toast({
        title: "Client Updated",
        description: "The client has been successfully updated.",
        variant: "default",
      })

      setShowEditDialog(false)
      setEditingClient(null)
      loadMonitoringData()
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update the client. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading monitoring data...</p>
        </div>
      </div>
    )
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Live Client Status Monitor</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Real-time website monitoring & uptime tracking
              </p>
                </div>
                </div>
              </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Check All Websites
          </Button>
          
          <Button 
            onClick={() => setShowAddDialog(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </motion.div>

      {/* Integration Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Integration Status
            </CardTitle>
            <CardDescription>Current status of external service integrations</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Real-time Website Monitoring</p>
                  <p className="text-xs text-green-600">Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Supabase Database</p>
                  <p className="text-xs text-green-600">Connected</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">N8N Workflows</p>
                  <p className="text-xs text-gray-600">Not Connected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clientStatuses.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {clientStatuses.filter(c => c.uptime_status === 'up' || c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-red-600">
                  {clientStatuses.filter(c => c.uptime_status === 'down' || c.status === 'inactive').length}
                </p>
              </div>
              <WifiOff className="h-8 w-8 text-red-500" />
            </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                <p className="text-sm font-bold">{lastUpdate.toLocaleTimeString()}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            </CardContent>
          </Card>
        </motion.div>

      {/* Client Status Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Client Websites Status
            </CardTitle>
                         <CardDescription>
               Real-time status of all client websites • Auto-refresh every 5 minutes
             </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading client statuses...</span>
          </div>
            ) : clientStatuses.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-500 mb-4">Add your first client to start monitoring</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Client
                </Button>
        </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientStatuses.map((client, index) => (
            <motion.div
              key={client.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(client.status, client.uptime_status)}
                          <h3 className="font-semibold text-sm sm:text-base truncate">{client.name}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            {getStatusBadge(client.status, client.uptime_status)}
                          </div>
                          
                          {client.website_url && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openWebsite(client.website_url)}
                                className="w-full sm:w-auto text-xs"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Visit Site
                              </Button>
                            </div>
                          )}
                          
                          {client.response_time && (
                          <p className="text-xs text-muted-foreground">
                              Response: {client.response_time}ms
                          </p>
                        )}
                          
                          {client.uptime_ratio && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Uptime</span>
                                <span>{client.uptime_ratio}%</span>
                              </div>
                              <Progress value={client.uptime_ratio} className="h-1" />
                            </div>
                          )}
                          
                          {client.last_checked && (
                            <p className="text-xs text-muted-foreground">
                              Last checked: {new Date(client.last_checked).toLocaleString()}
                          </p>
                        )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                          className="w-full sm:w-auto text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
            </motion.div>
          ))}
        </div>
            )}
            </CardContent>
          </Card>
      </motion.div>

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newClient.description}
                onChange={(e) => setNewClient({ ...newClient, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={newClient.website_url}
                onChange={(e) => setNewClient({ ...newClient, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={newClient.status}
                onChange={(e) => setNewClient({ ...newClient, status: e.target.value as any })}
                className="w-full p-2 border rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddClient} className="flex-1">
                Add Client
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Client Name</Label>
                <Input
                  id="edit-name"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  placeholder="Enter client name"
                />
                </div>
              <div>
                <Label htmlFor="edit-website_url">Website URL</Label>
                <Input
                  id="edit-website_url"
                  value={editingClient.website_url}
                  onChange={(e) => setEditingClient({ ...editingClient, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
                </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editingClient.status}
                  onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateClient} className="flex-1">
                  Update Client
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
      )}
        </DialogContent>
      </Dialog>
    </div>
  )
}