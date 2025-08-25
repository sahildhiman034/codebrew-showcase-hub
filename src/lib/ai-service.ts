interface AIResponse {
  success: boolean
  message: string
  error?: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

class AIService {
  private apiKey: string
  private model: string
  private maxTokens: number
  private temperature: number
  private baseURL: string = 'https://api.openai.com/v1'

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    this.model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo'
    this.maxTokens = parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '500')
    this.temperature = parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7')
  }

  private isConfigured(): boolean {
    console.log('API Key check:', {
      hasKey: !!this.apiKey,
      keyLength: this.apiKey?.length,
      keyStart: this.apiKey?.substring(0, 10),
      isDefault: this.apiKey === 'your_openai_api_key_here'
    })
    return !!this.apiKey && this.apiKey !== 'your_openai_api_key_here'
  }

  private getSystemPrompt(): string {
    return `You are an AI assistant for Code Brew Labs, a professional web development company. 
    
    Company Information:
    - Name: Code Brew Labs
    - Services: Web Development, Mobile Apps, E-commerce, UI/UX Design, Digital Marketing
    - Portfolio: 200+ successful projects across 15+ categories
    - Technologies: React, Vue.js, Angular, Node.js, Python, PHP, AWS, Google Cloud
    
    Your role is to:
    1. Answer questions about Code Brew Labs services and portfolio
    2. Provide helpful information about web development
    3. Guide users to contact the company for specific inquiries
    4. Be professional, friendly, and knowledgeable
    5. Keep responses concise and informative
    
    If you don't know specific details, suggest contacting the team directly.
    Always represent Code Brew Labs professionally.`
  }

  async generateResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<AIResponse> {
    console.log('generateResponse called with:', { userMessage, conversationHistoryLength: conversationHistory.length })
    
    if (!this.isConfigured()) {
      console.log('API not configured, using fallback response')
      // Fallback to local responses when API key is not configured
      return this.getFallbackResponse(userMessage)
    }

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: this.getSystemPrompt() },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('OpenAI API Error:', errorData)
        return {
          success: false,
          message: this.getFallbackResponse(userMessage).message,
          error: `API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        }
      }

      const data = await response.json()
      const aiMessage = data.choices[0]?.message?.content

      if (!aiMessage) {
        return {
          success: false,
          message: this.getFallbackResponse(userMessage).message,
          error: 'No response from AI model'
        }
      }

      return {
        success: true,
        message: aiMessage
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
    
    // Portfolio and Services
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('projects')) {
      return {
        success: true,
        message: "Code Brew Labs has delivered 200+ successful projects across 15+ categories including E-commerce, Healthcare, Finance, Education, and more. Our portfolio showcases cutting-edge web applications, mobile apps, and digital solutions that drive business growth."
      }
    }
    
    if (lowerMessage.includes('services') || lowerMessage.includes('what do you do')) {
      return {
        success: true,
        message: "We offer comprehensive web development services including: • Custom Web Applications • E-commerce Solutions • Mobile App Development • UI/UX Design • Digital Marketing • Cloud Solutions • Maintenance & Support"
      }
    }
    
    // Company Information
    if (lowerMessage.includes('company') || lowerMessage.includes('about') || lowerMessage.includes('who')) {
      return {
        success: true,
        message: "Code Brew Labs is a professional web development company specializing in creating innovative digital solutions. We focus on delivering high-quality, scalable applications that help businesses succeed in the digital world."
      }
    }
    
         // Contact Information
     if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
       return {
         success: true,
         message: "You can reach us at: • Email: info@codebrewlabs.com • Phone: +1 (555) 123-4567 • Website: www.codebrewlabs.com • We're available Monday-Friday, 9 AM - 6 PM EST"
       }
     }
     
     // Website/URL requests
     if (lowerMessage.includes('website') || lowerMessage.includes('url') || lowerMessage.includes('official') || lowerMessage.includes('site')) {
       return {
         success: true,
         message: "Our official website is: https://www.codebrewlabs.com • You can also visit our portfolio at: https://portfolio.codebrewlabs.com • For direct inquiries: https://contact.codebrewlabs.com"
       }
     }
    
    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return {
        success: true,
        message: "Our pricing varies based on project requirements, complexity, and timeline. We offer competitive rates and flexible payment plans. Would you like to schedule a consultation to discuss your specific project needs?"
      }
    }
    
    // Technology Stack
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech stack') || lowerMessage.includes('framework')) {
      return {
        success: true,
        message: "We use modern technologies including: • Frontend: React, Vue.js, Angular • Backend: Node.js, Python, PHP • Database: PostgreSQL, MongoDB, MySQL • Cloud: AWS, Google Cloud, Azure • Mobile: React Native, Flutter"
      }
    }
    
    // Process
    if (lowerMessage.includes('process') || lowerMessage.includes('how do you work') || lowerMessage.includes('methodology')) {
      return {
        success: true,
        message: "Our development process includes: 1. Discovery & Planning 2. Design & Prototyping 3. Development & Testing 4. Deployment & Launch 5. Maintenance & Support We ensure transparent communication throughout the project."
      }
    }
    
    // Default responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        success: true,
        message: "Hello! How can I assist you with Code Brew Labs services today?"
      }
    }
    
    if (lowerMessage.includes('thank')) {
      return {
        success: true,
        message: "You're welcome! Is there anything else I can help you with?"
      }
    }
    
    // Fallback response
    return {
      success: true,
      message: `I understand you're asking about '${userMessage}'. While I'm designed to help with Code Brew Labs related questions, I'd be happy to connect you with our team for more specific inquiries. You can also visit our website or contact us directly for detailed information.`
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
