import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Save, X, ExternalLink, Shield, Smartphone, Globe } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase, LiveClient, Category } from "@/lib/supabase"
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

export default function ClientsAdmin() {
  const [clients, setClients] = useState<LiveClient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingClient, setEditingClient] = useState<LiveClient | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    admin_panel_url: "",
    dispatcher_panel_url: "",
    android_user_app: "",
    android_driver_app: "",
    ios_user_app: "",
    ios_driver_app: "",
    website_url: "",
    status: "active" as "active" | "inactive" | "maintenance"
  })
  const { toast } = useToast()

  // UUID validation function
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  useEffect(() => {
    fetchClients()
    fetchCategories()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('live_clients')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch live clients",
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
    
    // Validate required fields
    if (!formData.category_id || formData.category_id.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      })
      return
    }

    // Validate UUID format
    if (!isValidUUID(formData.category_id.trim())) {
      toast({
        title: "Validation Error",
        description: "Invalid category ID format",
        variant: "destructive"
      })
      return
    }

    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please enter a client name",
        variant: "destructive"
      })
      return
    }
    
    try {
      const clientData = {
        category_id: formData.category_id.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        admin_panel_url: formData.admin_panel_url.trim(),
        dispatcher_panel_url: formData.dispatcher_panel_url.trim(),
        android_user_app: formData.android_user_app.trim(),
        android_driver_app: formData.android_driver_app.trim(),
        ios_user_app: formData.ios_user_app.trim(),
        ios_driver_app: formData.ios_driver_app.trim(),
        website_url: formData.website_url.trim(),
        status: formData.status
      }

      if (editingClient) {
        const { error } = await supabase
          .from('live_clients')
          .update({
            ...clientData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingClient.id)

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Live client updated successfully"
        })
      } else {
        const { error } = await supabase
          .from('live_clients')
          .insert(clientData)

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Live client created successfully"
        })
      }

      resetForm()
      fetchClients()
    } catch (error: any) {
      console.error('Client operation error:', error)
      toast({
        title: "Error",
        description: error?.message || "Operation failed. Please check your database connection.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (client: LiveClient) => {
    setEditingClient(client)
    setFormData({
      category_id: client.category_id,
      name: client.name,
      description: client.description || "",
      admin_panel_url: client.admin_panel_url || "",
      dispatcher_panel_url: client.dispatcher_panel_url || "",
      android_user_app: client.android_user_app || "",
      android_driver_app: client.android_driver_app || "",
      ios_user_app: client.ios_user_app || "",
      ios_driver_app: client.ios_driver_app || "",
      website_url: client.website_url || "",
      status: client.status
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this live client?")) return

    try {
      const { error } = await supabase
        .from('live_clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error
      
      toast({
        title: "Success",
        description: "Live client deleted successfully"
      })
      fetchClients()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete live client",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      category_id: "",
      name: "",
      description: "",
      admin_panel_url: "",
      dispatcher_panel_url: "",
      android_user_app: "",
      android_driver_app: "",
      ios_user_app: "",
      ios_driver_app: "",
      website_url: "",
      status: "active"
    })
    setEditingClient(null)
    setShowAddDialog(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <h2 className="text-2xl font-bold">Live Clients Management</h2>
          <p className="text-muted-foreground">Manage your live client projects and credentials</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Live Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Edit Live Client" : "Add New Live Client"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="panels">Admin Panels</TabsTrigger>
                  <TabsTrigger value="apps">Mobile Apps</TabsTrigger>
                  <TabsTrigger value="website">Website</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
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
                    <Label>Client Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., FoodDelight Restaurant"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this live client"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive" | "maintenance") => 
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="panels" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </h4>
                    <div className="space-y-2">
                      <Label>Admin Panel URL</Label>
                      <Input
                        value={formData.admin_panel_url}
                        onChange={(e) => setFormData({ ...formData, admin_panel_url: e.target.value })}
                        placeholder="https://admin.client.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Dispatcher Panel</h4>
                    <div className="space-y-2">
                      <Label>Dispatcher Panel URL</Label>
                      <Input
                        value={formData.dispatcher_panel_url}
                        onChange={(e) => setFormData({ ...formData, dispatcher_panel_url: e.target.value })}
                        placeholder="https://dispatcher.client.com"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="apps" className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Applications
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Android User App</Label>
                      <Input
                        value={formData.android_user_app}
                        onChange={(e) => setFormData({ ...formData, android_user_app: e.target.value })}
                        placeholder="Play Store URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Android Driver App</Label>
                      <Input
                        value={formData.android_driver_app}
                        onChange={(e) => setFormData({ ...formData, android_driver_app: e.target.value })}
                        placeholder="Play Store URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>iOS User App</Label>
                      <Input
                        value={formData.ios_user_app}
                        onChange={(e) => setFormData({ ...formData, ios_user_app: e.target.value })}
                        placeholder="App Store URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>iOS Driver App</Label>
                      <Input
                        value={formData.ios_driver_app}
                        onChange={(e) => setFormData({ ...formData, ios_driver_app: e.target.value })}
                        placeholder="App Store URL"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="website" className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website Information
                  </h4>
                  
                  <div className="space-y-2">
                    <Label>Website URL</Label>
                    <Input
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://client.com"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingClient ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Live Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No live clients found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Panels</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {(client as any).categories?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {client.admin_panel_url && (
                          <Badge variant="outline" className="text-xs">Admin</Badge>
                        )}
                        {client.dispatcher_panel_url && (
                          <Badge variant="outline" className="text-xs">Dispatch</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(client.android_user_app || client.android_driver_app) && (
                          <Badge variant="outline" className="text-xs">Android</Badge>
                        )}
                        {(client.ios_user_app || client.ios_driver_app) && (
                          <Badge variant="outline" className="text-xs">iOS</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(client.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(client.id)}
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