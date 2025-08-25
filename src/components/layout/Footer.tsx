import React from "react"
import { motion } from "framer-motion"
import { 
  Brain, 
  Phone, 
  MessageCircle, 
  Mail,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export const Footer: React.FC = () => {
  const { toast } = useToast()

  const handleContactClick = (type: string) => {
    switch (type) {
      case 'brain':
        toast({
          title: "AI Assistant",
          description: "Our AI assistant is here to help you!",
        })
        break
      case 'phone':
        toast({
          title: "Call Us",
          description: "Calling +971 50 123 4567...",
        })
        break
      case 'whatsapp':
        toast({
          title: "WhatsApp",
          description: "Opening WhatsApp chat...",
        })
        break
      case 'chat':
        toast({
          title: "Live Chat",
          description: "Connecting you to our support team...",
        })
        break
      case 'email':
        toast({
          title: "Email Support",
          description: "Opening email client...",
        })
        break
    }
  }

  const handleLinkClick = (link: string) => {
    toast({
      title: "Navigation",
      description: `Navigating to ${link}...`,
    })
  }

  return (
    <footer className="bg-white border-t border-gray-200 relative">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Company */}
          <div>
            <h3 className="font-bold text-black text-base mb-3">Company</h3>
            <ul className="space-y-1.5">
              <li><a href="#" onClick={() => handleLinkClick('Partnership')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Partnership</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Testimonials')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Our Testimonials</a></li>
              <li><a href="#" onClick={() => handleLinkClick('About')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">About us</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Why Choose')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Why Choose us</a></li>
              <li><a href="#" onClick={() => handleLinkClick('How We Work')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">How We Work</a></li>
              <li className="flex items-center gap-2">
                <a href="#" onClick={() => handleLinkClick('Career')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Career</a>
                <Button size="sm" className="bg-green-100 text-black text-xs px-2 py-1 h-5 hover:bg-green-200">
                  Click here
                </Button>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="font-bold text-black text-base mb-3">Industries</h3>
            <ul className="space-y-1.5">
              <li><a href="#" onClick={() => handleLinkClick('Food Delivery')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Food Delivery</a></li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <a href="#" onClick={() => handleLinkClick('Healthcare')} className="text-green-600 hover:text-green-700 transition-colors text-sm">Healthcare</a>
              </li>
              <li><a href="#" onClick={() => handleLinkClick('Pickup & Delivery')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Pickup & Delivery</a></li>
              <li><a href="#" onClick={() => handleLinkClick('E-Commerce')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">E- Commerce Delivery</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Taxi')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Taxi and Transportation</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Home Services')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Home Services</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Fitness')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Fitness</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Education')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Education</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Real Estate')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Real Estate</a></li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-black text-base mb-3">Product</h3>
            <ul className="space-y-1.5">
              <li><a href="#" onClick={() => handleLinkClick('CB Blockchain')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">CB Blockchain</a></li>
              <li><a href="#" onClick={() => handleLinkClick('CB AI Tech')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">CB AI Tech</a></li>
              <li><a href="#" onClick={() => handleLinkClick('CB Studio')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">CB Studio</a></li>
              <li><a href="#" onClick={() => handleLinkClick('CB Startup')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">CB Startup</a></li>
              <li><a href="#" onClick={() => handleLinkClick('CB Apps')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">CB Apps</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-black text-base mb-3">Services</h3>
            <ul className="space-y-1.5">
              <li><a href="#" onClick={() => handleLinkClick('Premium Solutions')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Premium Custom Solutions</a></li>
              <li><a href="#" onClick={() => handleLinkClick('AI Development')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">AI Development</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Blockchain')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Blockchain Development</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Mobile App')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Mobile App Dubai</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Fintech')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Fintech Development</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Enterprise')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Enterprise Software</a></li>
              <li><a href="#" onClick={() => handleLinkClick('UI/UX')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">UI/UX Design</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Web Development')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Web Development</a></li>
              <li><a href="#" onClick={() => handleLinkClick('Growth')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Growth & Marketing</a></li>
            </ul>
          </div>

          {/* Business Models */}
          <div>
            <h3 className="font-bold text-black text-base mb-3">Business Models</h3>
            <div className="grid grid-cols-2 gap-3">
              <ul className="space-y-1.5">
                <li><a href="#" onClick={() => handleLinkClick('Talabat')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Talabat</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Postmates')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Postmates</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Dubizzle')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Dubizzle</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Zomato')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Zomato</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Ebay')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Ebay</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Deliveroo')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Deliveroo</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Instacart')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Instacart</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Tinder')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Tinder</a></li>
              </ul>
              <ul className="space-y-1.5">
                <li><a href="#" onClick={() => handleLinkClick('Careem')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Careem</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Doordash')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Doordash</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Gojek')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Gojek</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Tiktok Clone')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Tiktok Clone</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Ubereats')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Ubereats</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Practo')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Practo</a></li>
                <li><a href="#" onClick={() => handleLinkClick('Amazon')} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Amazon</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>


    </footer>
  )
}
