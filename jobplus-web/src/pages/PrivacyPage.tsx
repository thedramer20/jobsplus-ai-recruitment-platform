import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/ui/blur-fade'

export default function PrivacyPage() {
  return (
    <div className="page-bg min-h-screen pb-16">
      {/* Hero banner */}
      <div className="flex h-40 items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-500">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
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

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Information We Collect</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We collect the information you provide when creating an account, including your name,
              email address, and professional profile details such as work experience, education,
              and skills.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">How We Use Your Information</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your information is used to match you with relevant job opportunities, display your
              profile to potential employers, and improve the platform experience.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Data Sharing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We do not sell your personal data. Your profile information is visible to employers
              only when you apply for their positions or set your profile to "Open to Work."
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Data Security</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We use industry-standard encryption and security practices to protect your information.
              Passwords are hashed using BCrypt and never stored in plain text.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Your Rights</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You may update, export, or delete your account data at any time through your profile
              settings.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Contact</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Questions about this policy? Reach us through the Contact page or at{' '}
              <a href="mailto:privacy@jobplus.com" className="text-indigo-600 hover:underline">
                privacy@jobplus.com
              </a>
              .
            </p>
          </div>
        </BlurFade>
      </div>
    </div>
  )
}
