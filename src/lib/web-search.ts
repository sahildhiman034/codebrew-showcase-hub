export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  source: string
  timestamp?: string
  content?: string
  images?: string[]
  links?: string[]
}

export class WebSearchService {
  private searchApis = {
    // Free search APIs
    duckDuckGo: 'https://api.duckduckgo.com/',
    allOrigins: 'https://api.allorigins.win/get?url=',
    corsAnywhere: 'https://cors-anywhere.herokuapp.com/',
    proxyCors: 'https://api.codetabs.com/v1/proxy?quest=',
    
    // Enhanced search APIs (add your keys)
    serpApi: import.meta.env.VITE_SERP_API_KEY ? `https://serpapi.com/search.json?api_key=${import.meta.env.VITE_SERP_API_KEY}&` : null,
    googleSearch: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY ? `https://www.googleapis.com/customsearch/v1?key=${import.meta.env.VITE_GOOGLE_SEARCH_API_KEY}&` : null,
    bingSearch: import.meta.env.VITE_BING_SEARCH_API_KEY ? `https://api.bing.microsoft.com/v7.0/search?subscription-key=${import.meta.env.VITE_BING_SEARCH_API_KEY}&` : null,
  }

  async searchWeb(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    
    try {
      console.log('🔍 Starting comprehensive web search for:', query)
      
      // 1. Search for Code Brew Labs specific information
      if (this.isCodeBrewLabsQuery(query)) {
        console.log('📡 Searching Code Brew Labs specific data...')
        const codeBrewResults = await this.searchCodeBrewLabs(query)
        results.push(...codeBrewResults)
      }

      // 2. Search for general web development information
      if (this.isWebDevelopmentQuery(query)) {
        console.log('💻 Searching web development information...')
        const webDevResults = await this.searchWebDevelopment(query)
        results.push(...webDevResults)
      }

      // 3. Search for current news and updates
      if (this.isNewsQuery(query)) {
        console.log('📰 Searching news and updates...')
        const newsResults = await this.searchNews(query)
        results.push(...newsResults)
      }

      // 4. Enhanced search with multiple engines
      console.log('🌐 Performing enhanced search with multiple engines...')
      const enhancedResults = await this.performEnhancedSearch(query)
      results.push(...enhancedResults)

      // 5. Real-time website scraping for specific URLs
      if (this.containsURLs(query)) {
        console.log('🔗 Scraping specific URLs...')
        const urlResults = await this.scrapeURLsFromQuery(query)
        results.push(...urlResults)
      }

      // Remove duplicates and limit results
      const finalResults = this.removeDuplicates(results).slice(0, 8)
      console.log(`✅ Found ${finalResults.length} unique results`)
      
      return finalResults
    } catch (error) {
      console.error('❌ Web search error:', error)
      return []
    }
  }

  private isCodeBrewLabsQuery(query: string): boolean {
    const keywords = [
      'code brew labs', 'codebrewlabs', 'codebrew', 'code brew', 'code-brew.com',
      'website', 'official', 'contact', 'services', 'portfolio',
      'phone', 'email', 'address', 'location', 'cto', 'team',
      'about us', 'company', 'business', 'pargat dhillon', 'aseem ghavri',
      'office timing', 'office hours', 'working hours'
    ]
    return keywords.some(keyword => query.toLowerCase().includes(keyword))
  }

  private isWebDevelopmentQuery(query: string): boolean {
    const keywords = [
      'web development', 'programming', 'coding', 'software',
      'react', 'vue', 'angular', 'node.js', 'python', 'php',
      'javascript', 'typescript', 'html', 'css', 'database',
      'api', 'framework', 'library', 'technology', 'tech stack',
      'frontend', 'backend', 'fullstack', 'devops', 'cloud'
    ]
    return keywords.some(keyword => query.toLowerCase().includes(keyword))
  }

  private isNewsQuery(query: string): boolean {
    const keywords = [
      'latest', 'recent', 'current', 'today', 'now', 'update',
      'news', 'announcement', 'release', 'version', 'trend',
      '2024', '2025', 'new', 'breaking', 'latest'
    ]
    return keywords.some(keyword => query.toLowerCase().includes(keyword))
  }

  private containsURLs(query: string): boolean {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return urlRegex.test(query)
  }

  private async searchCodeBrewLabs(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    const lowerQuery = query.toLowerCase()
    
    try {
      // Try to fetch the official Code Brew Labs website
      const urls = [
        'https://www.code-brew.com',
        'https://code-brew.com',
        'https://www.code-brew.com/about',
        'https://www.code-brew.com/contact',
        'https://www.code-brew.com/services'
      ]

      for (const url of urls) {
        try {
          const result = await this.scrapeWebsite(url)
          if (result) {
            results.push(result)
          }
        } catch (error) {
          console.log(`Could not fetch ${url}:`, error)
        }
      }

      // Add specific company information based on query
      if (lowerQuery.includes('cto') || lowerQuery.includes('pargat')) {
        results.push({
          title: "Code Brew Labs Leadership - CTO",
          url: "https://www.code-brew.com/",
          snippet: "Pargat Dhillon is the CTO of Code Brew Labs, leading technical strategy and overseeing all technology initiatives.",
          source: "Code Brew Labs Official",
          timestamp: new Date().toISOString(),
          content: "CTO: Pargat Dhillon leads our technical strategy and oversees all technology initiatives."
        })
      }
      
      if (lowerQuery.includes('co') || lowerQuery.includes('aseem')) {
        results.push({
          title: "Code Brew Labs Leadership - CO",
          url: "https://www.code-brew.com/",
          snippet: "Aseem Ghavri is the CO (Chief Officer) of Code Brew Labs, playing a key role in operations and strategic direction.",
          source: "Code Brew Labs Official",
          timestamp: new Date().toISOString(),
          content: "CO: Aseem Ghavri plays a key role in our company's operations and strategic direction."
        })
      }
      
      if (lowerQuery.includes('office') || lowerQuery.includes('timing') || lowerQuery.includes('hours')) {
        results.push({
          title: "Code Brew Labs Office Hours",
          url: "https://www.code-brew.com/",
          snippet: "Office hours: 10:00 AM to 7:30 PM (Monday to Friday). Available for project inquiries and support.",
          source: "Code Brew Labs Official",
          timestamp: new Date().toISOString(),
          content: "Office Hours: 10:00 AM to 7:30 PM (Monday to Friday)"
        })
      }

      // Add comprehensive company information
      results.push({
        title: 'Code Brew Labs - AI-Driven Digital Transformation Company',
        url: 'https://www.code-brew.com',
        snippet: 'We empower businesses to Innovate, Optimize, and Scale. 2,600+ Business Ventures Transformed, 11+ Years of Digital Engineering Excellence.',
        source: 'Code Brew Labs Official',
        timestamp: new Date().toISOString(),
        content: 'Code Brew Labs is an AI-Driven Digital Transformation Company with 2,600+ business ventures transformed and 11+ years of excellence.',
        links: [
          'https://www.code-brew.com/services',
          'https://www.code-brew.com/portfolio', 
          'https://www.code-brew.com/contact'
        ]
      })

      // Add contact information
      results.push({
        title: 'Code Brew Labs Contact Information',
        url: 'https://www.code-brew.com/contact',
        snippet: 'Contact us: business@code-brew.com | Dubai: +971-504668497 | India: +91-771-976-8427 | Office Hours: 10:00 AM to 7:30 PM',
        source: 'Code Brew Labs Official',
        timestamp: new Date().toISOString(),
        content: 'Email: business@code-brew.com | Dubai: +971-504668497 | India: +91-771-976-8427 | Mexico: +1(213)2614953 | USA: +1(213)2614953 | UK: +44 (20) 82644493'
      })

    } catch (error) {
      console.log('Could not fetch Code Brew Labs website:', error)
    }

    return results
  }

  private async searchWebDevelopment(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    
    try {
      // Use multiple search engines for comprehensive results
      const searchEngines = [
        this.searchWithDuckDuckGo,
        this.searchWithSerpAPI,
        this.searchWithGoogle,
        this.searchWithBing
      ]

      for (const searchEngine of searchEngines) {
        try {
          const engineResults = await searchEngine.call(this, query)
          results.push(...engineResults)
        } catch (error) {
          console.log('Search engine failed:', error)
        }
      }

    } catch (error) {
      console.log('Could not perform web development search:', error)
    }

    return results
  }

  private async searchNews(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    
    try {
      // Search for recent news with multiple engines
      const newsQueries = [
        `${query} news recent 2024`,
        `${query} latest updates`,
        `${query} current trends`,
        `${query} breaking news`
      ]

      for (const newsQuery of newsQueries) {
        try {
          const newsResults = await this.searchWithDuckDuckGo(newsQuery)
          results.push(...newsResults)
        } catch (error) {
          console.log('News search failed:', error)
        }
      }

    } catch (error) {
      console.log('Could not perform news search:', error)
    }

    return results
  }

  private async performEnhancedSearch(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    
    try {
      // Use all available search engines
      const searchPromises = [
        this.searchWithDuckDuckGo(query),
        this.searchWithSerpAPI(query),
        this.searchWithGoogle(query),
        this.searchWithBing(query)
      ]

      const searchResults = await Promise.allSettled(searchPromises)
      
      searchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value)
        }
      })

    } catch (error) {
      console.log('Enhanced search failed:', error)
    }

    return results
  }

  private async searchWithDuckDuckGo(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    
    try {
      const searchQuery = encodeURIComponent(query)
      const response = await fetch(`${this.searchApis.duckDuckGo}?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.Abstract) {
          results.push({
            title: data.Heading || 'Search Result',
            url: data.AbstractURL || '#',
            snippet: data.Abstract,
            source: 'DuckDuckGo',
            timestamp: new Date().toISOString()
          })
        }

        // Add related topics
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
            if (topic.Text) {
              results.push({
                title: topic.Text.split(' - ')[0] || 'Related Information',
                url: topic.FirstURL || '#',
                snippet: topic.Text,
                source: 'DuckDuckGo',
                timestamp: new Date().toISOString()
              })
            }
          })
        }
      }
    } catch (error) {
      console.log('DuckDuckGo search failed:', error)
    }

    return results
  }

  private async searchWithSerpAPI(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    
    if (!this.searchApis.serpApi) return results

    try {
      const searchQuery = encodeURIComponent(query)
      const response = await fetch(`${this.searchApis.serpApi}q=${searchQuery}&num=5`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.organic_results) {
          data.organic_results.forEach((result: any) => {
            results.push({
              title: result.title,
              url: result.link,
              snippet: result.snippet,
              source: 'SerpAPI',
              timestamp: new Date().toISOString()
            })
          })
        }
      }
    } catch (error) {
      console.log('SerpAPI search failed:', error)
    }

    return results
  }

  private async searchWithGoogle(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    
    if (!this.searchApis.googleSearch) return results

    try {
      const searchQuery = encodeURIComponent(query)
      const cx = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID
      const response = await fetch(`${this.searchApis.googleSearch}q=${searchQuery}&cx=${cx}&num=5`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.items) {
          data.items.forEach((item: any) => {
            results.push({
              title: item.title,
              url: item.link,
              snippet: item.snippet,
              source: 'Google Search',
              timestamp: new Date().toISOString()
            })
          })
        }
      }
    } catch (error) {
      console.log('Google search failed:', error)
    }

    return results
  }

  private async searchWithBing(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    
    if (!this.searchApis.bingSearch) return results

    try {
      const searchQuery = encodeURIComponent(query)
      const response = await fetch(`${this.searchApis.bingSearch}q=${searchQuery}&count=5`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.webPages && data.webPages.value) {
          data.webPages.value.forEach((page: any) => {
            results.push({
              title: page.name,
              url: page.url,
              snippet: page.snippet,
              source: 'Bing Search',
              timestamp: new Date().toISOString()
            })
          })
        }
      }
    } catch (error) {
      console.log('Bing search failed:', error)
    }

    return results
  }

  private async scrapeURLsFromQuery(query: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = []
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = query.match(urlRegex) || []

    for (const url of urls) {
      try {
        const result = await this.scrapeWebsite(url)
        if (result) {
          results.push(result)
        }
      } catch (error) {
        console.log(`Could not scrape ${url}:`, error)
      }
    }

    return results
  }

  private async scrapeWebsite(url: string): Promise<WebSearchResult | null> {
    try {
      // Try multiple proxy services for CORS-free access
      const proxyServices = [
        this.searchApis.allOrigins,
        this.searchApis.corsAnywhere,
        this.searchApis.proxyCors
      ]

      for (const proxy of proxyServices) {
        try {
          const response = await fetch(`${proxy}${encodeURIComponent(url)}`)
          if (response.ok) {
            const data = await response.json()
            const html = data.contents || data

            // Extract comprehensive information
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
            const title = titleMatch ? titleMatch[1] : new URL(url).hostname
            
            const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)
            const description = descMatch ? descMatch[1] : 'Website information'
            
            // Extract links
            const linkMatches = html.match(/<a[^>]*href="([^"]*)"[^>]*>/gi) || []
            const links = linkMatches
              .map(link => {
                const hrefMatch = link.match(/href="([^"]*)"/i)
                return hrefMatch ? hrefMatch[1] : null
              })
              .filter(link => link && link.startsWith('http'))
              .slice(0, 5)

            // Extract images
            const imgMatches = html.match(/<img[^>]*src="([^"]*)"[^>]*>/gi) || []
            const images = imgMatches
              .map(img => {
                const srcMatch = img.match(/src="([^"]*)"/i)
                return srcMatch ? srcMatch[1] : null
              })
              .filter(img => img && img.startsWith('http'))
              .slice(0, 3)

            return {
              title: title,
              url: url,
              snippet: description,
              source: new URL(url).hostname,
              timestamp: new Date().toISOString(),
              content: html.substring(0, 500) + '...',
              links: links,
              images: images
            }
          }
        } catch (error) {
          console.log(`Proxy ${proxy} failed for ${url}:`, error)
          continue
        }
      }
    } catch (error) {
      console.error('Error scraping website:', error)
    }
    
    return null
  }

  private removeDuplicates(results: WebSearchResult[]): WebSearchResult[] {
    const seen = new Set()
    return results.filter(result => {
      const key = `${result.title}-${result.url}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  // Method to get real-time data from specific websites
  async getRealTimeData(url: string): Promise<WebSearchResult | null> {
    return await this.scrapeWebsite(url)
  }

  // Method to search for specific company information
  async searchCompanyInfo(companyName: string): Promise<WebSearchResult[]> {
    const queries = [
      `${companyName} official website`,
      `${companyName} about us`,
      `${companyName} contact information`,
      `${companyName} services`,
      `${companyName} team`
    ]

    const results: WebSearchResult[] = []
    
    for (const query of queries) {
      const queryResults = await this.searchWeb(query)
      results.push(...queryResults)
    }

    return this.removeDuplicates(results).slice(0, 10)
  }

  // Method to get latest news about a topic
  async getLatestNews(topic: string): Promise<WebSearchResult[]> {
    const newsQueries = [
      `${topic} latest news 2024`,
      `${topic} breaking news`,
      `${topic} recent updates`,
      `${topic} current events`
    ]

    const results: WebSearchResult[] = []
    
    for (const query of newsQueries) {
      const queryResults = await this.searchWeb(query)
      results.push(...queryResults)
    }

    return this.removeDuplicates(results).slice(0, 8)
  }
}

export const webSearchService = new WebSearchService()
export default webSearchService
