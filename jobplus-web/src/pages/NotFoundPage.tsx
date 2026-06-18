import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
export default function NotFoundPage() {
  return (
    <div
      className="page-bg min-h-screen flex flex-col items-center justify-center px-4 text-center"
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="text-9xl font-extrabold text-indigo-600 dark:text-indigo-400"
      >
        404
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page not found</h2>
        <p className="mt-2 max-w-md text-center text-slate-500 dark:text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-8 flex gap-3"
      >
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
        <Link
          to="/jobs"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          <Search className="h-4 w-4" />
          Browse jobs
        </Link>
      </motion.div>
    </div>
  )
}
