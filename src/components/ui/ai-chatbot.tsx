import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, Bot, User, Settings, Key, Globe, ExternalLink } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Card, CardContent } from './card'
import { aiService } from '@/lib/ai-service'

interface WebSearchResult {
  title: string
  url: string
  snippet: string
  source: string
  timestamp?: string
  content?: string
  images?: string[]
  links?: string[]
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  webData?: WebSearchResult[]
}

interface AIChatbotProps {
  position?: 'bottom-right' | 'bottom-left'
  theme?: 'light' | 'dark'
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  position = 'bottom-right',
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant for Code Brew Labs! 🚀 I'm an AI-Driven Digital Transformation Company assistant with FULL BROWSER ACCESS capabilities. I can search the web in real-time, access our official website (https://www.code-brew.com), and provide comprehensive information about our services, portfolio, team, and company details. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState(aiService.getConfigurationStatus())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    try {
      // Convert messages to conversation history format for AI service
      const conversationHistory = messages
        .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        }))
        .slice(-10) // Keep last 10 messages for context

      const aiResponse = await aiService.generateResponse(userMessage.text, conversationHistory)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        sender: 'bot',
        timestamp: new Date(),
        webData: aiResponse.webData
      }
      
      setMessages(prev => [...prev, botMessage])
      
      // Log any API errors for debugging
      if (!aiResponse.success && aiResponse.error) {
        console.warn('AI Service Error:', aiResponse.error)
      }
      
    } catch (error) {
      console.error('Chat Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Please try again or contact our team directly.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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
        text: "Hello! I'm your AI assistant with FULL BROWSER ACCESS capabilities! 🌐 I can search the web in real-time, scrape any website, find current information, and provide up-to-date data from multiple sources. I have access to Google, Bing, DuckDuckGo, and can analyze any website you mention. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ])
  }

  return (
    <div className={`fixed ${position === 'bottom-right' ? 'bottom-32 right-4' : 'bottom-32 left-4'} z-[9999]`}>
      {/* Chat Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="mb-4"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="w-80 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative z-[9999]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-sm text-green-100">Code Brew Labs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfig(!showConfig)}
                    className="text-white hover:bg-green-600 p-1"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* API Status Indicator */}
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus.configured ? 'bg-green-300' : 'bg-yellow-300'}`}></div>
                <span className="text-xs text-green-100">
                  {apiStatus.configured ? 'AI Powered' : 'Local Mode'}
                </span>
              </div>
            </div>

            {/* Configuration Panel */}
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 p-3 border-b border-gray-200"
              >
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-3 h-3" />
                    <span>Status: {apiStatus.configured ? 'Connected' : 'Not Configured'}</span>
                  </div>
                  <div>Model: {apiStatus.model}</div>
                  <div>Max Tokens: {apiStatus.maxTokens}</div>
                  <div>Temperature: {apiStatus.temperature}</div>
                  {!apiStatus.configured && (
                    <div className="text-yellow-600 text-xs">
                      Add VITE_GEMINI_API_KEY to your environment variables for AI-powered responses.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className={`overflow-y-auto p-4 space-y-3 ${showConfig ? 'h-64' : 'h-80'}`}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      message.sender === 'user' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-lg px-3 py-2 text-sm ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.text}
                      
                                             {/* Web Search Results */}
                       {message.webData && message.webData.length > 0 && (
                         <div className="mt-3 space-y-2">
                           <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                             <Globe className="w-3 h-3" />
                             🌐 Real-time Web Data ({message.webData.length} sources)
                           </div>
                           {message.webData.map((result, index) => (
                             <div key={index} className="bg-white border border-green-200 rounded-md p-2 text-xs">
                               <div className="flex items-start justify-between gap-2">
                                 <div className="flex-1">
                                   <div className="font-medium text-gray-800 mb-1">{result.title}</div>
                                   <div className="text-gray-600 text-xs mb-1">{result.snippet}</div>
                                   <div className="flex items-center gap-2 text-green-600 text-xs">
                                     <span>{result.source}</span>
                                     {result.timestamp && (
                                       <span>• {new Date(result.timestamp).toLocaleTimeString()}</span>
                                     )}
                                   </div>
                                   
                                   {/* Additional Links */}
                                   {result.links && result.links.length > 0 && (
                                     <div className="mt-2 pt-2 border-t border-green-100">
                                       <div className="text-xs text-green-700 font-medium mb-1">Related Links:</div>
                                       <div className="flex flex-wrap gap-1">
                                         {result.links.slice(0, 3).map((link, linkIndex) => (
                                           <a
                                             key={linkIndex}
                                             href={link}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="text-xs text-green-600 hover:text-green-800 underline"
                                           >
                                             {new URL(link).hostname}
                                           </a>
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                   
                                   {/* Images */}
                                   {result.images && result.images.length > 0 && (
                                     <div className="mt-2 pt-2 border-t border-green-100">
                                       <div className="text-xs text-green-700 font-medium mb-1">Images:</div>
                                       <div className="flex gap-1">
                                         {result.images.slice(0, 2).map((image, imgIndex) => (
                                           <img
                                             key={imgIndex}
                                             src={image}
                                             alt="Website content"
                                             className="w-8 h-8 object-cover rounded border"
                                             onError={(e) => {
                                               e.currentTarget.style.display = 'none'
                                             }}
                                           />
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                 </div>
                                 <a 
                                   href={result.url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-green-500 hover:text-green-600 p-1"
                                   title="Open in new tab"
                                 >
                                   <ExternalLink className="w-3 h-3" />
                                 </a>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
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

export default AIChatbot
