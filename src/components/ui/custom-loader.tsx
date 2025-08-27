import React from 'react'
import { Logo } from './logo'

interface CustomLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const CustomLoader: React.FC<CustomLoaderProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 ${className}`}>
      {/* CODEBREW LABS Logo */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <Logo size="xl" showText={true} />
      </div>

      {/* Green Spinner */}
      <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-green-500 rounded-full animate-spin`}></div>
    </div>
  )
}

export default CustomLoader
