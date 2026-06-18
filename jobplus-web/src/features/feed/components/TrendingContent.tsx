import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Heart, MessageCircle, ArrowLeft, Send } from 'lucide-react'
import { BlurFade } from '@/components/ui/blur-fade'
import { Avatar } from '@/components/ui/Avatar'

const editorPicks = [
  { target: 'Career',               icon: '🚀', title: 'Career Advancement Tips' },
  { target: 'Leadership',           icon: '🧠', title: 'Team Performance and Morale' },
  { target: 'Artificial Intelligence', icon: '💡', title: 'AI Trends and Innovations' },
  { target: 'Leadership',           icon: '📚', title: 'Mindset Development Tips' },
  { target: 'Leadership',           icon: '🎯', title: 'Balancing Leadership' },
  { target: 'Career',               icon: '🤝', title: 'Networking for Professionals' },
  { target: 'Business Strategy',    icon: '⚡', title: 'Workday Management Tips' },
  { target: 'Leadership',           icon: '💬', title: 'Promoting Open Communication' },
]

interface DemoPost {
  author: string
  role: string
  content: string
  likes: number
  comments: number
  image?: string
}

interface Category {
  icon: string
  name: string
  posts: [DemoPost, DemoPost]
}

const categories: Category[] = [
  {
    icon: '📊', name: 'Business Strategy',
    posts: [
      { author: 'Sarah Chen',   role: 'CEO · TechVentures',     content: '5 strategies that helped us scale from 10 to 100 employees in 18 months — without losing culture.',            likes: 42, comments: 8, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&h=200&fit=crop'  },
      { author: 'James Liu',    role: 'Strategy Consultant',     content: 'The most overlooked competitive advantage in 2025 is not AI — it is operational simplicity.',                   likes: 31, comments: 5  },
    ],
  },
  {
    icon: '📢', name: 'Marketing',
    posts: [
      { author: 'Priya Nair',   role: 'Head of Growth · Finova', content: 'We dropped paid ads for 90 days and went all-in on content. Here is what happened to our CAC.',              likes: 78, comments: 14, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=200&fit=crop' },
      { author: 'Ethan Brooks', role: 'Brand Strategist',         content: 'Stop optimising for impressions. Start optimising for trust. A thread on brand positioning that actually works.', likes: 55, comments: 9, image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=480&h=200&fit=crop'  },
    ],
  },
  {
    icon: '💼', name: 'Career',
    posts: [
      { author: 'Alice Tan',    role: 'Senior Engineer · ByteForge', content: 'I negotiated a 40% salary increase without a competing offer. Here is the exact script I used.',          likes: 134, comments: 22, image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=480&h=200&fit=crop' },
      { author: 'David Park',   role: 'Career Coach',                content: 'Your LinkedIn headline is your first impression. Most people waste it with their job title.',               likes: 89,  comments: 17 },
    ],
  },
  {
    icon: '💻', name: 'Technology',
    posts: [
      { author: 'Lena Müller',  role: 'CTO · MediaWave',     content: 'We migrated 3M records to a new schema with zero downtime. The approach is simpler than you think.',               likes: 67, comments: 11, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=200&fit=crop' },
      { author: 'Raj Patel',    role: 'Staff Engineer',       content: 'Every senior engineer I know wishes they had learned system design earlier. Where to start in 2025.',               likes: 93, comments: 18 },
    ],
  },
  {
    icon: '👔', name: 'Leadership',
    posts: [
      { author: 'Marcus Osei',  role: 'VP Engineering · GreenLogix', content: 'The best 1-on-1 I ever had lasted 5 minutes. The worst lasted an hour. What makes the difference.',       likes: 58, comments: 12, image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=480&h=200&fit=crop' },
      { author: 'Sophie Zhang', role: 'People Lead',                  content: 'Psychological safety is not about being nice. It is about making disagreement normal and safe.',           likes: 47, comments: 9  },
    ],
  },
  {
    icon: '💡', name: 'Innovation',
    posts: [
      { author: 'Omar Hassan',  role: 'Product Director · EduNest', content: 'We ran 40 user interviews and only 3 features survived. How to separate signal from noise.',                 likes: 36, comments: 7 },
      { author: 'Chloe Kim',    role: 'Innovation Lead',             content: 'First-principles thinking sounds great in theory. Here is how we cut our build time in half with it.',       likes: 44, comments: 8, image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=480&h=200&fit=crop' },
    ],
  },
  {
    icon: '💰', name: 'Finance',
    posts: [
      { author: 'Tom Walker',   role: 'CFO · RetailPlus',   content: 'Unit economics before growth. The simple rule that saved us from a painful Series B conversation.',                   likes: 52, comments: 10, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=480&h=200&fit=crop' },
      { author: 'Nina Adeyemi', role: 'Financial Analyst',   content: 'Three cash flow mistakes that kill otherwise healthy businesses — and how to spot them early.',                      likes: 39, comments: 6  },
    ],
  },
  {
    icon: '📈', name: 'Sales',
    posts: [
      { author: 'Chris Morgan', role: 'Head of Sales · HealthBridge', content: 'Cold outreach response rate went from 2% to 18% after one change. Stop selling, start asking.',           likes: 61, comments: 13, image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=480&h=200&fit=crop' },
      { author: 'Yuki Tanaka',  role: 'Account Executive',             content: 'The discovery call is where most deals are lost — not in the demo. What I ask in the first 10 minutes.', likes: 48, comments: 9  },
    ],
  },
  {
    icon: '🤖', name: 'Artificial Intelligence',
    posts: [
      { author: 'Fatima Al-Rashid', role: 'AI Research Lead',  content: 'We tested 6 LLM workflows in production. Only 2 held up at scale. Here is what broke the others.',               likes: 84, comments: 19, image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=480&h=200&fit=crop' },
      { author: 'Ben Harlow',       role: 'ML Engineer',        content: 'Prompt engineering is a skill, not a trick. The mental model I use to get consistent results from any LLM.',    likes: 76, comments: 15 },
    ],
  },
  {
    icon: '🌍', name: 'Remote Work',
    posts: [
      { author: 'Ana Lima',    role: 'Remote Work Advocate', content: 'Our team spans 8 time zones. Here is the async-first system that actually keeps us aligned without burnout.',        likes: 53, comments: 11, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=480&h=200&fit=crop' },
      { author: 'Jake Foster', role: 'Engineering Manager',   content: 'The loneliness of remote work is real. What we built to keep the team connected without forced fun.',               likes: 41, comments: 8  },
    ],
  },
]

function InteractivePost({ post }: { post: DemoPost }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [localComments, setLocalComments] = useState<string[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function handleLike() {
    setLiked((l) => {
      setLikeCount((c) => (l ? c - 1 : c + 1))
      return !l
    })
  }

  function toggleComments() {
    setShowComments((v) => !v)
    if (!showComments) setTimeout(() => inputRef.current?.focus(), 150)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return
    setLocalComments((p) => [...p, newComment.trim()])
    setNewComment('')
  }

  return (
    <div className="p-4 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-white/5">
      {post.image && (
        <img src={post.image} alt="" className="mb-3 h-48 w-full rounded-lg object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
      )}
      <div className="flex items-start gap-3">
        <Avatar src={null} name={post.author} size="sm" className="mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">{post.author}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{post.role}</span>
          </div>
          <p className="mt-1 text-sm leading-snug text-slate-700 dark:text-slate-300">{post.content}</p>
          <div className="mt-2 flex items-center gap-4">
            <motion.button
              onClick={handleLike}
              whileTap={{ scale: 0.85 }}
              className="flex items-center gap-1 text-[11px]"
            >
              <motion.div
                animate={liked ? { scale: [1, 1.4, 0.9, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <Heart
                  className={`h-3.5 w-3.5 transition-colors ${
                    liked ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-400 dark:text-slate-500'
                  }`}
                />
              </motion.div>
              <span className={liked ? 'font-medium text-red-500' : 'text-slate-400 dark:text-slate-500'}>{likeCount}</span>
            </motion.button>

            <button
              type="button"
              onClick={toggleComments}
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                showComments ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400'
              }`}
            >
              <MessageCircle className={`h-3.5 w-3.5 ${showComments ? 'text-indigo-500 dark:text-indigo-400' : ''}`} />
              <span>{post.comments + localComments.length}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-slate-100 pl-9 pt-3 dark:border-white/10">
              {localComments.length === 0 ? (
                <p className="py-1 text-center text-xs text-slate-400 dark:text-slate-500">No comments yet. Be the first!</p>
              ) : (
                localComments.map((c, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-700/50">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">You</p>
                    <p className="mt-0.5 text-sm leading-snug text-slate-700 dark:text-slate-300">{c}</p>
                  </div>
                ))
              )}
              <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-1">
                <textarea
                  ref={inputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
                  }}
                  placeholder="Write a comment…"
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="flex-shrink-0 rounded-xl bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CategoryPosts({ cat, onBack }: { cat: Category; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22 }}
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <ArrowLeft className="h-4 w-4" /> All Categories
      </button>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">{cat.icon}</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{cat.name}</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800">
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {cat.posts.map((post, pi) => (
            <InteractivePost key={pi} post={post} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function TrendingContent() {
  const [selected, setSelected] = useState<Category | null>(null)

  return (
    <div>
      {/* ── Editor's Picks ── */}
      <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">Editor's Picks</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Handpicked ideas and insights from professionals</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {editorPicks.map((pick, i) => {
          const cat = categories.find((c) => c.name === pick.target)
          return (
            <BlurFade key={i} delay={0.1 + i * 0.06} inView>
              <motion.button
                onClick={() => cat && setSelected(cat)}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97 }}
                className="h-full w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:bg-slate-800 dark:hover:border-indigo-700/50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                    {pick.target}
                  </span>
                  <span className="text-lg">{pick.icon}</span>
                </div>
                <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">{pick.title}</p>
              </motion.button>
            </BlurFade>
          )
        })}
      </div>

      {/* ── Separator ── */}
      <div className="my-8 flex items-center justify-center">
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        <BookOpen className="mx-3 h-5 w-5 text-indigo-400 dark:text-indigo-500" />
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      {/* ── Topic Categories ── */}
      <AnimatePresence mode="wait">
        {selected ? (
          <CategoryPosts key={selected.name} cat={selected} onBack={() => setSelected(null)} />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">Topic Categories</h2>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">Tap a topic to explore posts</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((cat, ci) => (
                <BlurFade key={cat.name} delay={0.5 + ci * 0.04} inView>
                  <motion.button
                    onClick={() => setSelected(cat)}
                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.96 }}
                    className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:bg-slate-800 dark:hover:border-indigo-700/50"
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-center text-xs font-semibold leading-tight text-slate-700 dark:text-slate-300">{cat.name}</span>
                  </motion.button>
                </BlurFade>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
