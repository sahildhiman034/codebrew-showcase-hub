import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, Bot, User } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp?: Date
}

interface StaticChatbotProps {
  position?: 'bottom-right' | 'bottom-left'
  theme?: 'light' | 'dark'
}

// Static responses for the chatbot
const STATIC_RESPONSES = {
  greetings: [
    "Hello! 👋 I'm your AI Assistant powered by Code Brew Labs. 🚀",
    "Hi there! I'm here to help you with any questions about our services.",
    "Welcome! How can I assist you today?"
  ],
  services: [
    "We offer comprehensive development services including:\n• AI Development & Machine Learning\n• Blockchain Solutions\n• Mobile App Development\n• Web Development\n• Custom Software Solutions\n\nWhat specific service are you interested in?",
    "Our services include AI development, blockchain solutions, mobile apps, web development, and custom software. Which area would you like to learn more about?"
  ],
  contact: [
    "You can reach us at:\n📧 Email: info@code-brew.com\n📞 Phone: +1-800-CODE-BREW\n🌐 Website: https://www.code-brew.com\n\nWe're available Monday to Friday, 10:00 AM to 7:30 PM.",
    "Contact us at info@code-brew.com or call +1-800-CODE-BREW. We're here to help!"
  ],
  pricing: [
    "Our pricing varies based on project requirements and complexity. We offer competitive rates and flexible payment plans. Would you like to schedule a consultation to discuss your specific needs?",
    "We provide custom quotes based on your project requirements. Let's discuss your needs to give you an accurate estimate."
  ],
  default: [
    "Thank you for your message! I'm here to help you with any questions about our services.",
    "I understand your inquiry. Let me assist you with that.",
    "That's a great question! Here's what I can tell you about that.",
    "I'm here to help! Could you please provide more details about your request?",
    "Thank you for reaching out. I'll do my best to assist you."
  ]
}

// Function to generate appropriate response based on user input
const generateStaticResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  // Check for greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return STATIC_RESPONSES.greetings[Math.floor(Math.random() * STATIC_RESPONSES.greetings.length)]
  }
  
  // Check for services
  if (message.includes('service') || message.includes('what do you do') || message.includes('offer')) {
    return STATIC_RESPONSES.services[Math.floor(Math.random() * STATIC_RESPONSES.services.length)]
  }
  
  // Check for contact
  if (message.includes('contact') || message.includes('email') || message.includes('phone') || message.includes('reach')) {
    return STATIC_RESPONSES.contact[Math.floor(Math.random() * STATIC_RESPONSES.contact.length)]
  }
  
  // Check for pricing
  if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
    return STATIC_RESPONSES.pricing[Math.floor(Math.random() * STATIC_RESPONSES.pricing.length)]
  }
  
  // Default response
  return STATIC_RESPONSES.default[Math.floor(Math.random() * STATIC_RESPONSES.default.length)]
}

export const StaticChatbot: React.FC<StaticChatbotProps> = ({
  position = 'bottom-right',
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: "Hello! 👋 I'm your AI Assistant powered by Code Brew Labs. 🚀\nI'm here to help you with queries, guide you through processes, and provide quick solutions.\nWhether it's about projects, services, or support, I've got you covered 24/7.\nThis chatbot is owned and managed by Sahil, ensuring you always get the best experience.\nHow can I assist you today? 🌟",
          sender: 'bot',
          timestamp: new Date()
        }
      ])
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate API delay
    setTimeout(() => {
      const botResponse = generateStaticResponse(userMessage.text)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! 👋 I'm your AI Assistant powered by Code Brew Labs. 🚀\nI'm here to help you with queries, guide you through processes, and provide quick solutions.\nWhether it's about projects, services, or support, I've got you covered 24/7.\nThis chatbot is owned and managed by Sahil, ensuring you always get the best experience.\nHow can I assist you today? 🌟",
        sender: 'bot',
        timestamp: new Date()
      }
    ])
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  const themeClasses = {
    light: 'bg-white border-gray-200 text-gray-900',
    dark: 'bg-gray-900 border-gray-700 text-white'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg ${
          theme === 'light' 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-16 right-0 w-80 h-96 ${themeClasses[theme]} rounded-lg shadow-xl border flex flex-col`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs opacity-70">Code Brew Labs</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-green-500 text-white'
                        : theme === 'light'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-white'
                  }`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Clear Chat Button */}
              <div className="mt-3 flex justify-center border-t border-gray-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  disabled={messages.length <= 1}
                >
                  🗑️ Clear Chat
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StaticChatbot
