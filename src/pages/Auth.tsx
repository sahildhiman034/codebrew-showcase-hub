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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(120,119,198,0.05)_25%,rgba(120,119,198,0.05)_50%,transparent_50%,transparent_75%,rgba(120,119,198,0.05)_75%)] bg-[length:20px_20px]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10 flex flex-col items-center"
      >
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center justify-center text-center mb-10"
        >
          <div className="flex items-center justify-center mb-8">
            <Logo size="3xl" className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">Code Brew Labs</h1>
          <p className="text-gray-600 text-lg font-medium">Professional Portfolio & Client Management</p>
        </motion.div>

        {/* Auth Card */}
        <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2"></div>
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              {isLogin 
                ? "Sign in to access your professional dashboard" 
                : "Join the Code Brew Labs platform"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all duration-200"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-14 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all duration-200"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all duration-200 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] mt-8"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
                >
                  {isLogin ? "Create one now" : "Sign in here"}
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
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-green-800">Demo Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-green-700">Email</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-lg text-sm font-mono text-gray-700">
                  sahilcodebrew77@gmail.com
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-green-700">Password</Label>
                <div className="mt-1 p-3 bg-white border border-green-200 rounded-lg text-sm font-mono text-gray-700">
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