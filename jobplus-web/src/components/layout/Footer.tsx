import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="mt-auto bg-slate-900 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold text-white">JobPlus</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('footer.quickLinks')}
            </p>
            <ul className="space-y-2.5">
              {[
                { to: '/jobs',      key: 'nav.jobs'       },
                { to: '/companies', key: 'nav.companies'  },
                { to: '/about',     key: 'footer.about'   },
              ].map(({ to, key }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('footer.legal')}
            </p>
            <ul className="space-y-2.5">
              {[
                { to: '/privacy', key: 'footer.privacy'  },
                { to: '/terms',   key: 'footer.terms'    },
              ].map(({ to, key }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center">
          <p className="text-sm text-slate-500">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  )
}
