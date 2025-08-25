import React, { useState } from "react"
import { useLocation } from "react-router-dom"
import AppSidebar from "./AppSidebar"
import { Footer } from "./Footer"
import { AdminFooter } from "./AdminFooter"
import { Logo } from "@/components/ui/logo"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith('/admin')) {
      return "Admin Panel"
    } else if (path === '/dashboard') {
      return "Dashboard"
    } else if (path.startsWith('/category/')) {
      return "Category Details"
    } else if (path === '/status') {
      return "Status Monitor"
    } else if (path === '/integrations') {
      return "Integrations"
    }
    return "Dashboard"
  }

  const getPageDescription = () => {
    const path = location.pathname
    if (path.startsWith('/admin')) {
      return "Manage your portfolio data and system settings"
    } else if (path === '/dashboard') {
      return "Professional Portfolio & Client Management Platform"
    } else if (path.startsWith('/category/')) {
      return "View category details and projects"
    } else if (path === '/status') {
      return "Monitor system status and uptime"
    } else if (path === '/integrations') {
      return "Configure external integrations"
    }
    return "Professional Portfolio & Client Management Platform"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Fixed Position */}
      <div className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <AppSidebar isCollapsed={sidebarCollapsed} />
      </div>
      
      {/* Main Content Area - With proper margin */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center px-6 shadow-sm z-30 relative">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          
          {/* Dashboard text on the left */}
          <div className="flex items-center mr-6">
            <h2 className="text-lg font-bold text-black">
              Dashboard
            </h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center gap-4"
          >
            {/* Logo removed */}
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="overflow-auto scrollbar-hide bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 max-w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Footer - Use AdminFooter for admin pages, regular Footer for others */}
      {location.pathname.startsWith('/admin') ? <AdminFooter /> : <Footer />}
    </div>
  )
}