import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Loader2, Monitor, Eye, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WebsitePreviewProps {
  url: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  url,
  title,
  isOpen,
  onClose
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isOpen && url) {
      setLoading(true)
      setError(false)
      
      // Generate preview URL using a screenshot service
      // You can replace this with your preferred screenshot API
      // Option 1: Microlink (free, no API key required)
      const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
      
      // Option 2: If you have a Screenshotapi.net token, use this instead:
      // const screenshotUrl = `https://api.screenshotapi.net/screenshot?url=${encodeURIComponent(url)}&width=800&height=600&format=jpeg&quality=80&token=YOUR_TOKEN`
      
      // Option 3: If you have Cloudinary, use this instead:
      // const screenshotUrl = `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/fetch/w_800,h_600,f_auto/${encodeURIComponent(url)}`
      
      setPreviewUrl(screenshotUrl)
      
      // Simulate loading time
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, url])

  const handleImageError = () => {
    setError(true)
    setLoading(false)
  }

  const handleImageLoad = () => {
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Website
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="relative">
            {loading && (
              <div className="flex items-center justify-center h-96 bg-gray-100">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-600">Loading preview...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-96 bg-gray-100">
                <div className="text-center">
                  <Monitor className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Preview not available</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Website
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt={`Preview of ${title}`}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Embedded Website Preview Component for Cards
interface EmbeddedPreviewProps {
  url: string
  title: string
  className?: string
}

export const EmbeddedPreview: React.FC<EmbeddedPreviewProps> = ({
  url,
  title,
  className = ""
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    if (url && showPreview) {
      setLoading(true)
      setError(false)
      
      // Generate preview URL using a screenshot service
      const screenshotUrl = `https://api.screenshotapi.net/screenshot?url=${encodeURIComponent(url)}&width=400&height=250&format=jpeg&quality=70`
      
      setPreviewUrl(screenshotUrl)
    }
  }, [url, showPreview])

  const handleImageError = () => {
    setError(true)
    setLoading(false)
  }

  const handleImageLoad = () => {
    setLoading(false)
  }

  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  if (!showPreview) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 flex items-center justify-center ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={togglePreview}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Show Preview
        </Button>
      </div>
    )
  }

  return (
    <div className={`relative bg-white rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePreview}
            className="h-6 w-6 p-0"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="h-6 w-6 p-0"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative">
        {loading && (
          <div className="flex items-center justify-center h-48 bg-gray-100">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-600">Loading preview...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-48 bg-gray-100">
            <div className="text-center">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-600">Preview not available</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Website
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && previewUrl && (
          <div className="relative group">
            <img
              src={previewUrl}
              alt={`Preview of ${title}`}
              className="w-full h-48 object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Website
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hover Preview Component
interface HoverPreviewProps {
  url: string
  title: string
  children: React.ReactNode
}

export const HoverPreview: React.FC<HoverPreviewProps> = ({
  url,
  title,
  children
}) => {
  const [showPreview, setShowPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleMouseEnter = () => {
    if (!previewUrl) {
      setLoading(true)
      // Generate preview URL
      // Option 1: Microlink (free, no API key required)
      const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
      
      // Option 2: If you have a Screenshotapi.net token, use this instead:
      // const screenshotUrl = `https://api.screenshotapi.net/screenshot?url=${encodeURIComponent(url)}&width=400&height=300&format=jpeg&quality=70&token=YOUR_TOKEN`
      
      // Option 3: If you have Cloudinary, use this instead:
      // const screenshotUrl = `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/fetch/w_400,h_300,f_auto/${encodeURIComponent(url)}`
      setPreviewUrl(screenshotUrl)
    }
    setShowPreview(true)
  }

  const handleMouseLeave = () => {
    setShowPreview(false)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Hover Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200">
              <h4 className="font-medium text-sm text-gray-900">{title}</h4>
              <p className="text-xs text-gray-500 truncate">{url}</p>
            </div>
            
            <div className="relative">
              {loading && (
                <div className="flex items-center justify-center h-32 bg-gray-100">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                </div>
              )}
              
              {previewUrl && !loading && (
                <img
                  src={previewUrl}
                  alt={`Preview of ${title}`}
                  className="w-full h-32 object-cover"
                  onLoad={() => setLoading(false)}
                />
              )}
            </div>
            
            <div className="p-3 bg-gray-50">
              <Button
                size="sm"
                className="w-full"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Open Website
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
