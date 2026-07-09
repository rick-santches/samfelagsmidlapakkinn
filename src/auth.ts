import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { authConfig } from './auth.config'
import { prisma } from './lib/db'
import { authenticateOwner, ownerLoginEnabled } from './lib/owner-login'

const providers: Provider[] = [
  Resend({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM ?? 'Zombly <auth@zombly.com>',
    // No Resend key: in local dev, print the magic link to the console
    // for convenience. In production a magic link is a session-granting
    // secret — printing it to logs would be an auth-bypass, so fail
    // closed instead (better a broken sign-in than a silent hole).
    ...(process.env.RESEND_API_KEY
      ? {}
      : {
          async sendVerificationRequest({ identifier, url }) {
            if (process.env.NODE_ENV === 'production') {
              throw new Error(
                'Email sign-in is not configured: set RESEND_API_KEY.',
              )
            }
            console.log(`\n[zombly] Magic link for ${identifier}:\n${url}\n`)
          },
        }),
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  )
}

// Built-in owner login (ADMIN_EMAIL + ADMIN_PASSWORD): an email-free way
// into any deploy, so a missing Resend/Google config is never a lockout.
if (ownerLoginEnabled()) {
  providers.push(
    Credentials({
      id: 'owner',
      name: 'Owner login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: (creds) => authenticateOwner(creds?.email, creds?.password),
    }),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
})
