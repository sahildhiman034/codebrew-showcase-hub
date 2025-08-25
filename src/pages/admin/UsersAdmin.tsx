import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Save, X, Mail, Shield, User, Phone, CheckCircle, AlertCircle, Eye, EyeOff, LogIn } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { supabase, User as CustomUser } from "@/lib/supabase"
import { hashPassword, verifyPassword } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
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

export default function UsersAdmin() {
  const [users, setUsers] = useState<CustomUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<CustomUser | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    role: "user" as "admin" | "user",
    is_vendor_created: false
  })
  
  // Password visibility states
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [userPasswords, setUserPasswords] = useState<{ [key: string]: string }>({})

  const { toast } = useToast()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      
      // Store passwords for admin viewing (plain text from database)
      const passwordMap: { [key: string]: string } = {}
      data?.forEach(user => {
        // Use the plain text password from the database
        passwordMap[user.id] = user.password || '••••••••'
      })
      setUserPasswords(passwordMap)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          email: formData.email,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          role: formData.role,
          is_vendor_created: formData.is_vendor_created
        }

        // Only update password if provided
        if (formData.password) {
          updateData.password = formData.password // Store plain text password only
          // Store plain text password for admin viewing
          setUserPasswords(prev => ({
            ...prev,
            [editingUser.id]: formData.password
          }))
        }

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id)

        if (error) throw error
        
        toast({
          title: "Success",
          description: "User updated successfully"
        })
      } else {
        // Create new user - Auto verify them
        const emailToken = Math.random().toString(36).substring(2, 15)
        const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

        // Create user data with plain text password only
        const userData: any = {
          email: formData.email,
          password: formData.password, // Store plain text password only
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          role: formData.role
        }

        // Try to add verification fields if they exist
        try {
          const { data, error } = await supabase
            .from('users')
            .insert({
              ...userData,
              // Auto verify the user
              is_email_verified: true,
              is_phone_verified: true,
              is_verified: true,
              // Store verification tokens for reference
              email_verification_token: emailToken,
              phone_verification_otp: phoneOTP,
              phone_verification_expires: otpExpires.toISOString()
            })
            .select()
            .single()

          if (error) {
            console.log('Trying with minimal fields due to error:', error.message)
            
            // Try with just the essential fields
            const { data: minimalData, error: minimalError } = await supabase
              .from('users')
              .insert({
                email: formData.email,
                password: formData.password, // Store plain text password only
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                role: formData.role
              })
              .select()
              .single()

            if (minimalError) {
              console.error('Minimal insert also failed:', minimalError)
              throw new Error(`Failed to create user: ${minimalError.message}`)
            }

            // Store plain text password for admin viewing
            if (minimalData) {
              setUserPasswords(prev => ({
                ...prev,
                [minimalData.id]: formData.password
              }))
            }
          } else {
            // Store plain text password for admin viewing
            if (data) {
              setUserPasswords(prev => ({
                ...prev,
                [data.id]: formData.password
              }))
            }
          }
        } catch (insertError: any) {
          console.error('Insert error:', insertError)
          throw new Error(`Failed to create user: ${insertError.message}`)
        }
        
        toast({
          title: "Success",
          description: "User created and verified successfully"
        })
      }
      
      resetForm()
      fetchUsers()
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (user: CustomUser) => {
    setEditingUser(user)
    setFormData({
      email: user.email || "",
      password: "", // Don't show existing password for security
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      role: user.role || "user",
      is_vendor_created: user.is_vendor_created || false
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      toast({
        title: "Success",
        description: "User deleted successfully"
      })
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  const handleToggleEmailVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_email_verified: !currentStatus,
          is_verified: !currentStatus // Also update general verification status
        })
        .eq('id', userId)

      if (error) throw error
      
      toast({
        title: "Success",
        description: `Email ${!currentStatus ? 'verified' : 'unverified'} successfully`
      })
      fetchUsers()
    } catch (error: any) {
      console.error('Error toggling email verification:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to toggle email verification",
        variant: "destructive"
      })
    }
  }

  const handleTogglePhoneVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_phone_verified: !currentStatus,
          is_verified: !currentStatus // Also update general verification status
        })
        .eq('id', userId)

      if (error) throw error
      
      toast({
        title: "Success",
        description: `Phone ${!currentStatus ? 'verified' : 'unverified'} successfully`
      })
      fetchUsers()
    } catch (error: any) {
      console.error('Error toggling phone verification:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to toggle phone verification",
        variant: "destructive"
      })
    }
  }

  const handleLoginAsUser = async (userEmail: string, userId: string) => {
    try {
      const userPassword = userPasswords[userId]
      if (!userPassword || userPassword === '••••••••') {
        toast({
          title: "Error",
          description: "Password not available for this user",
          variant: "destructive"
        })
        return
      }
      
      const success = await signIn(userEmail, userPassword)
      if (success) {
        toast({
          title: "Success",
          description: "Logged in as user successfully"
        })
        navigate("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to login as user",
        variant: "destructive"
      })
    }
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      phone_number: "",
      role: "user",
      is_vendor_created: false
    })
    setEditingUser(null)
    setShowAddDialog(false)
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
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
          <h2 className="text-2xl font-bold">Users Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "Enter new password" : "Enter password"}
                  required={!editingUser}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as "admin" | "user" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!editingUser && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Auto-Verification</span>
                  </div>
                  <p className="text-sm text-green-700">
                    New users will be automatically verified (email and phone) when created.
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingUser ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.is_email_verified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead>Phone Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || "N/A"}</TableCell>
                    <TableCell>{user.phone_number || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type={showPasswords[user.id] ? "text" : "password"}
                          value={userPasswords[user.id] || "••••••••"}
                          readOnly
                          className="w-24 h-8 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(user.id)}
                        >
                          {showPasswords[user.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_email_verified}
                          onCheckedChange={() => handleToggleEmailVerification(user.id, user.is_email_verified)}
                        />
                        {user.is_email_verified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_phone_verified}
                          onCheckedChange={() => handleTogglePhoneVerification(user.id, user.is_phone_verified)}
                        />
                        {user.is_phone_verified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoginAsUser(user.email, user.id)}
                          title="Login as this user"
                        >
                          <LogIn className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}