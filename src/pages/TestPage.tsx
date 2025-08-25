import React from "react"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Application is Working!</h1>
        <p className="text-gray-600 mb-4">
          If you can see this page, the React application is running correctly.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• React is loaded</p>
          <p>• Tailwind CSS is working</p>
          <p>• Routing should be functional</p>
        </div>
        <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
          <p className="text-green-700 font-medium">Next Steps:</p>
          <p className="text-green-600 text-sm mt-1">
            Go to <code className="bg-green-100 px-1 rounded">http://localhost:8082/</code> to access the main application.
          </p>
        </div>
      </div>
    </div>
  )
}
