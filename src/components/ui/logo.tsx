import React from "react"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showText?: boolean
  variant?: "default" | "white" | "dark"
}

export const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  className = "", 
  showText = true,
  variant = "default"
}) => {
  const sizeClasses = {
    xs: "w-24 h-24",
    sm: "w-28 h-28",
    md: "w-32 h-32", 
    lg: "w-40 h-40",
    xl: "w-48 h-48"
  }

  const textClasses = {
    default: "text-foreground",
    white: "text-white",
    dark: "text-gray-900"
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/src/assets/code-brew-labs-logo.png" 
        alt="Code Brew Labs" 
        className={`${sizeClasses[size]} object-contain drop-shadow-sm rounded-lg`}
        draggable={false}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-lg ${textClasses[variant]}`}>CODE BREW</span>
          <span className={`font-bold text-sm ${textClasses[variant]}/80`}>LABS</span>
        </div>
      )}
    </div>
  )
}

export default Logo
