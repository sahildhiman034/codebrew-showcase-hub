import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, User as DBUser } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { verifyPassword, hashPassword } from '@/lib/utils'

interface AuthContextType {
  user: User | null
  customUser: DBUser | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, phoneNumber: string) => Promise<boolean>
  signOut: () => Promise<void>
  verifyEmail: (token: string) => Promise<boolean>
  verifyPhone: (phoneNumber: string, otp: string) => Promise<boolean>
  sendPhoneOTP: (phoneNumber: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [customUser, setCustomUser] = useState<DBUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const isAdmin = customUser?.role === 'admin'

  // Debug logging
  useEffect(() => {
    console.log('AuthContext Debug:', {
      customUser,
      isAdmin,
      user: user?.email
    })
  }, [customUser, isAdmin, user])

  const fetchCustomUser = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching custom user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching custom user:', error)
      return null
    }
  }

  const fetchCurrentUser = async (userEmail: string) => {
    try {
      const userData = await fetchCustomUser(userEmail)
      if (userData) {
        setCustomUser(userData)
        console.log('Custom user set:', userData)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const createDefaultAdmin = async () => {
    try {
      // Check if any users exist
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (checkError) {
        console.error('Error checking users:', checkError)
        return
      }

      // If no users exist, create default admin
      if (!existingUsers || existingUsers.length === 0) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            email: 'sahilcodebrew77@gmail.com',
            password: 'Qwerty#125656', // Plain text password
            full_name: 'Sahil Code Brew',
            role: 'admin',
            is_verified: true,
            is_active: true
          })

        if (insertError) {
          console.error('Error creating default admin:', insertError)
        } else {
          console.log('Default admin user created successfully')
        }
      }
    } catch (error) {
      console.error('Error in createDefaultAdmin:', error)
    }
  }

  useEffect(() => {
    // Get initial session immediately
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch custom user data if session exists
        if (session?.user?.email) {
          await fetchCurrentUser(session.user.email)
        }
      }
      setLoading(false)
    }

    getSession()

    // Create default admin user in background (non-blocking)
    createDefaultAdmin()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user?.email) {
          await fetchCurrentUser(session.user.email)
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          })
        } else if (event === 'SIGNED_OUT') {
          setCustomUser(null)
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [toast])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('SignIn attempt:', { email, password })
      
      // Check database for user with matching email and password
      const { data: userData, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // Check plain text password
        .eq('is_active', true)
        .single()

      if (findError || !userData) {
        console.log('User not found or password incorrect')
        toast({
          title: "Sign in failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
        return false
      }

      console.log('User found:', userData)

      // Set the user data
      setCustomUser(userData)
      setUser({
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      } as User)

      toast({
        title: "Welcome back!",
        description: `Welcome, ${userData.full_name || userData.email}!`,
      })

      return true
    } catch (error) {
      console.error('SignIn error:', error)
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
      return false
    }
  }

  const signUp = async (email: string, password: string, phoneNumber: string): Promise<boolean> => {
    try {
      console.log('SignUp attempt:', { email, password, phoneNumber })
      
      // Check if user already exists
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        toast({
          title: "Sign up failed",
          description: "User with this email already exists",
          variant: "destructive",
        })
        return false
      }

      // Use static verification codes
      const emailToken = "123456"
      const phoneOTP = "123456"
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email,
          phone_number: phoneNumber,
          password: password, // Store plain text password
          full_name: email.split('@')[0], // Use email prefix as name
          role: 'user', // Default role
          is_email_verified: false,
          is_phone_verified: false,
          is_verified: false,
          is_active: true,
          is_vendor_created: false,
          email_verification_token: emailToken,
          phone_verification_otp: phoneOTP,
          phone_verification_expires: otpExpires.toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        toast({
          title: "Sign up failed",
          description: "Failed to create account",
          variant: "destructive",
        })
        return false
      }

      console.log('New user created:', newUser)

      // Send verification email (mock implementation)
      console.log('Email verification token:', emailToken)
      console.log('Phone verification OTP:', phoneOTP)

      toast({
        title: "Account created",
        description: "Please check your email and phone for verification codes.",
      })
      
      return true
    } catch (error) {
      console.error('SignUp error:', error)
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
      return false
    }
  }

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      // Check if token matches static OTP
      if (token !== "123456") {
        toast({
          title: "Verification failed",
          description: "Invalid verification code. Use: 123456",
          variant: "destructive",
        })
        return false
      }

      const { data: user, error } = await supabase
        .from('users')
        .update({ 
          is_email_verified: true,
          email_verification_token: null
        })
        .eq('email_verification_token', token)
        .select()
        .single()

      if (error || !user) {
        toast({
          title: "Verification failed",
          description: "Invalid or expired verification token",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Email verified",
        description: "Your email has been verified successfully!",
      })
      return true
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "An error occurred during verification",
        variant: "destructive",
      })
      return false
    }
  }

  const verifyPhone = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      // Check if OTP matches static OTP
      if (otp !== "123456") {
        toast({
          title: "Verification failed",
          description: "Invalid OTP. Use: 123456",
          variant: "destructive",
        })
        return false
      }

      const { data: user, error } = await supabase
        .from('users')
        .update({ 
          is_phone_verified: true,
          phone_verification_otp: null,
          phone_verification_expires: null
        })
        .eq('phone_number', phoneNumber)
        .eq('phone_verification_otp', otp)
        .gt('phone_verification_expires', new Date().toISOString())
        .select()
        .single()

      if (error || !user) {
        toast({
          title: "Verification failed",
          description: "Invalid or expired OTP",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Phone verified",
        description: "Your phone number has been verified successfully!",
      })
      return true
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "An error occurred during verification",
        variant: "destructive",
      })
      return false
    }
  }

  const sendPhoneOTP = async (phoneNumber: string): Promise<boolean> => {
    try {
      // Use static OTP
      const otp = "123456"
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      const { error } = await supabase
        .from('users')
        .update({ 
          phone_verification_otp: otp,
          phone_verification_expires: otpExpires.toISOString()
        })
        .eq('phone_number', phoneNumber)

      if (error) {
        toast({
          title: "OTP send failed",
          description: "Failed to send OTP",
          variant: "destructive",
        })
        return false
      }

      console.log('Phone OTP sent:', otp) // In production, this would be sent via SMS
      toast({
        title: "OTP sent",
        description: "Verification code sent to your phone",
      })
      return true
    } catch (error) {
      toast({
        title: "OTP send failed",
        description: "An error occurred while sending OTP",
        variant: "destructive",
      })
      return false
    }
  }

  const signOut = async (): Promise<void> => {
    setUser(null)
    setCustomUser(null)
    setSession(null)
    
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    })
  }

  const value = {
    user,
    customUser,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    verifyPhone,
    sendPhoneOTP,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}