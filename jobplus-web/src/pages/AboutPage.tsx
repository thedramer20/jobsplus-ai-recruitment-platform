import { Link } from 'react-router-dom'
import { Briefcase, Building2, Users, ArrowLeft } from 'lucide-react'
import { BlurFade } from '@/components/ui/blur-fade'

export default function AboutPage() {
  return (
    <div className="page-bg min-h-screen">
      {/* Back link */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </div>

      {/* Hero banner */}
      <div className="relative flex h-48 items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-500">
        <BlurFade delay={0} duration={0.5} className="text-center">
          <h1 className="text-3xl font-bold text-white">About JobPlus</h1>
          <p className="mt-2 text-indigo-100">
            The modern platform connecting talent with opportunity
          </p>
        </BlurFade>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Card 1 — Mission */}
        <BlurFade delay={0.2} inView>
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Our Mission</h2>
            <p className="leading-relaxed text-slate-600">
              JobPlus was built to simplify hiring. We connect job seekers with employers through a
              clean, modern platform that puts people first. No noise, no clutter — just meaningful
              career opportunities.
            </p>
          </div>
        </BlurFade>

        {/* Card 2 — What We Offer */}
        <BlurFade delay={0.4} inView>
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-900">What We Offer</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-800">Smart Job Matching</h3>
                <p className="text-sm text-slate-500">Find roles that fit your skills and goals</p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-800">Company Profiles</h3>
                <p className="text-sm text-slate-500">Research employers before you apply</p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-800">Professional Network</h3>
                <p className="text-sm text-slate-500">Build connections that advance your career</p>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Card 3 — Team */}
        <BlurFade delay={0.6} inView>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Our Team</h2>
            <p className="leading-relaxed text-slate-600">
              JobPlus is developed by a passionate team of engineers and designers committed to
              making recruitment better for everyone.
            </p>
          </div>
        </BlurFade>
      </div>
    </div>
  )
}
