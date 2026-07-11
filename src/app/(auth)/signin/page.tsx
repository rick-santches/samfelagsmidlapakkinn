import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { auth, signIn } from '@/auth'
import { ZomblyMark } from '@/components/zombly-mark'
import { ownerLoginEnabled } from '@/lib/owner-login'

async function signInWithEmail(formData: FormData): Promise<void> {
  'use server'
  const email = formData.get('email')
  if (typeof email !== 'string' || !email.includes('@')) return
  await signIn('resend', { email, redirectTo: '/dashboard' })
}

async function signInWithGoogle(): Promise<void> {
  'use server'
  await signIn('google', { redirectTo: '/dashboard' })
}

async function signInWithPassword(formData: FormData): Promise<void> {
  'use server'
  const email = formData.get('email')
  const password = formData.get('password')
  try {
    await signIn('owner', { email, password, redirectTo: '/dashboard' })
  } catch (error) {
    // Auth.js throws a redirect on success; only surface real auth failures.
    if (error instanceof AuthError) redirect('/signin?error=owner')
    throw error
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID)
  const ownerEnabled = ownerLoginEnabled()
  // Magic link works with Resend, or in dev (console fallback). In prod
  // without Resend it fails closed, so don't offer a dead form.
  const magicLinkEnabled =
    Boolean(process.env.RESEND_API_KEY) || process.env.NODE_ENV !== 'production'

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-3 flex items-center justify-center gap-2.5">
          <ZomblyMark size={26} />
          <p className="text-sm font-medium uppercase tracking-widest text-savings">
            Zombly
          </p>
        </div>
        <h1 className="text-center text-2xl font-bold">
          Sign in to hunt zombies
        </h1>
        <p className="mt-2 text-center text-sm text-ink-300">
          {magicLinkEnabled
            ? 'No password. We’ll email you a magic link.'
            : 'Sign in with your owner credentials.'}
        </p>

        {searchParams.error && (
          <p className="mt-4 rounded-lg border border-flame/40 bg-flame/10 px-4 py-2 text-center text-sm text-flame">
            That didn&apos;t match. Check your email and password.
          </p>
        )}

        {magicLinkEnabled && (
          <form action={signInWithEmail} className="mt-8 space-y-3">
            <input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:border-savings focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-savings px-4 py-3 font-semibold text-ink-950 transition hover:bg-savings-glow"
            >
              Email me a magic link
            </button>
          </form>
        )}

        {googleEnabled && (
          <>
            {magicLinkEnabled && <Divider />}
            <form action={signInWithGoogle} className={magicLinkEnabled ? '' : 'mt-8'}>
              <button
                type="submit"
                className="w-full rounded-lg border border-ink-700 px-4 py-3 font-semibold text-ink-200 transition hover:border-ink-500"
              >
                Continue with Google
              </button>
            </form>
          </>
        )}

        {ownerEnabled && (
          <>
            {(magicLinkEnabled || googleEnabled) && <Divider />}
            <form
              action={signInWithPassword}
              className={magicLinkEnabled || googleEnabled ? 'space-y-3' : 'mt-8 space-y-3'}
            >
              <input
                type="email"
                name="email"
                required
                placeholder="owner@company.com"
                className="w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:border-savings focus:outline-none"
              />
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                className="w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-ink-100 placeholder:text-ink-500 focus:border-savings focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg border border-ink-700 px-4 py-3 font-semibold text-ink-200 transition hover:border-ink-500"
              >
                Sign in with password
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-ink-500">
      <div className="h-px flex-1 bg-ink-700" />
      or
      <div className="h-px flex-1 bg-ink-700" />
    </div>
  )
}
