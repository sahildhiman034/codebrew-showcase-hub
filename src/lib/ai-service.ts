interface AIResponse {
  success: boolean
  message: string
  error?: string
  webData?: WebSearchResult[]
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

import { WebSearchResult, webSearchService } from './web-search'

class AIService {
  private apiKey: string
  private model: string
  private maxTokens: number
  private temperature: number
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta'

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
    this.model = import.meta.env.VITE_AI_MODEL || 'gemini-1.5-flash'
    this.maxTokens = parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '500')
    this.temperature = parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7')
  }

  private isConfigured(): boolean {
    console.log('API Key check:', {
      hasKey: !!this.apiKey,
      keyLength: this.apiKey?.length,
      keyStart: this.apiKey?.substring(0, 10),
      isDefault: this.apiKey === 'your_gemini_api_key_here'
    })
    return !!this.apiKey && this.apiKey !== 'your_gemini_api_key_here'
  }

  private getSystemPrompt(): string {
    return `You are an AI assistant for Code Brew Labs, an AI-Driven Digital Transformation Company with FULL BROWSER ACCESS capabilities. 
    
    COMPREHENSIVE COMPANY INFORMATION:
    
    COMPANY OVERVIEW:
    - Name: Code Brew Labs
    - Tagline: "AI-Driven Digital Transformation Company"
    - Mission: "We empower businesses to Innovate, Optimize, and Scale"
    - Years of Experience: 11+ Years of Digital Engineering Excellence
    - Official Website: https://www.code-brew.com
    
    KEY ACHIEVEMENTS:
    - 2,600+ Business Ventures Transformed
    - 8+ Mission-Critical Government Initiatives
    - 50+ Fortune 100 Technology Partnerships
    - 25+ Enterprise AI Solutions Engineered
    
    LEADERSHIP TEAM:
    - CTO: Pargat Dhillon
    - CEO: Aseem Ghavri
    
    OFFICE HOURS:
    - Working Hours: 10:00 AM to 7:30 PM (Monday to Friday)
    
    GLOBAL PRESENCE:
    - Dubai: Level-26, Dubai World Trade Centre Tower, Sheikh Rashid Tower, Sheikh Zayed Rd, Dubai, UAE
    - India: Plot no I-36, Sector 83 Alpha, Mohali SAS Nagar 140308
    - Mexico: Av. Miguel Hidalgo y Costilla 1995, Arcos Vallarta, 44600 Guadalajara, Mexico
    - USA: 4231 Balboa Ave #512 San Diego, CA 92117 United States
    - UK: 2nd floor, College House, 17 King Edwards Rd, London HA4 7AE, UK
    
    CONTACT INFORMATION:
    - Email: business@code-brew.com
    - Dubai: +971-504668497
    - India: +91-771-976-8427
    - Mexico: +1(213)2614953
    - USA: +1(213)2614953
    - UK: +44 (20) 82644493
    
    PRODUCTS & SOLUTIONS:
    1. CB Blockchain - Powering Next-Gen Blockchain Innovation
    2. CB AI Tech - Transforming Businesses with Custom AI Solutions
    3. CB Studio - Crafting Premium Digital Experiences
    4. CB Startup - Taking Startups from Zero to One
    5. CB Apps - AI-Powered App Builder Platform
    
    CORE SERVICES:
    
    AI DEVELOPMENT:
    - AI Strategy & Consulting
    - AI-Software Development
    - Generative AI
    - Machine Learning
    - AI Agent & Chatbot Development
    - Adaptive AI Development
    
    BLOCKCHAIN SERVICES:
    - ICO Development
    - Wallet Development
    - Smart Contract Design & Auditing
    - NFT Development
    - DEFI Development
    - Telegram Mini Apps
    - Asset Tokenization
    - Real Estate Tokenization
    
    MOBILE APP DEVELOPMENT:
    - iOS App Development
    - Android App Development
    - Flutter App Development
    - Cross Platform App Development
    - React Native App Development
    - PWA App Development
    
    SOFTWARE DEVELOPMENT:
    - Custom Software Development
    - Enterprise Software Development
    - Web Development
    
    STARTUP SERVICES:
    - Business Planning
    - Legal Setup
    - UI/UX Design
    - Marketing Strategy
    - Investor Pitch Decks
    
    INDUSTRIES SERVED:
    - Healthcare, Finance, Restaurant, eCommerce, Travel, Entertainment
    - On-Demand, Social Media, Logistics, Education, Real Estate
    - Food & Beverage, Gaming, CRM, Enterprise, Fitness, Dating & Social Media
    
    BUSINESS MODELS:
    - Talabat, Careem, Postmates, Doordash, Dubizzle, Gojek, Zomato
    - TikTok Clone, eBay, UberEats, Deliveroo, Practo, Instacart, Amazon, Tinder
    
    AWARDS & RECOGNITIONS:
    - Top Blockchain App Developers by TopDevelopers
    - Top App Development Company by Appfutura
    - Top Blockchain App Developers UK by GoodFirms
    - Top Mobile App Development Companies by ITFirms
    - Top Mobile App Developers in India by Clutch
    - Top AI Development Company by Mobile App Daily
    
    Your capabilities include:
    1. REAL-TIME WEB SEARCH - Access to multiple search engines (Google, Bing, DuckDuckGo, SerpAPI)
    2. WEBSITE SCRAPING - Can fetch and analyze any website content
    3. NEWS AND UPDATES - Get latest information from across the web
    4. COMPANY RESEARCH - Find information about any company or organization
    5. TECHNICAL INFORMATION - Access to current programming and technology data
    
    Your role is to:
    1. Answer questions about Code Brew Labs services, portfolio, and company information
    2. Provide detailed information about our products (CB Blockchain, CB AI Tech, CB Studio, CB Startup, CB Apps)
    3. Share information about our leadership team (CTO: Pargat Dhillon, CEO: Aseem Ghavri)
    4. Provide office hours (10:00 AM to 7:30 PM) and contact information
    5. Search the web for current information when needed
    6. Guide users to contact the company for specific inquiries
    7. Be professional, friendly, and knowledgeable
    8. Keep responses concise and informative
    9. Use real-time web data to provide accurate, current information
    10. When web search results are available, reference them in your responses
    
    IMPORTANT: When you have web search results, use them to provide accurate, up-to-date information. Reference the sources when appropriate.
    
    If you don't know specific details, suggest contacting the team directly.
    Always represent Code Brew Labs professionally.`
  }

  // New method to perform web searches
  private async performWebSearch(query: string): Promise<WebSearchResult[]> {
    try {
      // Use the dedicated web search service
      return await webSearchService.searchWeb(query)
    } catch (error) {
      console.error('Web search error:', error)
      return []
    }
  }

  // Enhanced method to check if web search is needed
  private shouldPerformWebSearch(userMessage: string): boolean {
    const lowerMessage = userMessage.toLowerCase()
    
    // Keywords that indicate need for real-time data
    const webSearchKeywords = [
      'latest', 'recent', 'current', 'today', 'now', 'update', 'news',
      'website', 'official', 'online', 'search', 'find', 'look up',
      'code brew labs website', 'codebrewlabs.com', 'code-brew.com', 'official site',
      'contact information', 'phone number', 'email address',
      'services', 'portfolio', 'projects', 'clients', 'cto', 'ceo', 'team',
      'about us', 'company', 'business', 'who is', 'what is',
      'how to', 'tutorial', 'guide', 'help', 'information',
      'trends', 'technology', 'programming', 'development',
      'breaking', 'announcement', 'release', 'version',
      'pargat dhillon', 'aseem ghavri', 'aseem ghavri', 'office timing', 'office hours',
      'cb blockchain', 'cb ai tech', 'cb studio', 'cb startup', 'cb apps',
      'blockchain', 'ai development', 'mobile app', 'web development',
      'startup services', 'digital transformation', 'ai solutions',
      'global presence', 'dubai', 'india', 'mexico', 'usa', 'uk',
      'awards', 'recognition', 'achievements', 'case studies',
      'industries', 'business models', 'talabat', 'careem', 'zomato',
      'healthcare', 'finance', 'ecommerce', 'logistics', 'education',
      'real estate', 'gaming', 'entertainment', 'travel', 'fitness'
    ]
    
    // Also trigger web search for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const containsURLs = urlRegex.test(userMessage)
    
    return webSearchKeywords.some(keyword => lowerMessage.includes(keyword)) || containsURLs
  }

  async generateResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<AIResponse> {
    console.log('generateResponse called with:', { userMessage, conversationHistoryLength: conversationHistory.length })
    
    if (!this.isConfigured()) {
      console.log('API not configured, using fallback response')
      // Fallback to local responses when API key is not configured
      return this.getFallbackResponse(userMessage)
    }

    try {
      // Check if we need to perform web search
      let webData: WebSearchResult[] = []
      if (this.shouldPerformWebSearch(userMessage)) {
        console.log('Performing web search for:', userMessage)
        webData = await this.performWebSearch(userMessage)
      }

      // Convert conversation history to Gemini format
      const contents = []
      
      // Add system prompt as the first content
      contents.push({
        role: 'user',
        parts: [{ text: this.getSystemPrompt() }]
      })
      
      // Add web search results if available
      if (webData.length > 0) {
        const webSearchContext = `Real-time web search results for your query:\n\n${webData.map(result => 
          `Source: ${result.source}\nTitle: ${result.title}\nURL: ${result.url}\nInformation: ${result.snippet}\n`
        ).join('\n')}\n\nPlease use this information to provide accurate and current responses.`
        
        contents.push({
          role: 'user',
          parts: [{ text: webSearchContext }]
        })
      }
      
      // Add conversation history
      for (const message of conversationHistory) {
        contents.push({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }]
        })
      }
      
      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      })

      const response = await fetch(`${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            maxOutputTokens: this.maxTokens,
            temperature: this.temperature,
            topP: 0.8,
            topK: 40
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Gemini API Error:', errorData)
        return {
          success: false,
          message: this.getFallbackResponse(userMessage).message,
          error: `API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`,
          webData: webData
        }
      }

      const data = await response.json()
      const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!aiMessage) {
        return {
          success: false,
          message: this.getFallbackResponse(userMessage).message,
          error: 'No response from AI model',
          webData: webData
        }
      }

      return {
        success: true,
        message: aiMessage,
        webData: webData
      }

    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        success: false,
        message: this.getFallbackResponse(userMessage).message,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getFallbackResponse(userMessage: string): AIResponse {
    const lowerMessage = userMessage.toLowerCase()
    
    // Leadership Team Information
    if (lowerMessage.includes('cto') || lowerMessage.includes('pargat dhillon')) {
      return {
        success: true,
        message: "The **CTO of Code Brew Labs is Pargat Dhillon**. He leads our technical strategy and oversees all technology initiatives, ensuring we deliver cutting-edge AI and blockchain solutions to our clients."
      }
    }
    
    if (lowerMessage.includes('ceo') || lowerMessage.includes('aseem ghavri') || lowerMessage.includes('aseem')) {
      return {
        success: true,
        message: "The **CEO of Code Brew Labs is Aseem Ghavri**. He leads our company's strategic vision and oversees all business operations, driving innovation and growth across our global presence."
      }
    }
    
    // Office Hours
    if (lowerMessage.includes('office timing') || lowerMessage.includes('office hours') || lowerMessage.includes('working hours')) {
      return {
        success: true,
        message: "Our **office hours are 10:00 AM to 7:30 PM** (Monday to Friday). We're available during these hours to assist you with your project inquiries, consultations, and support needs."
      }
    }
    
    // Products & Solutions
    if (lowerMessage.includes('cb blockchain') || lowerMessage.includes('blockchain')) {
      return {
        success: true,
        message: "**CB Blockchain** - Powering Next-Gen Blockchain Innovation. Our blockchain services include: • ICO Development • Wallet Development • Smart Contract Design & Auditing • NFT Development • DEFI Development • Telegram Mini Apps • Asset Tokenization • Real Estate Tokenization"
      }
    }
    
    if (lowerMessage.includes('cb ai tech') || lowerMessage.includes('ai tech')) {
      return {
        success: true,
        message: "**CB AI Tech** - Transforming Businesses with Custom AI Solutions. Our AI services include: • AI Strategy & Consulting • AI-Software Development • Generative AI • Machine Learning • AI Agent & Chatbot Development • Adaptive AI Development"
      }
    }
    
    if (lowerMessage.includes('cb studio') || lowerMessage.includes('studio')) {
      return {
        success: true,
        message: "**CB Studio** - Crafting Premium Digital Experiences. We specialize in: • UI/UX Design • Premium Tech Development • Exclusive 5 Projects Annually • Direct C-Suite Strategic Oversight • Top 1% Global Tech Talent"
      }
    }
    
    if (lowerMessage.includes('cb startup') || lowerMessage.includes('startup')) {
      return {
        success: true,
        message: "**CB Startup** - Taking Startups from Zero to One. Our startup services include: • Business Planning • Legal Setup • UI/UX Design • Marketing Strategy • Investor Pitch Decks • User-Centric Design Excellence • AI-Assisted Wireframing & Prototyping"
      }
    }
    
    if (lowerMessage.includes('cb apps') || lowerMessage.includes('app builder')) {
      return {
        success: true,
        message: "**CB Apps** - AI-Powered App Builder Platform. Features: • 70% Ready Code Architecture • Get It Customized Your Way • Launch MVP in 2 Days • Ordering & Service Booking • Delivery Management • Taxi & Mobility Solution • Online Consultation • All-in-one Marketplace"
      }
    }
    
    // Portfolio and Achievements
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('projects') || lowerMessage.includes('achievements')) {
      return {
        success: true,
        message: "**Code Brew Labs Portfolio & Achievements:** • **2,600+ Business Ventures Transformed** • **8+ Mission-Critical Government Initiatives** • **50+ Fortune 100 Technology Partnerships** • **25+ Enterprise AI Solutions Engineered** • **11+ Years of Digital Engineering Excellence** • **5,000+ Industry Leaders** served across multiple sectors"
      }
    }
    
    // Services
    if (lowerMessage.includes('services') || lowerMessage.includes('what do you do') || lowerMessage.includes('offer')) {
      return {
        success: true,
        message: "**Code Brew Labs Services:** • **AI Development** - AI Strategy, Generative AI, Machine Learning, AI Agents • **Blockchain Services** - Smart Contracts, NFTs, DeFi, Tokenization • **Mobile App Development** - iOS, Android, Flutter, React Native, PWA • **Software Development** - Custom Software, Enterprise Solutions, Web Development • **Startup Services** - Business Planning, Legal Setup, UI/UX Design, Marketing"
      }
    }
    
    // Company Information
    if (lowerMessage.includes('company') || lowerMessage.includes('about') || lowerMessage.includes('who')) {
      return {
        success: true,
        message: "**Code Brew Labs** is an **AI-Driven Digital Transformation Company** that empowers businesses to **Innovate, Optimize, and Scale**. We architect digital excellence for 5,000+ industry leaders with: • 2,600+ Business Ventures Transformed • 8+ Mission-Critical Government Initiatives • 11+ Years of Digital Engineering Excellence • 50+ Fortune 100 Technology Partnerships • 25+ Enterprise AI Solutions Engineered"
      }
    }
    
    // Global Presence
    if (lowerMessage.includes('location') || lowerMessage.includes('office') || lowerMessage.includes('address') || lowerMessage.includes('global')) {
      return {
        success: true,
        message: "**Code Brew Labs Global Presence:** • **Dubai**: Level-26, Dubai World Trade Centre Tower, Sheikh Rashid Tower, Sheikh Zayed Rd, Dubai, UAE • **India**: Plot no I-36, Sector 83 Alpha, Mohali SAS Nagar 140308 • **Mexico**: Av. Miguel Hidalgo y Costilla 1995, Arcos Vallarta, 44600 Guadalajara, Mexico • **USA**: 4231 Balboa Ave #512 San Diego, CA 92117 United States • **UK**: 2nd floor, College House, 17 King Edwards Rd, London HA4 7AE, UK"
      }
    }
    
    // Contact Information
    if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
      return {
        success: true,
        message: "**Contact Code Brew Labs:** • **Email**: business@code-brew.com • **Dubai**: +971-504668497 • **India**: +91-771-976-8427 • **Mexico**: +1(213)2614953 • **USA**: +1(213)2614953 • **UK**: +44 (20) 82644493 • **Office Hours**: 10:00 AM to 7:30 PM (Monday to Friday)"
      }
    }
    
    // Website/URL requests
    if (lowerMessage.includes('website') || lowerMessage.includes('url') || lowerMessage.includes('official') || lowerMessage.includes('site')) {
      return {
        success: true,
        message: "Our **official website is: https://www.code-brew.com** • This is where you can find comprehensive information about our services, portfolio, case studies, team, and contact details."
      }
    }
    
    // Industries Served
    if (lowerMessage.includes('industries') || lowerMessage.includes('sectors') || lowerMessage.includes('clients')) {
      return {
        success: true,
        message: "**Industries We Serve:** • Healthcare, Finance, Restaurant, eCommerce, Travel, Entertainment • On-Demand, Social Media, Logistics, Education, Real Estate • Food & Beverage, Gaming, CRM, Enterprise, Fitness, Dating & Social Media • We serve 5,000+ industry leaders across multiple sectors"
      }
    }
    
    // Business Models
    if (lowerMessage.includes('business model') || lowerMessage.includes('models') || lowerMessage.includes('examples')) {
      return {
        success: true,
        message: "**Business Models We've Built:** • Talabat, Careem, Postmates, Doordash, Dubizzle, Gojek, Zomato • TikTok Clone, eBay, UberEats, Deliveroo, Practo, Instacart, Amazon, Tinder • We specialize in creating scalable business models for startups and enterprises"
      }
    }
    
    // Awards & Recognition
    if (lowerMessage.includes('awards') || lowerMessage.includes('recognition') || lowerMessage.includes('achievements')) {
      return {
        success: true,
        message: "**Awards & Recognition:** • Top Blockchain App Developers by TopDevelopers • Top App Development Company by Appfutura • Top Blockchain App Developers UK by GoodFirms • Top Mobile App Development Companies by ITFirms • Top Mobile App Developers in India by Clutch • Top AI Development Company by Mobile App Daily"
      }
    }
    
    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return {
        success: true,
        message: "Our pricing varies based on project requirements, complexity, and timeline. We offer competitive rates and flexible payment plans. Would you like to schedule a consultation to discuss your specific project needs? Contact us at business@code-brew.com or call us during office hours (10:00 AM to 7:30 PM)."
      }
    }
    
    // Technology Stack
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech stack') || lowerMessage.includes('framework')) {
      return {
        success: true,
        message: "**Our Technology Stack:** • **Frontend**: React, Vue.js, Angular • **Backend**: Node.js, Python, PHP • **Database**: PostgreSQL, MongoDB, MySQL • **Cloud**: AWS, Google Cloud, Azure • **Mobile**: React Native, Flutter • **AI/ML**: TensorFlow, PyTorch, OpenAI, Google AI • **Blockchain**: Ethereum, Solana, Polygon"
      }
    }
    
    // Process
    if (lowerMessage.includes('process') || lowerMessage.includes('how do you work') || lowerMessage.includes('methodology')) {
      return {
        success: true,
        message: "**Our Development Process:** 1. **Discovery & Planning** - Understanding your business needs 2. **Design & Prototyping** - Creating user-centric designs 3. **Development & Testing** - Building with quality assurance 4. **Deployment & Launch** - Smooth go-live process 5. **Maintenance & Support** - Ongoing optimization and support We ensure transparent communication throughout the project."
      }
    }
    
    // Default responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        success: true,
        message: "Hello! I'm your AI assistant for Code Brew Labs. We're an AI-Driven Digital Transformation Company that empowers businesses to Innovate, Optimize, and Scale. How can I assist you with our services today?"
      }
    }
    
    if (lowerMessage.includes('thank')) {
      return {
        success: true,
        message: "You're welcome! Is there anything else I can help you with regarding Code Brew Labs services, portfolio, or company information?"
      }
    }
    
    // Fallback response
    return {
      success: true,
      message: `I understand you're asking about '${userMessage}'. As your Code Brew Labs AI assistant, I can help you with information about our services, portfolio, team, contact details, and more. For specific inquiries, you can contact us at business@code-brew.com or visit our website at https://www.code-brew.com.`
    }
  }

  // Method to check if API is configured
  isAPIConfigured(): boolean {
    return this.isConfigured()
  }

  // Method to get configuration status
  getConfigurationStatus(): { configured: boolean; model: string; maxTokens: number; temperature: number } {
    return {
      configured: this.isConfigured(),
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature
    }
  }
}

export const aiService = new AIService()
export default aiService
