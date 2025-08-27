import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { visitor_id, limit = 50 } = req.query

    if (!visitor_id) {
      return res.status(400).json({ error: 'Visitor ID is required' })
    }

    const { data, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('visitor_id', visitor_id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string))

    if (error) throw error

    res.status(200).json({
      success: true,
      messages: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Chat History API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}
