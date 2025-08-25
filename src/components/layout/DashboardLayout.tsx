import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import AppSidebar from "./AppSidebar"
import { Footer } from "./Footer"
import { AdminFooter } from "./AdminFooter"
import { Logo } from "@/components/ui/logo"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PanelLeft, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true)
    }
  }, [isMobile])
  
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

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={isMobile ? { x: -300 } : { width: sidebarCollapsed ? 64 : 256 }}
            animate={isMobile ? { x: 0 } : { width: sidebarCollapsed ? 64 : 256 }}
            exit={isMobile ? { x: -300 } : {}}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed top-0 left-0 h-full z-50 ${
              isMobile ? 'w-80' : ''
            }`}
          >
            <AppSidebar 
              isCollapsed={sidebarCollapsed} 
              onClose={() => setSidebarOpen(false)}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 shadow-sm z-30 relative">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:mr-4"
            onClick={toggleSidebar}
          >
            {isMobile ? (
              sidebarOpen ? <X className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          
          {/* Page Title */}
          <div className="flex items-center mr-4 lg:mr-6 flex-1">
            <h2 className="text-lg font-bold text-black truncate">
              {getPageTitle()}
            </h2>
          </div>
          
          {/* Mobile Logo */}
          {isMobile && (
            <div className="flex items-center">
              <Logo size="sm" showText={false} mobileCompact={true} />
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="overflow-auto scrollbar-hide bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-4 lg:p-6 max-w-full"
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