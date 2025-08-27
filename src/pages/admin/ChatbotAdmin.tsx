import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MessageCircle, 
  Settings, 
  Users, 
  FileText,
  BarChart3,
  Search,
  Filter,
  Eye,
  Clock,
  User,
  Bot,
  Shield,
  TrendingUp,
  Activity,
  RefreshCw
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Import chatbot service
import { chatbotService } from "@/lib/chatbot-service"
import { analyticsService } from "@/lib/analytics-service"
import { supabase, ChatbotSession, ChatbotMessage, ChatbotFAQ, ChatbotSetting, ChatbotAnalytics } from "@/lib/supabase"

export default function ChatbotAdmin() {
  const [activeTab, setActiveTab] = useState("sessions")
  const [sessions, setSessions] = useState<ChatbotSession[]>([])
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [faqEntries, setFaqEntries] = useState<ChatbotFAQ[]>([])
  const [settings, setSettings] = useState<ChatbotSetting[]>([])
  const [analytics, setAnalytics] = useState<ChatbotAnalytics[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ChatbotSession | null>(null)
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<ChatbotMessage[]>([])
  const [editingFAQ, setEditingFAQ] = useState<ChatbotFAQ | null>(null)
  const [showAddFAQDialog, setShowAddFAQDialog] = useState(false)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isRealtimeActive, setIsRealtimeActive] = useState(false)
  
  const [faqFormData, setFaqFormData] = useState({
    question: "",
    answer: "",
    category: "",
    keywords: [],
    priority: 1,
    is_active: true
  })

  const { toast } = useToast()

  // Load data from Supabase on component mount
  useEffect(() => {
    loadData()
    
    // Set up real-time subscriptions
    const setupRealtimeSubscriptions = async () => {
      console.log('🔄 Setting up real-time subscriptions...')
      
      // Subscribe to chatbot_sessions changes
      const sessionsSubscription = supabase
        .channel('chatbot_sessions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chatbot_sessions'
          },
          (payload) => {
            console.log('📊 Sessions real-time update:', payload)
            setIsRealtimeActive(true)
            loadData() // Reload data when sessions change
            
            // Update selected session if it's the one that changed
            if (selectedSession && payload.new && payload.new.id === selectedSession.id) {
              setSelectedSession(payload.new as ChatbotSession)
            }
          }
        )
        .subscribe()

      // Subscribe to chatbot_messages changes
      const messagesSubscription = supabase
        .channel('chatbot_messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chatbot_messages'
          },
          (payload) => {
            console.log('💬 Messages real-time update:', payload)
            setIsRealtimeActive(true)
            loadData() // Reload data when messages change
            
            // Update selected session messages if it's the same session
            if (selectedSession && payload.new && payload.new.session_id === selectedSession.id) {
              handleViewSession(selectedSession) // Reload messages for the current session
              
              // Show notification for new message
              if (payload.eventType === 'INSERT') {
                toast({
                  title: "New Message",
                  description: `New ${payload.new.sender_type} message received in session ${selectedSession.visitor_id}`,
                })
              }
            }
          }
        )
        .subscribe()

      // Subscribe to chatbot_faq changes
      const faqSubscription = supabase
        .channel('chatbot_faq_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chatbot_faq'
          },
          (payload) => {
            console.log('❓ FAQ real-time update:', payload)
            loadData() // Reload data when FAQ changes
          }
        )
        .subscribe()

      // Subscribe to chatbot_settings changes
      const settingsSubscription = supabase
        .channel('chatbot_settings_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chatbot_settings'
          },
          (payload) => {
            console.log('⚙️ Settings real-time update:', payload)
            loadData() // Reload data when settings change
          }
        )
        .subscribe()

      // Subscribe to chatbot_analytics changes
      const analyticsSubscription = supabase
        .channel('chatbot_analytics_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chatbot_analytics'
          },
          (payload) => {
            console.log('📈 Analytics real-time update:', payload)
            loadData() // Reload data when analytics change
          }
        )
        .subscribe()

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up real-time subscriptions...')
        sessionsSubscription.unsubscribe()
        messagesSubscription.unsubscribe()
        faqSubscription.unsubscribe()
        settingsSubscription.unsubscribe()
        analyticsSubscription.unsubscribe()
      }
    }

    const cleanup = setupRealtimeSubscriptions()

    // Cleanup on unmount
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [])

  // Test database connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_sessions')
        .select('count')
        .limit(1)
      
      if (error) throw error
      
      toast({
        title: "Connection Successful",
        description: "Database connection is working properly!",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your Supabase setup and run the database script.",
        variant: "destructive"
      })
    }
  }

  const createSampleData = async () => {
    try {
      setLoading(true)
      
      const currentTime = new Date().toISOString()
      
      // Create sample session with explicit timestamp
      const { data: session, error: sessionError } = await supabase
        .from('chatbot_sessions')
        .insert({
          visitor_id: `VIS_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_sample`,
          status: 'active',
          total_messages: 5,
          visitor_info: { userAgent: 'Sample Data Generator' },
          session_start: currentTime,
          created_at: currentTime,
          updated_at: currentTime
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Create sample messages with explicit timestamps
      const sampleMessages = [
        {
          session_id: session.id,
          visitor_id: session.visitor_id,
          sender_type: 'user',
          content: 'Hello, I need help with my project',
          message_type: 'text',
          created_at: currentTime
        },
        {
          session_id: session.id,
          visitor_id: session.visitor_id,
          sender_type: 'bot',
          content: 'Hello! I\'m here to help you with any questions about our services. How can I assist you today?',
          message_type: 'text',
          response_time_ms: 1200,
          created_at: new Date(Date.now() + 2000).toISOString() // 2 seconds later
        },
        {
          session_id: session.id,
          visitor_id: session.visitor_id,
          sender_type: 'user',
          content: 'What services do you offer?',
          message_type: 'text',
          created_at: new Date(Date.now() + 5000).toISOString() // 5 seconds later
        },
        {
          session_id: session.id,
          visitor_id: session.visitor_id,
          sender_type: 'bot',
          content: 'We offer comprehensive web development, mobile app development, and consulting services. Our expertise includes React, Node.js, Python, and cloud solutions.',
          message_type: 'text',
          response_time_ms: 800,
          created_at: new Date(Date.now() + 7000).toISOString() // 7 seconds later
        },
        {
          session_id: session.id,
          visitor_id: session.visitor_id,
          sender_type: 'user',
          content: 'How much does a website cost?',
          message_type: 'text',
          created_at: new Date(Date.now() + 10000).toISOString() // 10 seconds later
        }
      ]

      const { error: messagesError } = await supabase
        .from('chatbot_messages')
        .insert(sampleMessages)

      if (messagesError) throw messagesError

      toast({
        title: "Sample Data Created",
        description: "Sample chat session and messages have been created with current timestamps. Refresh to see the data.",
      })

      // Reload data
      await loadData()
    } catch (error) {
      console.error('Error creating sample data:', error)
      toast({
        title: "Error",
        description: "Failed to create sample data. Please check your database permissions.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔄 Loading chatbot data from Supabase...')
      
      // Test database connection first
      const { data: testData, error: testError } = await supabase
        .from('chatbot_sessions')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('❌ Database connection test failed:', testError)
        throw new Error(`Database connection failed: ${testError.message}`)
      }
      
      console.log('✅ Database connection successful')
      
      // Generate real-time analytics first
      await analyticsService.generateDailyAnalytics()
      
      const [sessionsData, faqData, settingsData, realTimeStats, trendingData] = await Promise.all([
        chatbotService.getAllSessions(),
        chatbotService.getFAQEntries(),
        chatbotService.getSettings(),
        analyticsService.getRealTimeStats(),
        analyticsService.getTrendingData(7)
      ])
      
      console.log('✅ Data loaded successfully:', {
        sessions: sessionsData.length,
        faqs: faqData.length,
        settings: settingsData.length,
        realTimeStats,
        trendingData: trendingData.length
      })
      
      setSessions(sessionsData)
      setFaqEntries(faqData)
      setSettings(settingsData)
      
      // Convert trending data to analytics format
      const analyticsData = trendingData.map(item => ({
        id: item.date,
        date: item.date,
        total_sessions: item.sessions,
        total_messages: item.messages,
        unique_visitors: item.visitors,
        avg_response_time_ms: item.responseTime,
        satisfaction_score: null,
        most_common_questions: null,
        created_at: new Date().toISOString()
      }))
      
      setAnalytics(analyticsData)
      
      if (sessionsData.length === 0 && faqData.length === 0) {
        toast({
          title: "No Data Found",
          description: "No chatbot data found. Start chatting to see real data! You can test the chatbot to generate some data.",
        })
      } else {
        toast({
          title: "Data Loaded Successfully",
          description: `Loaded ${sessionsData.length} sessions, ${faqData.length} FAQs, and ${realTimeStats.totalMessages} messages`,
        })
      }
    } catch (error) {
      console.error('❌ Error loading data:', error)
      toast({
        title: "Database Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to Supabase. Please check your database setup.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await chatbotService.deleteSession(sessionId)
      setSessions(sessions.filter(s => s.id !== sessionId))
      toast({
        title: "Success",
        description: "Chat session deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive"
      })
    }
  }

  const handleEndSession = async (sessionId: string) => {
    try {
      await chatbotService.endSession(sessionId)
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, status: 'ended' } : s
      ))
      toast({
        title: "Success",
        description: "Chat session ended successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end chat session",
        variant: "destructive"
      })
    }
  }

  const handleViewSession = async (session: ChatbotSession) => {
    try {
      const sessionMessages = await chatbotService.getSessionMessages(session.id)
      setSelectedSession(session)
      setSelectedSessionMessages(sessionMessages)
      setShowSessionDialog(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load session messages",
        variant: "destructive"
      })
    }
  }

  const refreshSessionMessages = async () => {
    if (selectedSession) {
      try {
        const sessionMessages = await chatbotService.getSessionMessages(selectedSession.id)
        setSelectedSessionMessages(sessionMessages)
      } catch (error) {
        console.error('Error refreshing session messages:', error)
      }
    }
  }

  // Function to check time synchronization
  const checkTimeSync = () => {
    const now = new Date()
    const serverTime = new Date()
    
    console.log('🕐 Time Synchronization Check:', {
      localTime: now.toLocaleString(),
      localISO: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: now.getTimezoneOffset(),
      serverTime: serverTime.toLocaleString(),
      serverISO: serverTime.toISOString()
    })
    
    toast({
      title: "Time Sync Check",
      description: `Local: ${now.toLocaleString()} | Server: ${serverTime.toLocaleString()}`,
    })
  }

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await chatbotService.addFAQEntry({
        question: faqFormData.question,
        answer: faqFormData.answer,
        category: faqFormData.category || undefined,
        keywords: faqFormData.keywords,
        priority: faqFormData.priority,
        is_active: faqFormData.is_active
      })
      
      // Reload FAQ data
      const updatedFAQ = await chatbotService.getFAQEntries()
      setFaqEntries(updatedFAQ)
      
      setShowAddFAQDialog(false)
      setFaqFormData({
        question: "",
        answer: "",
        category: "",
        keywords: [],
        priority: 1,
        is_active: true
      })
      toast({
        title: "Success",
        description: "FAQ entry added successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add FAQ entry",
        variant: "destructive"
      })
    }
  }

  const handleUpdateFAQ = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFAQ) return

    try {
      await chatbotService.updateFAQEntry(editingFAQ.id, {
        question: faqFormData.question,
        answer: faqFormData.answer,
        category: faqFormData.category || undefined,
        keywords: faqFormData.keywords,
        priority: faqFormData.priority,
        is_active: faqFormData.is_active
      })
      
      // Reload FAQ data
      const updatedFAQ = await chatbotService.getFAQEntries()
      setFaqEntries(updatedFAQ)
      
      setEditingFAQ(null)
      setFaqFormData({
        question: "",
        answer: "",
        category: "",
        keywords: [],
        priority: 1,
        is_active: true
      })
      toast({
        title: "Success",
        description: "FAQ entry updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update FAQ entry",
        variant: "destructive"
      })
    }
  }

  const handleDeleteFAQ = async (id: string) => {
    try {
      await chatbotService.deleteFAQEntry(id)
      setFaqEntries(faqEntries.filter(faq => faq.id !== id))
      toast({
        title: "Success",
        description: "FAQ entry deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete FAQ entry",
        variant: "destructive"
      })
    }
  }

  const handleEditFAQ = (faq: ChatbotFAQ) => {
    setEditingFAQ(faq)
    setFaqFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      keywords: faq.keywords || [],
      priority: faq.priority,
      is_active: faq.is_active
    })
  }

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await chatbotService.updateSetting(key, value)
      setSettings(settings.map(setting => 
        setting.setting_key === key ? { ...setting, setting_value: value } : setting
      ))
      toast({
        title: "Success",
        description: "Setting updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      })
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.visitor_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || session.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Prepare analytics data for charts
  const prepareAnalyticsData = () => {
    const last7Days = analytics.slice(0, 7).reverse()
    
    return {
      sessionsData: last7Days.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: item.total_sessions,
        messages: item.total_messages,
        visitors: item.unique_visitors
      })),
      responseTimeData: last7Days.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        responseTime: item.avg_response_time_ms
      })),
      statusDistribution: [
        { name: 'Active', value: sessions.filter(s => s.status === 'active').length, color: '#10b981' },
        { name: 'Ended', value: sessions.filter(s => s.status === 'ended').length, color: '#6b7280' },
        { name: 'Archived', value: sessions.filter(s => s.status === 'archived').length, color: '#f59e0b' }
      ],
      topFAQs: faqEntries
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5)
        .map(faq => ({
          question: faq.question.length > 30 ? faq.question.substring(0, 30) + '...' : faq.question,
          usage: faq.usage_count
        }))
    }
  }

  const analyticsData = prepareAnalyticsData()

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'user':
        return <User className="w-4 h-4 text-blue-500" />
      case 'bot':
        return <Bot className="w-4 h-4 text-green-500" />
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-500" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getSenderBadge = (senderType: string) => {
    switch (senderType) {
      case 'user':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">User</Badge>
      case 'bot':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Bot</Badge>
      case 'admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Admin</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Utility function to format timestamps correctly
  const formatTimestamp = (timestamp: string | null | undefined) => {
    if (!timestamp) return 'N/A'
    
    try {
      // Parse the timestamp and convert to local timezone
      const date = new Date(timestamp)
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp)
        return 'Invalid Date'
      }
      
      // Get current time for comparison
      const now = new Date()
      const timeDiff = Math.abs(now.getTime() - date.getTime())
      const timeDiffMinutes = Math.floor(timeDiff / (1000 * 60))
      
      // Debug: Log the timestamp processing
      console.log('Timestamp processing:', {
        original: timestamp,
        parsed: date.toISOString(),
        local: date.toLocaleString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: now.toISOString(),
        timeDiffMinutes: timeDiffMinutes
      })
      
      // If the timestamp is more than 5 minutes off from current time, show a warning
      if (timeDiffMinutes > 5) {
        console.warn('⚠️ Large time difference detected:', timeDiffMinutes, 'minutes')
      }
      
      // Format with timezone awareness
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      })
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp)
      return 'Error'
    }
  }

  // Utility function to get relative time
  const getRelativeTime = (timestamp: string | null | undefined) => {
    if (!timestamp) return 'N/A'
    
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      return `${Math.floor(diffInSeconds / 86400)}d ago`
    } catch (error) {
      return 'Error'
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Indicator */}
      {isRealtimeActive && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">Real-time updates active</span>
          <span className="text-xs text-green-600">Live data from chatbot interactions</span>
          <span className="text-xs text-gray-500 ml-auto">
            Current time: {new Date().toLocaleString()}
          </span>
        </div>
      )}
      
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-muted-foreground">Loading chatbot data...</span>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat Sessions
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            FAQ Management
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Chat Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Chat Sessions</span>
                  {isRealtimeActive && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-700">LIVE</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testConnection}
                    disabled={loading}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Test DB
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkTimeSync}
                    disabled={loading}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Check Time
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createSampleData}
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Sample Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search visitor ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-sm">
                        {session.visitor_id}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={session.status === 'active' ? 'default' : 'secondary'}
                          className={session.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.total_messages}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatTimestamp(session.session_start)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getRelativeTime(session.session_start)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSession(session)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {session.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEndSession(session.id)}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Management Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>FAQ Management</span>
                <Button onClick={() => setShowAddFAQDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqEntries.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="max-w-xs truncate">
                        {faq.question}
                      </TableCell>
                      <TableCell>{faq.category || 'General'}</TableCell>
                      <TableCell>{faq.priority}</TableCell>
                      <TableCell>{faq.usage_count}</TableCell>
                      <TableCell>
                        <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                          {faq.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditFAQ(faq)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">{setting.setting_key}</Label>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {setting.setting_type === 'boolean' ? (
                        <Select
                          value={setting.setting_value}
                          onValueChange={(value) => handleUpdateSetting(setting.setting_key, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={setting.setting_value || ''}
                          onChange={(e) => handleUpdateSetting(setting.setting_key, e.target.value)}
                          className="w-64"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Chatbot Analytics
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await analyticsService.generateLastNDaysAnalytics(7)
                      await loadData()
                      toast({
                        title: "Analytics Updated",
                        description: "Real-time analytics have been generated successfully!",
                      })
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to generate analytics",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Analytics
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{sessions.length}</p>
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {sessions.filter(s => s.status === 'active').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Active Sessions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">{faqEntries.length}</p>
                        <p className="text-sm text-muted-foreground">FAQ Entries</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-8 h-8 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">
                          {sessions.reduce((sum, s) => sum + s.total_messages, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Messages</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sessions and Messages Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sessions & Messages Trend (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.sessionsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} name="Sessions" />
                        <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} name="Messages" />
                        <Line type="monotone" dataKey="visitors" stroke="#8b5cf6" strokeWidth={2} name="Visitors" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Response Time Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Average Response Time (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.responseTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="responseTime" stroke="#f59e0b" strokeWidth={2} name="Response Time (ms)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Session Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top FAQ Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top FAQ Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.topFAQs}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="question" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="usage" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add FAQ Dialog */}
      <Dialog open={showAddFAQDialog} onOpenChange={setShowAddFAQDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New FAQ Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFAQ} className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={faqFormData.question}
                onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                placeholder="Enter the question..."
                required
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={faqFormData.answer}
                onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                placeholder="Enter the answer..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={faqFormData.category}
                  onChange={(e) => setFaqFormData({ ...faqFormData, category: e.target.value })}
                  placeholder="e.g., general, services, pricing"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={faqFormData.priority}
                  onChange={(e) => setFaqFormData({ ...faqFormData, priority: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={faqFormData.is_active}
                onChange={(e) => setFaqFormData({ ...faqFormData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddFAQDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add FAQ</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={!!editingFAQ} onOpenChange={() => setEditingFAQ(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateFAQ} className="space-y-4">
            <div>
              <Label htmlFor="edit-question">Question</Label>
              <Textarea
                id="edit-question"
                value={faqFormData.question}
                onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                placeholder="Enter the question..."
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                value={faqFormData.answer}
                onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                placeholder="Enter the answer..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={faqFormData.category}
                  onChange={(e) => setFaqFormData({ ...faqFormData, category: e.target.value })}
                  placeholder="e.g., general, services, pricing"
                />
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  value={faqFormData.priority}
                  onChange={(e) => setFaqFormData({ ...faqFormData, priority: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-is_active"
                checked={faqFormData.is_active}
                onChange={(e) => setFaqFormData({ ...faqFormData, is_active: e.target.checked })}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingFAQ(null)}>
                Cancel
              </Button>
              <Button type="submit">Update FAQ</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Session Messages Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Chat Session: {selectedSession?.visitor_id}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshSessionMessages}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Status: {selectedSession?.status}</span>
              <span>Messages: {selectedSession?.total_messages}</span>
              <span>Started: {formatTimestamp(selectedSession?.session_start)}</span>
              {isRealtimeActive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600">Live</span>
                </div>
              )}
            </div>
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
              {selectedSessionMessages.length > 0 ? (
                selectedSessionMessages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 items-start max-w-[80%] ${message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`p-2 rounded-full ${message.sender_type === 'user' ? 'bg-blue-500' : message.sender_type === 'bot' ? 'bg-green-500' : 'bg-purple-500'}`}>
                        {getSenderIcon(message.sender_type)}
                      </div>
                      <div className={`p-3 rounded-lg ${message.sender_type === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No messages found for this session.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
