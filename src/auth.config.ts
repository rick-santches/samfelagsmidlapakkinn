import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe Auth.js config — no Prisma adapter, no Node-only providers.
 * The middleware imports this; the full config in src/auth.ts extends it.
 */
export const authConfig = {
  // Deployed behind proxies (Vercel, containers) — the Host header is
  // controlled by the platform, not end users.
  trustHost: true,
  pages: {
    signIn: '/signin',
    verifyRequest: '/check-email',
  },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname
      const isProtected = path.startsWith('/dashboard') || path.startsWith('/welcome')
      if (!isProtected) return true
      return Boolean(auth?.user)
    },
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (typeof token.id === 'string') session.user.id = token.id
      return session
    },
  },
} satisfies NextAuthConfig
