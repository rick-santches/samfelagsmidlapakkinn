import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// UX-level gate only: real enforcement lives in requireOrg()/requireUser()
// on every page and API route.
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/dashboard/:path*', '/welcome'],
}
