import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Save, X, FolderOpen, Calendar, Hash } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase, Category } from "@/lib/supabase"
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

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      console.error('Fetch categories error:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to fetch categories. Please check your database connection.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Category updated successfully"
        })
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            description: formData.description,
            icon: formData.icon
          })

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Category created successfully"
        })
      }

      // Reset form and refresh data
      setFormData({ name: "", description: "", icon: "" })
      setEditingCategory(null)
      setShowAddDialog(false)
      fetchCategories()
    } catch (error: any) {
      console.error('Database operation error:', error)
      toast({
        title: "Error",
        description: error?.message || "Operation failed. Please check your database connection.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || ""
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error
      
      toast({
        title: "Success",
        description: "Category deleted successfully"
      })
      fetchCategories()
    } catch (error: any) {
      console.error('Delete category error:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete category. Please check your database connection.",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", icon: "" })
    setEditingCategory(null)
    setShowAddDialog(false)
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Categories Management</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your portfolio categories</p>
          </div>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Food & Restaurant"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Icon Name</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., pizza, shopping-cart"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Icons</p>
                <p className="text-2xl font-bold text-green-600">
                  {categories.filter(c => c.icon).length}
                </p>
              </div>
              <Hash className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm font-bold">
                  {categories.length > 0 ? new Date(categories[0].updated_at || categories[0].created_at).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories Table/Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              All Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500 mb-4">Create your first category to organize your portfolio</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category, index) => (
                        <motion.tr
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="group hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {category.description || "-"}
                          </TableCell>
                          <TableCell>
                            {category.icon ? (
                              <Badge variant="secondary">{category.icon}</Badge>      
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(category.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(category.id)}
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
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FolderOpen className="h-4 w-4 text-blue-500" />
                            <h3 className="font-semibold text-sm sm:text-base truncate">{category.name}</h3>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {category.description || "No description"}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              {category.icon && (
                                <Badge variant="secondary" className="w-fit">
                                  {category.icon}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Created: {new Date(category.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="w-full sm:w-auto"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="w-full sm:w-auto text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}