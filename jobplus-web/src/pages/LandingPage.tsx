import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Users, Building2, Zap, Bell, MessageSquare, Star, ArrowRight, CheckCircle2, TrendingUp, Shield, Globe } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { AnimatedShinyText } from '@/components/magic/AnimatedShinyText'
import { ShimmerButton } from '@/components/magic/ShimmerButton'
import { BlurFade } from '@/components/magic/BlurFade'
import { NumberTicker } from '@/components/magic/NumberTicker'
import { Marquee } from '@/components/magic/Marquee'

// ── Company chips ─────────────────────────────────────────────────────────────

const COMPANIES = [
  { name: 'Google',    color: '#4285F4' },
  { name: 'Microsoft', color: '#00A4EF' },
  { name: 'Amazon',    color: '#FF9900' },
  { name: 'Apple',     color: '#555555' },
  { name: 'Meta',      color: '#0866FF' },
  { name: 'Netflix',   color: '#E50914' },
  { name: 'Spotify',   color: '#1DB954' },
  { name: 'Stripe',    color: '#635BFF' },
  { name: 'Shopify',   color: '#96BF48' },
  { name: 'Slack',     color: '#4A154B' },
  { name: 'Airbnb',    color: '#FF5A5F' },
  { name: 'Twitter',   color: '#1DA1F2' },
]

function CompanyChip({ name, color }: { name: string; color: string }) {
  return (
    <div className="mx-3 flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-slate-800/80">
      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{name}</span>
    </div>
  )
}

// ── Floating job card (hero decoration) ──────────────────────────────────────

function FloatingJobCard({ title, company, salary, delay }: { title: string; company: string; salary: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="w-64 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/90"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-sm">
          {company[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{company}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          {salary}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Hiring
        </span>
      </div>
    </motion.div>
  )
}

// ── Feature card ─────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  delay: number
}

function FeatureCard({ icon, title, description, gradient, delay }: FeatureCardProps) {
  return (
    <BlurFade delay={delay}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-white/[0.08] dark:bg-slate-800/60"
      >
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${gradient} text-white shadow-sm`}>
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 group-hover:w-full" />
      </motion.div>
    </BlurFade>
  )
}

// ── Testimonial card ──────────────────────────────────────────────────────────

function TestimonialCard({ name, role, company, text, delay }: { name: string; role: string; company: string; text: string; delay: number }) {
  return (
    <BlurFade delay={delay}>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-slate-800/60">
        <div className="mb-4 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">"{text}"</p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
            {name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{role} · {company}</p>
          </div>
        </div>
      </div>
    </BlurFade>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <PageTransition className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#080D1C] dark:text-white">

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl dark:bg-indigo-700/30" />
          <div className="absolute right-1/4 top-1/3 h-80 w-80 translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-3xl dark:bg-violet-700/25" />
          <div className="absolute bottom-1/4 left-1/2 h-72 w-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-600/10 blur-3xl dark:bg-cyan-700/20" />
        </div>

        {/* Floating job cards (decorative) */}
        <div className="pointer-events-none absolute left-8 top-1/2 hidden -translate-y-1/2 xl:block">
          <FloatingJobCard title="Senior Frontend Dev" company="Stripe" salary="$120K–$160K" delay={0.6} />
        </div>
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/4 xl:block">
          <FloatingJobCard title="Product Designer" company="Airbnb" salary="$90K–$130K" delay={0.8} />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <BlurFade delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
              <AnimatedShinyText className="text-indigo-700 dark:text-indigo-300">
                The Future of Hiring is Here
              </AnimatedShinyText>
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl">
              Find Your{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
                Dream Job.
              </span>
              <br />
              <span className="text-slate-400 dark:text-slate-500">Land It Faster.</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.2}>
            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Connect with top companies worldwide. Get AI-powered career advice.
              Apply in one click and track every step of your journey.
            </p>
          </BlurFade>

          <BlurFade delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ShimmerButton
                background="#4338CA"
                className="px-8 py-3.5 text-base font-semibold"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </ShimmerButton>
              <Link
                to="/jobs"
                className="group flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <Briefcase className="h-4 w-4" />
                Browse Jobs
              </Link>
            </div>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
              {['No credit card required', 'Free forever plan', '10,000+ active jobs'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-slate-200/80 bg-white py-16 dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: 50000,   suffix: '+', label: 'Active Jobs',        icon: Briefcase,   color: 'text-indigo-500' },
              { value: 10000,   suffix: '+', label: 'Companies',          icon: Building2,   color: 'text-violet-500' },
              { value: 500000,  suffix: '+', label: 'Job Seekers',        icon: Users,       color: 'text-emerald-500' },
              { value: 1000000, suffix: '+', label: 'Hires Made',         icon: TrendingUp,  color: 'text-amber-500'  },
            ].map(({ value, suffix, label, icon: Icon, color }) => (
              <BlurFade key={label} delay={0.1}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`mb-1 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                    <NumberTicker value={value} suffix={suffix} />
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANIES MARQUEE ── */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <BlurFade>
            <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Trusted by teams at the world's best companies
            </p>
          </BlurFade>
          <div className="space-y-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <Marquee pauseOnHover className="[--duration:30s]">
              {COMPANIES.map((c) => <CompanyChip key={c.name} {...c} />)}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:25s]">
              {[...COMPANIES].reverse().map((c) => <CompanyChip key={c.name + '-r'} {...c} />)}
            </Marquee>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <BlurFade>
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-500">Features</p>
              <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
                Everything you need to get hired
              </h2>
              <p className="mx-auto max-w-xl text-slate-500 dark:text-slate-400">
                Powerful tools designed for modern job seekers and forward-thinking employers.
              </p>
            </div>
          </BlurFade>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Smart Job Matching"
              description="Our algorithm analyzes your skills and experience to surface the jobs most likely to hire you — ranked by fit, not just recency."
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              delay={0.05}
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="AI Career Advisor"
              description="Get personalized career advice, resume tips, and interview prep 24/7 from our AI assistant powered by the latest language models."
              gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
              delay={0.1}
            />
            <FeatureCard
              icon={<Briefcase className="h-6 w-6" />}
              title="1-Click Apply"
              description="Apply to multiple jobs instantly using your saved profile. No re-entering the same information over and over again."
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              delay={0.15}
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Real-Time Notifications"
              description="Get instant alerts when employers view your profile, respond to your application, or message you directly."
              gradient="bg-gradient-to-br from-rose-500 to-pink-600"
              delay={0.2}
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Professional Network"
              description="Connect with peers, mentors, and industry leaders. Referrals fill 60% of roles before they're publicly posted."
              gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
              delay={0.25}
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Verified Employers"
              description="Every company on JobPlus is verified. No scam jobs, no fake listings — just real opportunities at real companies."
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4">
          <BlurFade>
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-500">Testimonials</p>
              <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
                Loved by job seekers worldwide
              </h2>
            </div>
          </BlurFade>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              name="Sarah Johnson"
              role="Frontend Engineer"
              company="Stripe"
              text="I found my dream job in 2 weeks. The AI advisor helped me rewrite my resume and the job matching was incredibly accurate."
              delay={0.05}
            />
            <TestimonialCard
              name="Ahmed Al-Rashid"
              role="Product Manager"
              company="Microsoft"
              text="The networking feature connected me with a senior PM who referred me internally. I wouldn't have found this role any other way."
              delay={0.1}
            />
            <TestimonialCard
              name="Li Wei"
              role="Data Scientist"
              company="Google"
              text="JobPlus showed me jobs I never would have found on traditional boards. The skill-match scores are surprisingly accurate."
              delay={0.15}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4">
          <BlurFade>
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-500">How It Works</p>
              <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
                Get hired in 3 simple steps
              </h2>
            </div>
          </BlurFade>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Build a standout profile in minutes. Add your experience, skills, and let employers find you.', icon: Users, gradient: 'from-indigo-500 to-violet-600' },
              { step: '02', title: 'Discover Opportunities', desc: 'Browse thousands of verified jobs filtered by your skills, location, salary, and preferences.', icon: Globe, gradient: 'from-emerald-500 to-teal-600' },
              { step: '03', title: 'Apply & Get Hired', desc: 'Apply with one click, track your applications, and communicate directly with hiring teams.', icon: Zap, gradient: 'from-amber-500 to-orange-600' },
            ].map(({ step, title, desc, icon: Icon, gradient }, i) => (
              <BlurFade key={step} delay={i * 0.1}>
                <div className="relative text-center">
                  <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">{step}</span>
                  <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
                  {i < 2 && (
                    <ArrowRight className="absolute -right-4 top-8 hidden h-5 w-5 text-slate-300 dark:text-slate-600 sm:block" />
                  )}
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <BlurFade>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 text-center shadow-2xl">
              {/* Decoration */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
              </div>
              <div className="relative z-10">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-200">
                  Start Today
                </p>
                <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
                  Ready to find your next opportunity?
                </h2>
                <p className="mx-auto mb-10 max-w-md text-indigo-200">
                  Join 50,000+ professionals who found their dream job on JobPlus. It's free to get started.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <ShimmerButton
                    background="white"
                    className="px-8 py-3.5"
                    onClick={() => navigate('/signup')}
                  >
                    <span className="font-semibold text-indigo-600">Get Started Free</span>
                  </ShimmerButton>
                  <Link
                    to="/login"
                    className="rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/60 hover:bg-white/10"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

    </PageTransition>
  )
}
