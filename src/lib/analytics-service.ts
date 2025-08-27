import { supabase } from './supabase'

class AnalyticsService {
  // Generate daily analytics
  async generateDailyAnalytics(date: string = new Date().toISOString().split('T')[0]): Promise<void> {
    try {
      console.log('📊 Generating analytics for date:', date)
      
      // Get sessions for the date
      const { data: sessions, error: sessionsError } = await supabase
        .from('chatbot_sessions')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`)

      if (sessionsError) throw sessionsError

      // Get messages for the date
      const { data: messages, error: messagesError } = await supabase
        .from('chatbot_messages')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`)

      if (messagesError) throw messagesError

      // Calculate analytics
      const totalSessions = sessions?.length || 0
      const totalMessages = messages?.length || 0
      const uniqueVisitors = sessions ? new Set(sessions.map(s => s.visitor_id)).size : 0
      
      // Calculate average response time
      const botMessages = messages?.filter(m => m.sender_type === 'bot' && m.response_time_ms) || []
      const avgResponseTime = botMessages.length > 0 
        ? Math.round(botMessages.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / botMessages.length)
        : 0

      // Get most common questions
      const userMessages = messages?.filter(m => m.sender_type === 'user') || []
      const questionCounts: { [key: string]: number } = {}
      
      userMessages.forEach(msg => {
        const question = msg.content.toLowerCase().trim()
        questionCounts[question] = (questionCounts[question] || 0) + 1
      })

      const mostCommonQuestions = Object.entries(questionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([question, count]) => ({ question, count }))

      // Insert or update analytics record
      const { error: upsertError } = await supabase
        .from('chatbot_analytics')
        .upsert({
          date,
          total_sessions: totalSessions,
          total_messages: totalMessages,
          unique_visitors: uniqueVisitors,
          avg_response_time_ms: avgResponseTime,
          most_common_questions: mostCommonQuestions,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'date'
        })

      if (upsertError) throw upsertError

      console.log('✅ Analytics generated successfully:', {
        date,
        totalSessions,
        totalMessages,
        uniqueVisitors,
        avgResponseTime
      })
    } catch (error) {
      console.error('❌ Error generating analytics:', error)
    }
  }

  // Generate analytics for the last N days
  async generateLastNDaysAnalytics(days: number = 7): Promise<void> {
    const promises = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      promises.push(this.generateDailyAnalytics(dateStr))
    }
    
    await Promise.all(promises)
  }

  // Get real-time statistics
  async getRealTimeStats(): Promise<{
    totalSessions: number
    activeSessions: number
    totalMessages: number
    totalFAQs: number
    avgResponseTime: number
  }> {
    try {
      // Get total sessions
      const { count: totalSessions } = await supabase
        .from('chatbot_sessions')
        .select('*', { count: 'exact', head: true })

      // Get active sessions
      const { count: activeSessions } = await supabase
        .from('chatbot_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get total messages
      const { count: totalMessages } = await supabase
        .from('chatbot_messages')
        .select('*', { count: 'exact', head: true })

      // Get total FAQs
      const { count: totalFAQs } = await supabase
        .from('chatbot_faq')
        .select('*', { count: 'exact', head: true })

      // Get average response time
      const { data: botMessages } = await supabase
        .from('chatbot_messages')
        .select('response_time_ms')
        .eq('sender_type', 'bot')
        .not('response_time_ms', 'is', null)

      const avgResponseTime = botMessages && botMessages.length > 0
        ? Math.round(botMessages.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / botMessages.length)
        : 0

      return {
        totalSessions: totalSessions || 0,
        activeSessions: activeSessions || 0,
        totalMessages: totalMessages || 0,
        totalFAQs: totalFAQs || 0,
        avgResponseTime
      }
    } catch (error) {
      console.error('❌ Error getting real-time stats:', error)
      return {
        totalSessions: 0,
        activeSessions: 0,
        totalMessages: 0,
        totalFAQs: 0,
        avgResponseTime: 0
      }
    }
  }

  // Get trending data for charts
  async getTrendingData(days: number = 7): Promise<Array<{
    date: string
    sessions: number
    messages: number
    visitors: number
    responseTime: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('chatbot_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(days)

      if (error) throw error

      return (data || []).reverse().map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: item.total_sessions,
        messages: item.total_messages,
        visitors: item.unique_visitors,
        responseTime: item.avg_response_time_ms
      }))
    } catch (error) {
      console.error('❌ Error getting trending data:', error)
      return []
    }
  }
}

export const analyticsService = new AnalyticsService()
export default analyticsService
