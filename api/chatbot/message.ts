import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, visitor_id } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Generate visitor ID if not provided
    const finalVisitorId = visitor_id || generateVisitorId()

    // Get or create session
    const sessionId = await getOrCreateSession(finalVisitorId)

    // Store user message
    const userMessageId = await storeMessage(sessionId, finalVisitorId, message, 'user')

    // Generate AI response
    const aiResponse = await generateAIResponse(message)

    // Store bot response
    const botMessageId = await storeMessage(sessionId, finalVisitorId, aiResponse, 'bot')

    // Update session message count
    await updateSessionMessageCount(sessionId)

    res.status(200).json({
      success: true,
      message: aiResponse,
      session_id: sessionId,
      visitor_id: finalVisitorId,
      response_time: Date.now()
    })
  } catch (error) {
    console.error('Chatbot API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: "I apologize, but I'm having trouble processing your request right now. Please try again."
    })
  }
}

function generateVisitorId(): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 10)
  return `VIS_${timestamp}_${random}`
}

async function getOrCreateSession(visitorId: string): Promise<string> {
  // Check for existing active session
  const { data: existingSession } = await supabase
    .from('chatbot_sessions')
    .select('id')
    .eq('visitor_id', visitorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)

  if (existingSession && existingSession.length > 0) {
    return existingSession[0].id
  }

  // Create new session
  const currentTime = new Date().toISOString()
  const { data: newSession, error } = await supabase
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

  if (error) throw error
  return newSession.id
}

async function storeMessage(
  sessionId: string, 
  visitorId: string, 
  content: string, 
  senderType: 'user' | 'bot' | 'admin'
): Promise<string> {
  const currentTime = new Date().toISOString()
  const { data: message, error } = await supabase
    .from('chatbot_messages')
    .insert({
      session_id: sessionId,
      visitor_id: visitorId,
      content: content,
      sender_type: senderType,
      created_at: currentTime
    })
    .select('id')
    .single()

  if (error) throw error
  return message.id
}

async function generateAIResponse(userMessage: string): Promise<string> {
  // Simple AI response logic - you can enhance this
  const responses = [
    "Thank you for your message! I'm here to help you with any questions about our services.",
    "I understand your inquiry. Let me assist you with that.",
    "That's a great question! Here's what I can tell you about that.",
    "I'm here to help! Could you please provide more details about your request?",
    "Thank you for reaching out. I'll do my best to assist you."
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

async function updateSessionMessageCount(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('chatbot_sessions')
    .update({ 
      total_messages: supabase.rpc('increment'),
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (error) throw error
}
