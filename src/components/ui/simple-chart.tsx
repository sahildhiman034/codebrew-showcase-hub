import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export const SimpleChart: React.FC = () => {
  // Simple mock data
  const data = [150, 200, 180, 300, 250, 400, 350, 280, 320, 200, 150, 180]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Simple Response Time Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="absolute inset-4">
            {/* Simple SVG Chart */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="100%" y2="0" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Data line */}
              <polyline
                points={data.map((value, index) => {
                  const x = (index / (data.length - 1)) * 100
                  const y = 100 - (value / 500) * 100 // Scale to 0-500ms
                  return `${x}%,${y}%`
                }).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {data.map((value, index) => {
                const x = (index / (data.length - 1)) * 100
                const y = 100 - (value / 500) * 100
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill={value < 200 ? '#10b981' : value < 400 ? '#f59e0b' : '#ef4444'}
                    stroke="white"
                    strokeWidth="2"
                  />
                )
              })}
            </svg>
            
            {/* Labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>500ms</span>
              <span>375ms</span>
              <span>250ms</span>
              <span>125ms</span>
              <span>0ms</span>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
              <span>Start</span>
              <span>Mid</span>
              <span>End</span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-blue-50 rounded">
            <div className="text-sm text-blue-600">Average</div>
            <div className="text-lg font-bold text-blue-800">
              {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}ms
            </div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="text-sm text-green-600">Min</div>
            <div className="text-lg font-bold text-green-800">
              {Math.min(...data)}ms
            </div>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <div className="text-sm text-red-600">Max</div>
            <div className="text-lg font-bold text-red-800">
              {Math.max(...data)}ms
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
