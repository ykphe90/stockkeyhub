// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { fallbackLng, languages } from '.src/i18n/settings'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Ignore static files or API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    return
  }

  // Check if path already includes a language
  const pathnameIsMissingLang = languages.every(
    (lang) => !pathname.startsWith(`/${lang}`)
  )

  if (pathnameIsMissingLang) {
    const locale = fallbackLng
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}