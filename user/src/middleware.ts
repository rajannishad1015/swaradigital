import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Note: Next.js 16 shows a deprecation warning for middleware.ts convention.
// The recommended pattern is to use proxy.ts instead. However, this requires
// significant refactoring and the current middleware works correctly.
// This should be migrated to the proxy pattern in a future update.
// See: https://nextjs.org/docs/messages/middleware-to-proxy
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
