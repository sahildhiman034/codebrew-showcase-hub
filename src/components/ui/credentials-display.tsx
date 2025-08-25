import React, { useState } from "react"
import { Eye, EyeOff, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface CredentialsDisplayProps {
  username: string
  password: string
  title?: string
  className?: string
}

export const CredentialsDisplay: React.FC<CredentialsDisplayProps> = ({
  username,
  password,
  title = "Credentials",
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedUsername, setCopiedUsername] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async (text: string, type: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      
      if (type === 'username') {
        setCopiedUsername(true)
        setTimeout(() => setCopiedUsername(false), 2000)
      } else {
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
      }

      toast({
        title: "Copied!",
        description: `${type === 'username' ? 'Username' : 'Password'} copied to clipboard`,
        duration: 2000
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  return (
    <div className={`bg-surface p-4 rounded-lg border space-y-4 ${className}`}>
      <h4 className="font-medium text-sm">{title}</h4>
      
      {/* Username */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Username</Label>
        <div className="flex items-center gap-2">
          <Input
            value={username}
            readOnly
            className="flex-1 bg-surface-muted"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(username, 'username')}
            className="shrink-0"
          >
            {copiedUsername ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Password</Label>
        <div className="flex items-center gap-2">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            readOnly
            className="flex-1 bg-surface-muted"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPassword(!showPassword)}
            className="shrink-0"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(password, 'password')}
            className="shrink-0"
          >
            {copiedPassword ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CredentialsDisplay
