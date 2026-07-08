import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { authConfig } from './auth.config'
import { prisma } from './lib/db'

const providers: Provider[] = [
  Resend({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM ?? 'Zombly <auth@zombly.com>',
    // No Resend key (local dev): print the magic link to the server
    // console instead of sending an email.
    ...(process.env.RESEND_API_KEY
      ? {}
      : {
          async sendVerificationRequest({ identifier, url }) {
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
})
