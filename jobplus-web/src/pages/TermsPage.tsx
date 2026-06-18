import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/ui/blur-fade'

export default function TermsPage() {
  return (
    <div className="page-bg min-h-screen pb-16">
      {/* Hero banner */}
      <div className="flex h-40 items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-500">
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      </div>

      {/* Content card */}
      <div className="mx-auto max-w-3xl px-4">
        <BlurFade delay={0.3} inView>
          <div className="-mt-8 relative z-10 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
            >
              ← Back to home
            </Link>

            <p className="text-xs text-gray-400 mb-4">Last updated: May 2026</p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Acceptance of Terms</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              By creating an account on JobPlus, you agree to these terms. If you do not agree,
              please do not use the platform.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">User Accounts</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your login credentials.
              Each account must represent a real individual or registered company.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Acceptable Use</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You agree not to post false information, spam other users, or use the platform for
              any unlawful purpose. Job listings must represent genuine employment opportunities.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Intellectual Property</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Content you post (resumes, job listings, posts) remains yours. By posting, you grant
              JobPlus a license to display it on the platform.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Limitation of Liability</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              JobPlus is provided "as is." We do not guarantee employment outcomes or the accuracy
              of information posted by other users.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Changes to Terms</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We may update these terms at any time. Continued use of the platform after changes
              constitutes acceptance.
            </p>
          </div>
        </BlurFade>
      </div>
    </div>
  )
}
