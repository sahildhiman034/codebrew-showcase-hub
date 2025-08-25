import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  Play, 
  ExternalLink, 
  Smartphone, 
  AppWindow,
  Globe,
  PlayCircle,
  Video,
  Database,
  Loader2,
  Settings,
  Monitor
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CredentialsDisplay } from "@/components/ui/credentials-display"
import { YouTubeVideoCard } from "@/components/ui/youtube-video-card"
import { WebsitePreview, HoverPreview, EmbeddedPreview } from "@/components/ui/website-preview"
import { SimpleChart } from "@/components/ui/simple-chart"
import { supabase } from "@/lib/supabase"

// Helper function to extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

interface DemoProject {
  id: string
  name: string
  description: string
  admin_panel_url: string
  admin_credentials: {
    username: string
    password: string
  }
  dispatcher_panel_url?: string
  dispatcher_credentials?: {
    username: string
    password: string
  }
  android_user_app?: string
  android_driver_app?: string
  ios_user_app?: string
  ios_driver_app?: string
  created_at: string
}

interface LiveClient {
  id: string
  name: string
  description: string
  admin_panel_url: string
  dispatcher_panel_url?: string
  android_user_app?: string
  android_driver_app?: string
  ios_user_app?: string
  ios_driver_app?: string
  website_url?: string
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
}

interface DemoVideo {
  id: string
  title: string
  description: string
  youtube_url: string
  thumbnail_url?: string
  created_at: string
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
}

export default function CategoryPage() {
  const { category } = useParams()
  const [activeTab, setActiveTab] = useState("demos")
  const [categoryData, setCategoryData] = useState<Category | null>(null)
  const [demoProjects, setDemoProjects] = useState<DemoProject[]>([])
  const [liveClients, setLiveClients] = useState<LiveClient[]>([])
  const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean
    url: string
    title: string
  }>({
    isOpen: false,
    url: "",
    title: ""
  })

  useEffect(() => {
    loadCategoryData()
  }, [category])

  const loadCategoryData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get category details
      const categorySlug = category?.replace(/-/g, ' ')
      const { data: categoryResult, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', `%${categorySlug}%`)
        .single()

      if (categoryError) {
        console.error('Error loading category:', categoryError)
        setError('Category not found')
        return
      }

      setCategoryData(categoryResult)

      // Get demo projects for this category
      const { data: demos, error: demosError } = await supabase
        .from('demo_projects')
        .select('*')
        .eq('category_id', categoryResult.id)
        .order('created_at', { ascending: false })

      if (demosError) {
        console.error('Error loading demo projects:', demosError)
      } else {
        setDemoProjects(demos || [])
      }

      // Get live clients for this category
      const { data: clients, error: clientsError } = await supabase
        .from('live_clients')
        .select('*')
        .eq('category_id', categoryResult.id)
        .order('created_at', { ascending: false })

      if (clientsError) {
        console.error('Error loading live clients:', clientsError)
      } else {
        setLiveClients(clients || [])
      }

      // Get demo videos for this category (from both demo_videos table and demo_projects table)
      let allVideos: DemoVideo[] = []
      
      // First, get videos from demo_videos table
      const { data: videosFromTable, error: videosError } = await supabase
        .from('demo_videos')
        .select('*')
        .eq('category_id', categoryResult.id)
        .order('created_at', { ascending: false })

      if (videosError) {
        console.error('Error loading demo videos from table:', videosError)
      } else {
        // Process videos to ensure proper thumbnail URLs
        allVideos = (videosFromTable || []).map(video => {
          const videoId = extractYouTubeVideoId(video.youtube_url)
          return {
            ...video,
            thumbnail_url: videoId 
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : video.thumbnail_url
          }
        })
      }

      // Then, get videos from demo_projects table
      const { data: demosWithVideos, error: demosVideosError } = await supabase
        .from('demo_projects')
        .select('id, name, demo_videos')
        .eq('category_id', categoryResult.id)
        .not('demo_videos', 'eq', '{}')
        .not('demo_videos', 'is', null)

      if (demosVideosError) {
        console.error('Error loading demo videos from projects:', demosVideosError)
      } else if (demosWithVideos) {
        // Convert demo_projects videos to DemoVideo format
        demosWithVideos.forEach(demo => {
          if (demo.demo_videos && Array.isArray(demo.demo_videos)) {
            demo.demo_videos.forEach((videoUrl: string, index: number) => {
              // Extract YouTube video ID from various URL formats
              const videoId = extractYouTubeVideoId(videoUrl)
              const thumbnailUrl = videoId 
                ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                : undefined
              
              allVideos.push({
                id: `${demo.id}-video-${index}`,
                title: `${demo.name} - Demo Video ${index + 1}`,
                description: `Demo video for ${demo.name}`,
                youtube_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                created_at: new Date().toISOString()
              })
            })
          }
        })
      }

      setDemoVideos(allVideos)

    } catch (error) {
      console.error('Failed to load category data:', error)
      setError('Failed to load category data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading category data...</p>
        </div>
      </div>
    )
  }

  if (error || !categoryData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Category Not Found</h3>
          <p className="text-muted-foreground">
            {error || 'The requested category could not be found.'}
          </p>
      </div>
    </div>
  )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              {categoryData.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">{categoryData.name}</h1>
            <p className="text-muted-foreground">{categoryData.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="demos" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Demo Projects
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Live Clients
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Demo Videos
          </TabsTrigger>
        </TabsList>

          {/* Demo Projects Tab */}
          <TabsContent value="demos" className="space-y-6">
            {demoProjects.length > 0 ? (
              <div className="space-y-8">
                {/* Admin & Dispatcher Panel Cards - 2 in a line */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Admin Panel Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="card-elevated hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Settings className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-semibold text-gray-900">Admin Panel</CardTitle>
                              <CardDescription className="text-sm text-gray-600">Manage your application</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Live
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <EmbeddedPreview
                          url={demoProjects[0]?.admin_panel_url || '#'}
                          title="Admin Panel"
                          className="mb-4"
                        />
                        <Button 
                          className="w-full justify-start bg-slate-700 hover:bg-slate-800 text-white border-0 shadow-sm" 
                          onClick={() => window.open(demoProjects[0]?.admin_panel_url || '#', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Admin Panel
                        </Button>
                        {demoProjects[0]?.admin_credentials && (
                          <CredentialsDisplay
                            username={demoProjects[0].admin_credentials.username}
                            password={demoProjects[0].admin_credentials.password}
                            title="Admin Credentials"
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Dispatcher Panel Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="card-elevated hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Settings className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-semibold text-gray-900">Dispatcher Panel</CardTitle>
                              <CardDescription className="text-sm text-gray-600">Manage dispatchers & orders</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            Live
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <EmbeddedPreview
                          url={demoProjects[0]?.dispatcher_panel_url || '#'}
                          title="Dispatcher Panel"
                          className="mb-4"
                        />
                        <Button 
                          className="w-full justify-start bg-gray-700 hover:bg-gray-800 text-white border-0 shadow-sm" 
                          onClick={() => window.open(demoProjects[0]?.dispatcher_panel_url || '#', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Dispatcher Panel
                        </Button>
                        {demoProjects[0]?.dispatcher_credentials && (
                          <CredentialsDisplay
                            username={demoProjects[0].dispatcher_credentials.username}
                            password={demoProjects[0].dispatcher_credentials.password}
                            title="Dispatcher Credentials"
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Application Card - Below the panels */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="card-elevated hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-semibold text-gray-900">Mobile Applications</CardTitle>
                            <CardDescription className="text-sm text-gray-600">Android & iOS mobile apps</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                          Available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Android User App */}
                        {demoProjects[0]?.android_user_app && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800">Android User</h4>
                                <p className="text-xs text-gray-600">Mobile app for users</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm text-sm" 
                              onClick={() => window.open(demoProjects[0]?.android_user_app, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}

                        {/* Android Driver App */}
                        {demoProjects[0]?.android_driver_app && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800">Android Driver</h4>
                                <p className="text-xs text-gray-600">Mobile app for drivers</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm text-sm" 
                              onClick={() => window.open(demoProjects[0]?.android_driver_app, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}

                        {/* iOS User App */}
                        {demoProjects[0]?.ios_user_app && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800">iOS User</h4>
                                <p className="text-xs text-gray-600">Mobile app for users</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm text-sm" 
                              onClick={() => window.open(demoProjects[0]?.ios_user_app, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}

                        {/* iOS Driver App */}
                        {demoProjects[0]?.ios_driver_app && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800">iOS Driver</h4>
                                <p className="text-xs text-gray-600">Mobile app for drivers</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm text-sm" 
                              onClick={() => window.open(demoProjects[0]?.ios_driver_app, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            ) : (
              <Card className="card-elevated text-center py-16 bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200">
                <CardContent>
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Monitor className="h-10 w-10 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Demo Projects</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Demo projects for this category are coming soon. Check back later for exciting new projects!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Live Clients Tab */}
          <TabsContent value="live" className="space-y-6">
            {liveClients.length > 0 ? (
              <div className="space-y-8">
                {/* Admin & Dispatcher Panel Cards - 2 in a line */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Admin Panel Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="card-elevated hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Settings className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-semibold text-gray-900">Admin Panel</CardTitle>
                              <CardDescription className="text-sm text-gray-600">Manage your application</CardDescription>
                            </div>
                          </div>
                          <Badge 
                            variant={liveClients[0]?.status === 'active' ? 'default' : liveClients[0]?.status === 'maintenance' ? 'secondary' : 'destructive'}
                            className={`text-xs ${
                              liveClients[0]?.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 
                              liveClients[0]?.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                              'bg-red-100 text-red-700 border-red-200'
                            }`}
                          >
                            {liveClients[0]?.status || 'Live'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <EmbeddedPreview
                          url={liveClients[0]?.admin_panel_url || '#'}
                          title="Admin Panel"
                          className="mb-4"
                        />
                        <Button 
                          className="w-full justify-start bg-slate-700 hover:bg-slate-800 text-white border-0 shadow-sm" 
                          onClick={() => window.open(liveClients[0]?.admin_panel_url || '#', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Admin Panel
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Dispatcher Panel Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="card-elevated hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Settings className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-semibold text-gray-900">Dispatcher Panel</CardTitle>
                              <CardDescription className="text-sm text-gray-600">Manage dispatchers & orders</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            Live
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <EmbeddedPreview
                          url={liveClients[0]?.dispatcher_panel_url || '#'}
                          title="Dispatcher Panel"
                          className="mb-4"
                        />
                        <Button 
                          className="w-full justify-start bg-gray-700 hover:bg-gray-800 text-white border-0 shadow-sm" 
                          onClick={() => window.open(liveClients[0]?.dispatcher_panel_url || '#', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Dispatcher Panel
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Application Card - Below the panels */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="card-elevated hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-semibold text-gray-900">Mobile Applications</CardTitle>
                            <CardDescription className="text-sm text-gray-600">Android & iOS mobile apps</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                          Available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Android User App */}
                        {liveClients[0]?.android_user_app && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800">Android User</h4>
                                <p className="text-xs text-gray-600">Mobile app for users</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm text-sm" 
                              onClick={() => window.open(liveClients[0]?.android_user_app, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}

                        {/* Android Driver App */}
                        {liveClients[0]?.android_driver_app && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800">Android Driver</h4>
                                <p className="text-xs text-gray-600">Mobile app for drivers</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm text-sm" 
                              onClick={() => window.open(liveClients[0]?.android_driver_app, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}

                        {/* iOS User App */}
                        {liveClients[0]?.ios_user_app && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800">iOS User</h4>
                                <p className="text-xs text-gray-600">Mobile app for users</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm text-sm" 
                              onClick={() => window.open(liveClients[0]?.ios_user_app, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}

                        {/* iOS Driver App */}
                        {liveClients[0]?.ios_driver_app && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800">iOS Driver</h4>
                                <p className="text-xs text-gray-600">Mobile app for drivers</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm text-sm" 
                              onClick={() => window.open(liveClients[0]?.ios_driver_app, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            ) : (
              <Card className="card-elevated text-center py-12">
                <CardContent>
                  <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Live Clients</h3>
                  <p className="text-muted-foreground">
                    Live client projects for this category are coming soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Demo Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            {demoVideos.length > 0 ? (
              <div>
                {/* Custom layout based on number of videos */}
                {demoVideos.length === 1 && (
                  <div className="flex justify-center">
                    <motion.div
                      key={demoVideos[0].id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-md"
                    >
                      <YouTubeVideoCard
                        title={demoVideos[0].title}
                        description={demoVideos[0].description}
                        youtubeUrl={demoVideos[0].youtube_url}
                        thumbnailUrl={demoVideos[0].thumbnail_url}
                      />
                    </motion.div>
                  </div>
                )}

                {demoVideos.length === 2 && (
                  <div className="flex justify-center gap-6">
                    {demoVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="w-full max-w-sm"
                      >
                        <YouTubeVideoCard
                          title={video.title}
                          description={video.description}
                          youtubeUrl={video.youtube_url}
                          thumbnailUrl={video.thumbnail_url}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {demoVideos.length === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {demoVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <YouTubeVideoCard
                          title={video.title}
                          description={video.description}
                          youtubeUrl={video.youtube_url}
                          thumbnailUrl={video.thumbnail_url}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {demoVideos.length === 4 && (
                  <div className="space-y-8">
                    {/* First row - 3 videos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {demoVideos.slice(0, 3).map((video, index) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <YouTubeVideoCard
                            title={video.title}
                            description={video.description}
                            youtubeUrl={video.youtube_url}
                            thumbnailUrl={video.thumbnail_url}
                          />
                        </motion.div>
                      ))}
                    </div>
                    {/* Second row - 1 video centered */}
                    <div className="flex justify-center">
                      <motion.div
                        key={demoVideos[3].id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="w-full max-w-md"
                      >
                        <YouTubeVideoCard
                          title={demoVideos[3].title}
                          description={demoVideos[3].description}
                          youtubeUrl={demoVideos[3].youtube_url}
                          thumbnailUrl={demoVideos[3].thumbnail_url}
                        />
                      </motion.div>
                    </div>
                  </div>
                )}

                {demoVideos.length === 5 && (
                  <div className="space-y-8">
                    {/* First row - 3 videos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {demoVideos.slice(0, 3).map((video, index) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <YouTubeVideoCard
                            title={video.title}
                            description={video.description}
                            youtubeUrl={video.youtube_url}
                            thumbnailUrl={video.thumbnail_url}
                          />
                        </motion.div>
                      ))}
                    </div>
                    {/* Second row - 2 videos positioned to align with first and second cards above */}
                    <div className="flex justify-center gap-6">
                      <div className="w-full max-w-sm">
                        <motion.div
                          key={demoVideos[3].id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <YouTubeVideoCard
                            title={demoVideos[3].title}
                            description={demoVideos[3].description}
                            youtubeUrl={demoVideos[3].youtube_url}
                            thumbnailUrl={demoVideos[3].thumbnail_url}
                          />
                        </motion.div>
                      </div>
                      <div className="w-full max-w-sm">
                        <motion.div
                          key={demoVideos[4].id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                        >
                          <YouTubeVideoCard
                            title={demoVideos[4].title}
                            description={demoVideos[4].description}
                            youtubeUrl={demoVideos[4].youtube_url}
                            thumbnailUrl={demoVideos[4].thumbnail_url}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}

                {demoVideos.length > 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {demoVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <YouTubeVideoCard
                          title={video.title}
                          description={video.description}
                          youtubeUrl={video.youtube_url}
                          thumbnailUrl={video.thumbnail_url}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="card-elevated text-center py-12">
                <CardContent>
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Demo Videos</h3>
                  <p className="text-muted-foreground">
                    Demo videos for this category are coming soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>


        </Tabs>
      </motion.div>

      {/* Website Preview Modal */}
      <WebsitePreview
        url={previewState.url}
        title={previewState.title}
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState({ isOpen: false, url: "", title: "" })}
      />
    </div>
  )
}