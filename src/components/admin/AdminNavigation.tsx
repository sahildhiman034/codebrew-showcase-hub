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
  LogOut,
  Menu,
  X
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useIsMobile } from "@/hooks/use-mobile"

interface AdminNavigationProps {
  children: React.ReactNode
}

const adminTabs = [
  { id: "categories", label: "Categories", icon: FolderOpen, path: "/admin/categories" },
  { id: "demos", label: "Demo Projects", icon: Monitor, path: "/admin/demos" },
  { id: "clients", label: "Live Clients", icon: Globe, path: "/admin/clients" },
  { id: "users", label: "Users", icon: Users, path: "/admin/users" },
]

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const isMobile = useIsMobile()
  
  const currentTab = location.pathname.split('/').pop() || 'categories'

  const handleTabChange = (value: string) => {
    const tab = adminTabs.find(tab => tab.id === value)
    if (tab) {
      navigate(tab.path)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-gradient-primary rounded-lg sm:rounded-xl">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold gradient-text">Admin Panel</h1>
            <p className="text-muted-foreground text-sm sm:text-lg">
              Manage your portfolio data and system settings
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-xs sm:text-sm font-medium text-green-700">Connected to Supabase</span>
          </div>
          
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
            <span className="sm:hidden">Logout</span>
          </Button>
        </div>
      </motion.div>

      {/* Admin Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="sm:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {adminTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={currentTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    currentTab === tab.id 
                      ? 'bg-green-500 text-white border-green-500' 
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted">
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
          </div>

          <div className="space-y-4 sm:space-y-6">
            {children}
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}
