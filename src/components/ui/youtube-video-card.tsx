import React from "react"
import { Play, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface YouTubeVideoCardProps {
  title: string
  description: string
  youtubeUrl: string
  thumbnailUrl?: string
  className?: string
}

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({
  title,
  description,
  youtubeUrl,
  thumbnailUrl,
  className = ""
}) => {
  const [imageError, setImageError] = React.useState(false)
  
  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Generate thumbnail URL if not provided
  const getThumbnailUrl = (url: string) => {
    if (thumbnailUrl) return thumbnailUrl
    
    const videoId = getVideoId(url)
    if (videoId) {
      // Try different thumbnail qualities
      if (!imageError) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      } else {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      }
    }
    return null
  }

  const videoId = getVideoId(youtubeUrl)
  const thumbnail = getThumbnailUrl(youtubeUrl)

  return (
    <Card className={`overflow-hidden group hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="relative">
        {thumbnail ? (
          <div className="relative h-56 overflow-hidden">
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <Button 
                size="lg"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => window.open(youtubeUrl, '_blank')}
              >
                <Play className="h-6 w-6 mr-2" />
                Watch
              </Button>
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/70 text-white">
                HD
              </Badge>
            </div>
          </div>
        ) : (
          <div className="h-56 bg-muted flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold line-clamp-2">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => window.open(youtubeUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Watch on YouTube
        </Button>
      </CardContent>
    </Card>
  )
}

export default YouTubeVideoCard
