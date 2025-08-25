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
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-muted flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold gradient-text mb-2">Code Brew Labs</h1>
          <p className="text-muted-foreground">Professional Portfolio & Client Management</p>
        </motion.div>

        {/* Auth Card */}
        <Card className="card-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Sign in to access your dashboard" 
                : "Join Code Brew Labs platform"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 btn-primary text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            {/* Email Verification Section */}
            {showEmailVerification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium text-blue-900">Email Verification</Label>
                </div>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Enter verification token"
                    value={emailVerificationToken}
                    onChange={(e) => setEmailVerificationToken(e.target.value)}
                    className="h-10"
                  />
                  <Button
                    onClick={handleEmailVerification}
                    disabled={verifyingEmail || !emailVerificationToken.trim()}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {verifyingEmail ? "Verifying..." : "Verify Email"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Phone Verification Section */}
            {showPhoneVerification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <Label className="text-sm font-medium text-green-900">Phone Verification</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={phoneOTP}
                      onChange={(e) => setPhoneOTP(e.target.value)}
                      className="h-10 flex-1"
                      maxLength={6}
                    />
                    <Button
                      onClick={handleSendOTP}
                      disabled={sendingOTP || !phoneNumber.trim()}
                      variant="outline"
                      className="h-10 px-3"
                    >
                      {sendingOTP ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>
                  <Button
                    onClick={handlePhoneVerification}
                    disabled={verifyingPhone || !phoneOTP.trim()}
                    className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {verifyingPhone ? "Verifying..." : "Verify Phone"}
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary-hover font-semibold p-0 h-auto"
              >
                {isLogin ? "Create one now" : "Sign in instead"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
              <p className="text-sm font-mono bg-surface px-2 py-1 rounded">
                sahilcodebrew77@gmail.com
              </p>
              <p className="text-sm font-mono bg-surface px-2 py-1 rounded mt-1">
                Qwerty#125656
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}