import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export const AdminFooter: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin, customUser } = useAuth()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-center">
        {/* Status and Admin Panel */}
        <div className="flex items-center gap-4">
          {/* Status Button */}
          <Button
            variant={isActive('/status') ? "default" : "outline"}
            size="sm"
            onClick={() => navigate('/status')}
            className={`flex items-center gap-2 ${
              isActive('/status') 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Status
          </Button>

          {/* Admin Panel Button - Only visible to admins */}
          {(isAdmin || customUser?.role === 'admin') && (
            <Button
              variant={location.pathname.startsWith('/admin') ? "default" : "outline"}
              size="sm"
              onClick={() => navigate('/admin/categories')}
              className={`flex items-center gap-2 ${
                location.pathname.startsWith('/admin') 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Settings className="h-4 w-4" />
              Admin Panel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
