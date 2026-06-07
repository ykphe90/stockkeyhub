// i18n/settings.ts
export const fallbackLng = 'en'
export const languages = ['en', 'zh', 'ms']
export const defaultNS = 'translation'

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    ns,
    defaultNS,
  }
}