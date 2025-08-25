import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Save, X, ExternalLink } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase, DemoProject, Category } from "@/lib/supabase"
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

export default function DemosAdmin() {
  const [demos, setDemos] = useState<DemoProject[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDemo, setEditingDemo] = useState<DemoProject | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    demo_videos: [] as string[],
    admin_panel_url: "",
    admin_credentials: {
      username: "",
      password: ""
    },
    dispatcher_panel_url: "",
    dispatcher_credentials: {
      username: "",
      password: ""
    },
    android_user_app: "",
    android_driver_app: "",
    ios_user_app: "",
    ios_driver_app: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchDemos()
    fetchCategories()
  }, [])

  const fetchDemos = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_projects')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDemos(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch demo projects",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const demoData = {
        category_id: formData.category_id,
        name: formData.name,
        description: formData.description,
        demo_videos: formData.demo_videos,
        admin_panel_url: formData.admin_panel_url,
        admin_credentials: formData.admin_credentials,
        dispatcher_panel_url: formData.dispatcher_panel_url,
        dispatcher_credentials: formData.dispatcher_credentials,
        android_user_app: formData.android_user_app,
        android_driver_app: formData.android_driver_app,
        ios_user_app: formData.ios_user_app,
        ios_driver_app: formData.ios_driver_app
      }

      if (editingDemo) {
        // Update existing demo
        const { error } = await supabase
          .from('demo_projects')
          .update({
            ...demoData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDemo.id)

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Demo project updated successfully"
        })
      } else {
        // Create new demo
        const { error } = await supabase
          .from('demo_projects')
          .insert(demoData)

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Demo project created successfully"
        })
      }

      resetForm()
      fetchDemos()
    } catch (error: any) {
      console.error('Demo operation error:', error)
      toast({
        title: "Error",
        description: error?.message || "Operation failed. Please check your database connection.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (demo: DemoProject) => {
    setEditingDemo(demo)
    setFormData({
      category_id: demo.category_id,
      name: demo.name,
      description: demo.description || "",
      demo_videos: demo.demo_videos || [],
      admin_panel_url: demo.admin_panel_url || "",
      admin_credentials: demo.admin_credentials || { username: "", password: "" },
      dispatcher_panel_url: demo.dispatcher_panel_url || "",
      dispatcher_credentials: demo.dispatcher_credentials || { username: "", password: "" },
      android_user_app: demo.android_user_app || "",
      android_driver_app: demo.android_driver_app || "",
      ios_user_app: demo.ios_user_app || "",
      ios_driver_app: demo.ios_driver_app || ""
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (demoId: string) => {
    if (!confirm("Are you sure you want to delete this demo project?")) return

    try {
      const { error } = await supabase
        .from('demo_projects')
        .delete()
        .eq('id', demoId)

      if (error) throw error
      
      toast({
        title: "Success",
        description: "Demo project deleted successfully"
      })
      fetchDemos()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete demo project",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      category_id: "",
      name: "",
      description: "",
      demo_videos: [],
      admin_panel_url: "",
      admin_credentials: { username: "", password: "" },
      dispatcher_panel_url: "",
      dispatcher_credentials: { username: "", password: "" },
      android_user_app: "",
      android_driver_app: "",
      ios_user_app: "",
      ios_driver_app: ""
    })
    setEditingDemo(null)
    setShowAddDialog(false)
  }

  const addVideo = () => {
    setFormData({
      ...formData,
      demo_videos: [...formData.demo_videos, ""]
    })
  }

  const removeVideo = (index: number) => {
    const newVideos = formData.demo_videos.filter((_, i) => i !== index)
    setFormData({ ...formData, demo_videos: newVideos })
  }

  const updateVideo = (index: number, value: string) => {
    const newVideos = [...formData.demo_videos]
    newVideos[index] = value
    setFormData({ ...formData, demo_videos: newVideos })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Demo Projects Management</h2>
          <p className="text-muted-foreground">Manage your demo projects and videos</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Demo Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDemo ? "Edit Demo Project" : "Add New Demo Project"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., FoodDelight Restaurant Demo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this demo project"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Demo Videos</Label>
                {formData.demo_videos.map((video, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={video}
                      onChange={(e) => updateVideo(index, e.target.value)}
                      placeholder="Video URL"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeVideo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addVideo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_panel_url">Admin Panel URL</Label>
                  <Input
                    id="admin_panel_url"
                    value={formData.admin_panel_url}
                    onChange={(e) => setFormData({ ...formData, admin_panel_url: e.target.value })}
                    placeholder="https://admin.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_username">Admin Username</Label>
                  <Input
                    id="admin_username"
                    value={formData.admin_credentials.username}
                    onChange={(e) => setFormData({
                      ...formData,
                      admin_credentials: {
                        ...formData.admin_credentials,
                        username: e.target.value
                      }
                    })}
                    placeholder="admin_user"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_password">Admin Password</Label>
                  <Input
                    id="admin_password"
                    value={formData.admin_credentials.password}
                    onChange={(e) => setFormData({
                      ...formData,
                      admin_credentials: {
                        ...formData.admin_credentials,
                        password: e.target.value
                      }
                    })}
                    placeholder="admin_pass"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dispatcher_panel_url">Dispatcher Panel URL</Label>
                  <Input
                    id="dispatcher_panel_url"
                    value={formData.dispatcher_panel_url}
                    onChange={(e) => setFormData({ ...formData, dispatcher_panel_url: e.target.value })}
                    placeholder="https://dispatcher.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dispatcher_username">Dispatcher Username</Label>
                  <Input
                    id="dispatcher_username"
                    value={formData.dispatcher_credentials.username}
                    onChange={(e) => setFormData({
                      ...formData,
                      dispatcher_credentials: {
                        ...formData.dispatcher_credentials,
                        username: e.target.value
                      }
                    })}
                    placeholder="dispatcher_user"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dispatcher_password">Dispatcher Password</Label>
                  <Input
                    id="dispatcher_password"
                    value={formData.dispatcher_credentials.password}
                    onChange={(e) => setFormData({
                      ...formData,
                      dispatcher_credentials: {
                        ...formData.dispatcher_credentials,
                        password: e.target.value
                      }
                    })}
                    placeholder="dispatcher_pass"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="android_user_app">Android User App URL</Label>
                  <Input
                    id="android_user_app"
                    value={formData.android_user_app}
                    onChange={(e) => setFormData({ ...formData, android_user_app: e.target.value })}
                    placeholder="https://user.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="android_driver_app">Android Driver App URL</Label>
                  <Input
                    id="android_driver_app"
                    value={formData.android_driver_app}
                    onChange={(e) => setFormData({ ...formData, android_driver_app: e.target.value })}
                    placeholder="https://driver.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ios_user_app">iOS User App URL</Label>
                  <Input
                    id="ios_user_app"
                    value={formData.ios_user_app}
                    onChange={(e) => setFormData({ ...formData, ios_user_app: e.target.value })}
                    placeholder="https://user.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ios_driver_app">iOS Driver App URL</Label>
                  <Input
                    id="ios_driver_app"
                    value={formData.ios_driver_app}
                    onChange={(e) => setFormData({ ...formData, ios_driver_app: e.target.value })}
                    placeholder="https://driver.example.com"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingDemo ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Demos Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Demo Projects ({demos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {demos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No demo projects found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Videos</TableHead>
                  <TableHead>Admin Panel</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demos.map((demo, index) => (
                  <motion.tr
                    key={demo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TableCell className="font-medium">{demo.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {(demo as any).categories?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{demo.demo_videos?.length || 0} videos</Badge>
                    </TableCell>
                    <TableCell>
                      {demo.admin_panel_url ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(demo.admin_panel_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(demo.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(demo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(demo.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}