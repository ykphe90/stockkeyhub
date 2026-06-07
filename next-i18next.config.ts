// next-i18next.config.ts
import path from 'path'
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'zh', 'ms'],
  localeDetection: true,
  localePath: path.resolve('./public/locales'),
}
export default { i18n }