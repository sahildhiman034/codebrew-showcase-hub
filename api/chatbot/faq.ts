import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
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
    const { data: faqs, error } = await supabase
      .from('chatbot_faqs')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    res.status(200).json({
      success: true,
      faqs: faqs || []
    })
  } catch (error) {
    console.error('FAQ API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      faqs: []
    })
  }
}
