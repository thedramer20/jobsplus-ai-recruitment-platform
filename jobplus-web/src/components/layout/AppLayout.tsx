import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatbotWidget } from '@/features/chatbot/ChatbotWidget'

export function AppLayout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-surface-dark">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  )
}
