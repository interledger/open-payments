type LanguageRoutes = Record<keyof typeof languages, Record<string, string>>
type LanguageUi = Record<keyof typeof languages, Record<string, string>>

export const languages = {
  en: 'English',
  es: 'Español'
}

export const defaultLang = 'en'

export const routes: LanguageRoutes = {
  en: {},
  es: {}
}

export const ui: LanguageUi = {
  en: {},
  es: {}
} as const
