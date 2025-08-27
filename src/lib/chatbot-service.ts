import { supabase, ChatbotSession, ChatbotMessage, ChatbotFAQ, ChatbotSetting, ChatbotAnalytics } from './supabase'
import { aiService } from './ai-service'

class ChatbotService {
  private visitorId: string | null = null
  private sessionId: string | null = null

  // Generate unique visitor ID
  private generateVisitorId(): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 10)
    return `VIS_${timestamp}_${random}`
  }

  // Get or create visitor ID
  getVisitorId(): string {
    if (!this.visitorId) {
      // Try to get from localStorage first
      const stored = localStorage.getItem('chatbot_visitor_id')
      if (stored) {
        this.visitorId = stored
      } else {
        this.visitorId = this.generateVisitorId()
        localStorage.setItem('chatbot_visitor_id', this.visitorId)
      }
    }
    return this.visitorId
  }

  // Get or create chat session
  async getOrCreateSession(): Promise<string> {
    if (this.sessionId) {
      return this.sessionId
    }

    const visitorId = this.getVisitorId()
    
    try {
      // First, try to find an existing active session
      const { data: existingSession, error: findError } = await supabase
        .from('chatbot_sessions')
        .select('id')
        .eq('visitor_id', visitorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (findError) throw findError

      if (existingSession && existingSession.length > 0) {
        this.sessionId = existingSession[0].id
        return existingSession[0].id
      }

      // Create new session if none exists
      const currentTime = new Date().toISOString()
      const { data: newSession, error: createError } = await supabase
        .from('chatbot_sessions')
        .insert({
          visitor_id: visitorId,
          status: 'active',
          total_messages: 0,
          session_start: currentTime,
          created_at: currentTime,
          updated_at: currentTime
        })
        .select('id')
        .single()

      if (createError) throw createError

      this.sessionId = newSession.id
      return newSession.id
    } catch (error) {
      console.error('Error getting/creating session:', error)
      throw error
    }
  }

  // Store a message in the database
  async storeMessage(
    content: string,
    senderType: 'user' | 'bot' | 'admin',
    messageType: 'text' | 'image' | 'file' | 'system' = 'text',
    metadata?: any,
    responseTimeMs?: number
  ): Promise<void> {
    try {
      const sessionId = await this.getOrCreateSession()
      const visitorId = this.getVisitorId()

      console.log('📝 Storing message:', { content, senderType, sessionId, visitorId })

      const currentTime = new Date().toISOString()
      const { error } = await supabase
        .from('chatbot_messages')
        .insert({
          session_id: sessionId,
          visitor_id: visitorId,
          message_type: messageType,
          sender_type: senderType,
          content,
          metadata,
          response_time_ms: responseTimeMs,
          created_at: currentTime
        })

      if (error) throw error

      // Update session message count
      await this.updateSessionMessageCount(sessionId)
      
      console.log('✅ Message stored successfully')
    } catch (error) {
      console.error('❌ Error storing message:', error)
    }
  }

  // Update session message count
  private async updateSessionMessageCount(sessionId: string): Promise<void> {
    try {
      // Get current message count
      const { data: messages, error: countError } = await supabase
        .from('chatbot_messages')
        .select('id')
        .eq('session_id', sessionId)

      if (countError) throw countError

      const messageCount = messages ? messages.length : 0

      // Update session with new count
      const { error } = await supabase
        .from('chatbot_sessions')
        .update({ 
          total_messages: messageCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error
      
      console.log('📊 Updated session message count:', messageCount)
    } catch (error) {
      console.error('❌ Error updating session message count:', error)
    }
  }

  // Get chat history for a visitor
  async getChatHistory(visitorId?: string, limit: number = 50): Promise<ChatbotMessage[]> {
    try {
      const targetVisitorId = visitorId || this.getVisitorId()

      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('visitor_id', targetVisitorId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting chat history:', error)
      return []
    }
  }

  // Get all chat sessions (admin only)
  async getAllSessions(limit: number = 100): Promise<ChatbotSession[]> {
    try {
      const { data, error } = await supabase
        .from('chatbot_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting all sessions:', error)
      return []
    }
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId: string): Promise<ChatbotMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting session messages:', error)
      return []
    }
  }

  // Delete a chat session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chatbot_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  }

  // End a chat session
  async endSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chatbot_sessions')
        .update({ 
          status: 'ended',
          session_end: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error
    } catch (error) {
      console.error('Error ending session:', error)
      throw error
    }
  }

  // Get FAQ entries
  async getFAQEntries(category?: string): Promise<ChatbotFAQ[]> {
    try {
      let query = supabase
        .from('chatbot_faq')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting FAQ entries:', error)
      return []
    }
  }

  // Add new FAQ entry
  async addFAQEntry(faq: Omit<ChatbotFAQ, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('chatbot_faq')
        .insert(faq)

      if (error) throw error
    } catch (error) {
      console.error('Error adding FAQ entry:', error)
      throw error
    }
  }

  // Update FAQ entry
  async updateFAQEntry(id: string, updates: Partial<ChatbotFAQ>): Promise<void> {
    try {
      const { error } = await supabase
        .from('chatbot_faq')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating FAQ entry:', error)
      throw error
    }
  }

  // Delete FAQ entry
  async deleteFAQEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chatbot_faq')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting FAQ entry:', error)
      throw error
    }
  }

  // Get chatbot settings
  async getSettings(): Promise<ChatbotSetting[]> {
    try {
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .order('setting_key')

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting settings:', error)
      return []
    }
  }

  // Update chatbot setting
  async updateSetting(key: string, value: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chatbot_settings')
        .update({ setting_value: value })
        .eq('setting_key', key)

      if (error) throw error
    } catch (error) {
      console.error('Error updating setting:', error)
      throw error
    }
  }

  // Get chatbot analytics
  async getAnalytics(date?: string): Promise<ChatbotAnalytics[]> {
    try {
      let query = supabase
        .from('chatbot_analytics')
        .select('*')
        .order('date', { ascending: false })

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting analytics:', error)
      return []
    }
  }

  // Process user message and generate response
  async processMessage(userMessage: string): Promise<{ message: string; webData?: any }> {
    const startTime = Date.now()

    try {
      // Store user message
      await this.storeMessage(userMessage, 'user')

      // Get conversation history for context
      const history = await this.getChatHistory(undefined, 10)
      const conversationHistory = history
        .filter(msg => msg.sender_type === 'user' || msg.sender_type === 'bot')
        .map(msg => ({
          role: msg.sender_type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }))
        .slice(-10)

      // Generate AI response
      const aiResponse = await aiService.generateResponse(userMessage, conversationHistory)
      
      const responseTime = Date.now() - startTime

      // Store bot response
      await this.storeMessage(
        aiResponse.message,
        'bot',
        'text',
        aiResponse.webData,
        responseTime
      )

      return {
        message: aiResponse.message,
        webData: aiResponse.webData
      }
    } catch (error) {
      console.error('Error processing message:', error)
      
      const errorMessage = "I apologize, but I'm having trouble processing your request right now. Please try again or contact our team directly."
      
      // Store error message
      await this.storeMessage(errorMessage, 'bot')
      
      return {
        message: errorMessage
      }
    }
  }

  // Check if FAQ matches user question
  async findFAQMatch(userQuestion: string): Promise<ChatbotFAQ | null> {
    try {
      const faqEntries = await this.getFAQEntries()
      const lowerQuestion = userQuestion.toLowerCase()

      // Simple keyword matching
      for (const faq of faqEntries) {
        if (faq.keywords) {
          for (const keyword of faq.keywords) {
            if (lowerQuestion.includes(keyword.toLowerCase())) {
              // Update usage count
              await this.updateFAQEntry(faq.id, {
                usage_count: faq.usage_count + 1
              })
              return faq
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error finding FAQ match:', error)
      return null
    }
  }

  // Get chatbot status
  async getChatbotStatus(): Promise<string> {
    try {
      const settings = await this.getSettings()
      const statusSetting = settings.find(s => s.setting_key === 'chatbot_status')
      return statusSetting?.setting_value || 'active'
    } catch (error) {
      console.error('Error getting chatbot status:', error)
      return 'active'
    }
  }

  // Clear visitor data (for privacy)
  clearVisitorData(): void {
    this.visitorId = null
    this.sessionId = null
    localStorage.removeItem('chatbot_visitor_id')
  }
}

export const chatbotService = new ChatbotService()
export default chatbotService
