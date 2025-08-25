import React from "react"
import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { 
  Settings, 
  Users, 
  FolderOpen, 
  Monitor, 
  Globe,
  Database,
  LogOut
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface AdminLayoutProps {
  children: React.ReactNode
}

const adminTabs = [
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "demos", label: "Demo Projects", icon: Monitor },
  { id: "clients", label: "Live Clients", icon: Globe },
  { id: "users", label: "Users", icon: Users },
]

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  
  const currentTab = location.pathname.split('/').pop() || 'categories'

  const handleTabChange = (value: string) => {
    navigate(`/admin/${value}`)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-primary rounded-xl">
            <Settings className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
            <p className="text-muted-foreground text-lg">
              Manage your portfolio data and system settings
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Connected to Supabase</span>
          </div>
          
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </motion.div>

      {/* Admin Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted">
            {adminTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="space-y-6">
            {children}
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}