import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Starting Code Brew Labs application...')

try {
  const rootElement = document.getElementById("root")
  console.log('📦 Root element found:', rootElement)
  
  if (!rootElement) {
    throw new Error('Root element not found!')
  }
  
  const root = createRoot(rootElement)
  console.log('✅ React root created successfully')
  
  root.render(<App />)
  console.log('✅ App rendered successfully')
} catch (error) {
  console.error('❌ Error starting app:', error)
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Error Loading App</h1>
      <p>${error}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: blue; color: white; border: none; border-radius: 5px;">
        Reload Page
      </button>
    </div>
  `
}
