import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  Building2,
  ShoppingCart,
  GraduationCap,
  Music,
  Shirt,
  CreditCard,
  Dumbbell,
  Utensils,
  ShoppingBag,
  Heart,
  Wrench,
  Car,
  Home,
  Briefcase,
  Palette,
  Camera,
  Gamepad2,
  Baby,
  Plane,
  Ship,
  Train,
  Bike,
  Bus,
  Truck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Logo } from "@/components/ui/logo"
import { supabase } from "@/lib/supabase"

// Icon mapping for categories
const iconMap: { [key: string]: any } = {
  "Beauty & Salon": Sparkles,
  "Chandigarh": Building2,
  "E-commerce": ShoppingCart,
  "Education": GraduationCap,
  "Entertainment": Music,
  "Fashion & Retail": Shirt,
  "Finance": CreditCard,
  "Fitness & Wellness": Dumbbell,
  "Food & Restaurant": Utensils,
  "Grocery & Market": ShoppingBag,
  "Healthcare": Heart,
  "Local Services": Wrench,
  "Transportation": Car,
  "Real Estate": Home,
  "Professional Services": Briefcase,
  "Creative & Design": Palette,
  "Photography": Camera,
  "Gaming": Gamepad2,
  "Childcare": Baby,
  "Travel": Plane,
  "Maritime": Ship,
  "Railway": Train,
  "Bicycle": Bike,
  "Public Transport": Bus,
  "Logistics": Truck,
  "Motorcycle": Car
}

interface AppSidebarProps {
  isCollapsed?: boolean
}

export default function AppSidebar({ isCollapsed = false }: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, isAdmin, customUser } = useAuth()
  const [categories, setCategories] = useState<Array<{id: string, name: string, icon: any}>>([])
  const [loading, setLoading] = useState(true)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (error) {
          console.error('Error fetching categories:', error)
        } else {
          // Map database categories to include icons
          const categoriesWithIcons = data?.map(category => ({
            id: category.id,
            name: category.name,
            icon: iconMap[category.name] || Sparkles // Default to Sparkles if icon not found
          })) || []
          setCategories(categoriesWithIcons)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className={`flex flex-col h-screen bg-[#2F3C51] text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header - Fixed Logo */}
      <div className={`border-b border-gray-600 flex justify-center transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <Logo size={isCollapsed ? "sm" : "lg"} showText={false} />
      </div>

      {/* Content - Scrollable Dashboard + Categories */}
      <div className={`flex-1 overflow-y-auto space-y-2 transition-all duration-300 ${isCollapsed ? 'px-1 py-2' : 'px-2 py-4'}`}>
        {/* Dashboard */}
        <div 
          className={`sidebar-item flex items-center gap-2 font-medium cursor-pointer transition-colors ${
            isActive('/dashboard') 
              ? 'bg-green-400 text-white rounded-lg' 
              : 'hover:bg-gray-600 rounded-lg'
          } ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'}`}
          onClick={() => navigate('/dashboard')}
        >
          <LayoutDashboard className="h-4 w-4" />
          {!isCollapsed && <span>Dashboard</span>}
        </div>

        {/* Categories Section */}
        {!isCollapsed && <h4 className="text-sm text-gray-400 mt-4 mb-2 px-3">CATEGORIES</h4>}
        <div className="space-y-2">
          {loading ? (
            <div className={`text-gray-400 text-sm ${isCollapsed ? 'px-2 py-2 text-center' : 'px-3 py-2'}`}>
              {isCollapsed ? '...' : 'Loading categories...'}
            </div>
          ) : (
            categories.map((category) => {
              const IconComponent = category.icon
              return (
                <div
                  key={category.id}
                  className={`sidebar-item flex items-center gap-2 cursor-pointer transition-colors hover:bg-gray-600 rounded-lg ${
                    isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'
                  }`}
                  onClick={() => navigate(`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`)}
                  title={isCollapsed ? category.name : undefined}
                >
                  <IconComponent className="h-4 w-4" />
                  {!isCollapsed && <span>{category.name}</span>}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer - Fixed Status + Admin Panel + Logout */}
      <div className={`border-t border-gray-600 space-y-2 transition-all duration-300 ${isCollapsed ? 'px-1 py-2' : 'px-2 py-4'}`}>
        {/* Status */}
        <div 
          className={`sidebar-item flex items-center gap-2 cursor-pointer transition-colors ${
            isActive('/status') 
              ? 'bg-green-400 text-white rounded-lg' 
              : 'hover:bg-gray-600 rounded-lg'
          } ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'}`}
          onClick={() => navigate('/status')}
          title={isCollapsed ? 'Status' : undefined}
        >
          <BarChart3 className="h-4 w-4" />
          {!isCollapsed && <span>Status</span>}
        </div>

        {/* Admin Panel - Only visible to admins */}
        {(isAdmin || customUser?.role === 'admin') && (
          <div 
            className={`sidebar-item flex items-center gap-2 cursor-pointer transition-colors ${
              location.pathname.startsWith('/admin') 
                ? 'bg-green-400 text-white rounded-lg' 
                : 'hover:bg-gray-600 rounded-lg'
            } ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'}`}
            onClick={() => navigate('/admin/categories')}
            title={isCollapsed ? 'Admin Panel' : undefined}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span>Admin Panel</span>}
          </div>
        )}

        {/* Logout */}
        <div 
          className={`sidebar-item flex items-center gap-2 cursor-pointer transition-colors hover:bg-gray-600 rounded-lg ${
            isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-3'
          }`}
          onClick={handleLogout}
          title={isCollapsed ? 'Log Out' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Log Out</span>}
        </div>
      </div>
    </div>
  )
}