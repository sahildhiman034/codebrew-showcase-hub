import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Workflow, 
  Play, 
  Pause, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  Zap,
  History,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'waiting'
  startTime: string
  endTime?: string
  duration?: number
  nodesExecuted: number
  totalNodes: number
  error?: string
}

interface N8NWorkflow {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'error'
  lastExecution?: WorkflowExecution
  executions: WorkflowExecution[]
  triggerType: 'manual' | 'schedule' | 'webhook' | 'cron'
  nextRun?: string
  tags: string[]
}

interface N8NWorkflowsProps {
  n8nUrl?: string
  apiKey?: string
  workflows?: N8NWorkflow[]
}

export const N8NWorkflows: React.FC<N8NWorkflowsProps> = ({
  n8nUrl,
  apiKey,
  workflows = []
}) => {
  const [workflowData, setWorkflowData] = useState<N8NWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null)

  // Mock data for demonstration
  const mockWorkflows: N8NWorkflow[] = [
    {
      id: "1",
      name: "Data Sync Automation",
      description: "Syncs data between systems every hour",
      status: "active",
      triggerType: "schedule",
      nextRun: "2024-01-15T11:00:00Z",
      tags: ["data", "sync", "automation"],
      executions: [
        {
          id: "exec1",
          workflowId: "1",
          status: "completed",
          startTime: "2024-01-15T10:00:00Z",
          endTime: "2024-01-15T10:02:30Z",
          duration: 150,
          nodesExecuted: 5,
          totalNodes: 5
        }
      ]
    },
    {
      id: "2",
      name: "Email Notification System",
      description: "Sends notifications based on events",
      status: "active",
      triggerType: "webhook",
      tags: ["email", "notifications"],
      executions: [
        {
          id: "exec2",
          workflowId: "2",
          status: "running",
          startTime: "2024-01-15T10:25:00Z",
          nodesExecuted: 2,
          totalNodes: 4
        }
      ]
    },
    {
      id: "3",
      name: "Database Backup",
      description: "Creates daily database backups",
      status: "inactive",
      triggerType: "cron",
      tags: ["backup", "database"],
      executions: [
        {
          id: "exec3",
          workflowId: "3",
          status: "failed",
          startTime: "2024-01-15T09:00:00Z",
          endTime: "2024-01-15T09:01:15Z",
          duration: 75,
          nodesExecuted: 1,
          totalNodes: 3,
          error: "Database connection failed"
        }
      ]
    }
  ]

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true)
      try {
        if (n8nUrl && apiKey) {
          // Real N8N API call
          const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (!response.ok) {
            throw new Error('Failed to fetch workflows')
          }
          
          const data = await response.json()
          // Transform N8N data to our format
          const transformedData = data.data.map((workflow: any) => ({
            id: workflow.id,
            name: workflow.name,
            description: workflow.description || '',
            status: workflow.active ? 'active' : 'inactive',
            triggerType: workflow.triggerType || 'manual',
            tags: workflow.tags || [],
            executions: [] // Would need separate API call for executions
          }))
          
          setWorkflowData(transformedData)
        } else {
          // Use mock data if no API credentials
          setWorkflowData(mockWorkflows)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflows')
        setWorkflowData(mockWorkflows) // Fallback to mock data
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchWorkflows, 300000)
    return () => clearInterval(interval)
  }, [n8nUrl, apiKey])

  const executeWorkflow = async (workflowId: string) => {
    setExecutingWorkflow(workflowId)
    try {
      if (n8nUrl && apiKey) {
        // Real N8N execution API call
        const response = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}/trigger`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        })
        
        if (!response.ok) {
          throw new Error('Failed to execute workflow')
        }
        
        // Refresh workflows after execution
        setTimeout(() => {
          fetchWorkflows()
          setExecutingWorkflow(null)
        }, 2000)
      } else {
        // Mock execution
        setTimeout(() => {
          setExecutingWorkflow(null)
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow')
      setExecutingWorkflow(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive':
        return <Pause className="h-4 w-4 text-gray-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Error</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Unknown</Badge>
    }
  }

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatNextRun = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Now"
    if (diffMins < 60) return `in ${diffMins} minutes`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `in ${diffHours} hours`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            N8N Workflows
          </CardTitle>
          <CardDescription>Loading workflow data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
              <Workflow className="h-5 w-5" />
              N8N Workflows
            </CardTitle>
            <CardDescription>
              Automation workflows and execution status
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open N8N
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {workflowData.map((workflow) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(workflow.status)}
                <div>
                  <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                  <p className="text-sm text-gray-500">{workflow.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(workflow.status)}
                <Button
                  size="sm"
                  onClick={() => executeWorkflow(workflow.id)}
                  disabled={executingWorkflow === workflow.id || workflow.status !== 'active'}
                  className="ml-2"
                >
                  {executingWorkflow === workflow.id ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span className="capitalize">{workflow.triggerType}</span>
              </div>
              {workflow.nextRun && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Next: {formatNextRun(workflow.nextRun)}</span>
                </div>
              )}
            </div>
            
            {workflow.tags.length > 0 && (
              <div className="flex gap-1 mb-3">
                {workflow.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {workflow.lastExecution && (
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <History className="h-3 w-3" />
                    <span>Last Execution</span>
                  </div>
                  {getExecutionStatusIcon(workflow.lastExecution.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                  <div>
                    <span className="text-gray-500">Progress: </span>
                    <span className="font-medium">
                      {workflow.lastExecution.nodesExecuted}/{workflow.lastExecution.totalNodes}
                    </span>
                  </div>
                  {workflow.lastExecution.duration && (
                    <div>
                      <span className="text-gray-500">Duration: </span>
                      <span className="font-medium">
                        {formatDuration(workflow.lastExecution.duration)}
                      </span>
                    </div>
                  )}
                </div>
                {workflow.lastExecution.status === 'running' && (
                  <Progress 
                    value={(workflow.lastExecution.nodesExecuted / workflow.lastExecution.totalNodes) * 100} 
                    className="h-1 mt-2" 
                  />
                )}
              </div>
            )}
          </motion.div>
        ))}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Active Workflows</span>
            <span className="font-medium text-green-600">
              {workflowData.filter(w => w.status === 'active').length}/{workflowData.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
