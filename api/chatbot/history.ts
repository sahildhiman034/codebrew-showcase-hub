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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { visitor_id, session_id } = req.query

    if (!visitor_id && !session_id) {
      return res.status(400).json({ error: 'visitor_id or session_id is required' })
    }

    let query = supabase
      .from('chatbot_messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (visitor_id) {
      query = query.eq('visitor_id', visitor_id)
    }

    if (session_id) {
      query = query.eq('session_id', session_id)
    }

    const { data: messages, error } = await query

    if (error) throw error

    res.status(200).json({
      success: true,
      messages: messages || [],
      count: messages?.length || 0
    })
  } catch (error) {
    console.error('History API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      messages: [],
      count: 0
    })
  }
}
