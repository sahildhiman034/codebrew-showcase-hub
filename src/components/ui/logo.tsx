import React from "react"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showText?: boolean
  variant?: "default" | "white" | "dark"
  mobileCompact?: boolean
}

export const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  className = "", 
  showText = false, // Changed default to false
  variant = "default",
  mobileCompact = false
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 sm:w-8 sm:h-8",
    sm: "w-8 h-8 sm:w-12 sm:h-12",
    md: "w-10 h-10 sm:w-16 sm:h-16", 
    lg: "w-12 h-12 sm:w-20 sm:h-20",
    xl: "w-16 h-16 sm:w-24 sm:h-24"
  }

  const textClasses = {
    default: "text-foreground",
    white: "text-white",
    dark: "text-gray-900"
  }

  const textSizeClasses = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg", 
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl"
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <img 
        src="/logo-no-text.png" 
        alt="Code Brew Labs" 
        className={`${sizeClasses[size]} object-contain drop-shadow-sm rounded-lg`}
        draggable={false}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeClasses[size]} ${textClasses[variant]} ${
            mobileCompact ? 'hidden sm:block' : ''
          }`}>
            CODE BREW
          </span>
          <span className={`font-bold text-xs sm:text-sm ${textClasses[variant]}/80 ${
            mobileCompact ? 'hidden sm:block' : ''
          }`}>
            LABS
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
