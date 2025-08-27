import React, { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Phone, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/ui/logo"

export default function Auth() {
  // All hooks must be called at the top level, before any conditional returns
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Verification states
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [emailVerificationToken, setEmailVerificationToken] = useState("")
  const [phoneOTP, setPhoneOTP] = useState("")
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const [sendingOTP, setSendingOTP] = useState(false)
  
  const { signIn, signUp, verifyEmail, verifyPhone, sendPhoneOTP } = useAuth()
  const navigate = useNavigate()

  // Show loading state first
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Early returns after all hooks are called
  if (!isLoaded) {
    return null;
  }

  // Catch any errors and show a simple message
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let success = false
      if (isLogin) {
        success = await signIn(email, password)
      } else {
        success = await signUp(email, password, phoneNumber)
        if (success) {
          // Show verification options after successful signup
          setShowEmailVerification(true)
          setShowPhoneVerification(true)
        }
      }

      if (success && isLogin) {
        navigate("/dashboard")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailVerification = async () => {
    if (!emailVerificationToken.trim()) return
    
    setVerifyingEmail(true)
    try {
      const success = await verifyEmail(emailVerificationToken)
      if (success) {
        setShowEmailVerification(false)
        setEmailVerificationToken("")
      }
    } finally {
      setVerifyingEmail(false)
    }
  }

  const handlePhoneVerification = async () => {
    if (!phoneOTP.trim() || !phoneNumber.trim()) return
    
    setVerifyingPhone(true)
    try {
      const success = await verifyPhone(phoneNumber, phoneOTP)
      if (success) {
        setShowPhoneVerification(false)
        setPhoneOTP("")
      }
    } finally {
      setVerifyingPhone(false)
    }
  }

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) return
    
    setSendingOTP(true)
    try {
      const success = await sendPhoneOTP(phoneNumber)
      if (success) {
        // OTP sent successfully
      }
    } finally {
      setSendingOTP(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 flex flex-col items-center"
      >
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center justify-center text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <Logo size="3xl" className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">Code Brew Labs</h1>
          <p className="text-lg text-slate-600 font-medium">Professional Portfolio & Client Management</p>
        </motion.div>

        {/* Auth Card */}
        <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-slate-800">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              {isLogin 
                ? "Sign in to access your dashboard" 
                : "Join Code Brew Labs platform"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12 border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-slate-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
                >
                  {isLogin ? "Create one now" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 w-full max-w-md"
        >
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-green-800">Demo Credentials:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-700">Email:</Label>
                <div className="p-3 bg-white rounded-lg border border-green-200 text-sm font-mono text-slate-700">
                  sahilcodebrew77@gmail.com
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-700">Password:</Label>
                <div className="p-3 bg-white rounded-lg border border-green-200 text-sm font-mono text-slate-700">
                  Qwerty#125656
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

