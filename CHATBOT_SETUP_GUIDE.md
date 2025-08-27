# 🚀 Chatbot Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Set Up Supabase Database

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Copy the entire contents of `quick-chatbot-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

### Step 2: Verify Setup

After running the script, you should see:
- ✅ 5 tables created
- ✅ Sample data inserted
- ✅ RLS policies enabled

### Step 3: Test the Chatbot Admin

1. **Refresh your admin panel**
   - Go to: http://localhost:8080/admin/chatbot
   - Click the "Refresh" button

2. **You should now see:**
   - 📊 5 chat sessions (2 active, 2 ended, 1 archived)
   - 📝 5 FAQ entries with usage counts
   - ⚙️ 7 settings configured
   - 📈 7 days of analytics data

## What's Included in the Sample Data

### Chat Sessions
- `VIS_20241226_abc123` - Active (15 messages)
- `VIS_20241226_def456` - Ended (8 messages)
- `VIS_20241226_ghi789` - Active (23 messages)
- `VIS_20241226_jkl012` - Ended (12 messages)
- `VIS_20241226_mno345` - Archived (5 messages)

### FAQ Entries
- What services do you offer? (25 uses)
- How much does a website cost? (18 uses)
- Do you provide maintenance services? (12 uses)
- What technologies do you use? (8 uses)
- How long does development take? (15 uses)

### Analytics Data
- 7 days of trending data
- Increasing session and message counts
- Decreasing response times
- Real chart data for visualization

## Troubleshooting

### If you see "No Data Found":
1. Check that the SQL script ran successfully
2. Verify your Supabase connection in the browser console
3. Check the RLS policies are enabled

### If you see "Database Connection Error":
1. Verify your Supabase URL and API key in `src/lib/supabase.ts`
2. Check that your Supabase project is active
3. Ensure the tables were created successfully

### To add more test data:
```sql
-- Add more sessions
INSERT INTO chatbot_sessions (visitor_id, status, total_messages) VALUES
('VIS_20241226_test001', 'active', 10),
('VIS_20241226_test002', 'ended', 15);

-- Add more FAQ entries
INSERT INTO chatbot_faq (question, answer, category, keywords, priority, is_active, usage_count) VALUES
('Do you offer 24/7 support?', 'Yes, we provide 24/7 technical support for all our clients.', 'Support', ARRAY['support', '24/7', 'help'], 6, true, 5);
```

## Next Steps

Once the database is set up:
1. **Test the chatbot** - Try sending messages to see real-time data
2. **Customize FAQs** - Add your own FAQ entries
3. **Configure settings** - Adjust chatbot behavior
4. **Monitor analytics** - Watch the charts update in real-time

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase credentials
3. Ensure all tables were created successfully
4. Check that RLS policies are properly configured
