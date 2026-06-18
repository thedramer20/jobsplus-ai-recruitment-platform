import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ar from './locales/ar.json'
import zh from './locales/zh.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import de from './locales/de.json'
import pt from './locales/pt.json'
import ja from './locales/ja.json'

function getInitialLang(): string {
  try {
    const raw = localStorage.getItem('jobplus_lang')
    return raw ? (JSON.parse(raw) as { code: string }).code : 'en-US'
  } catch {
    return 'en-US'
  }
}

i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: en },
    ar:      { translation: ar },
    zh:      { translation: zh },
    fr:      { translation: fr },
    es:      { translation: es },
    de:      { translation: de },
    pt:      { translation: pt },
    ja:      { translation: ja },
  },
  lng: getInitialLang(),
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false },
})

export default i18n
