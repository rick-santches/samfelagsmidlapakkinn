import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'

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

export default async function SignInPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID)

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-savings">
          Zombly
        </p>
        <h1 className="text-center text-2xl font-bold">
          Sign in to hunt zombies
        </h1>
        <p className="mt-2 text-center text-sm text-ink-300">
          No password. We&apos;ll email you a magic link.
        </p>

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

        {googleEnabled && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-ink-500">
              <div className="h-px flex-1 bg-ink-700" />
              or
              <div className="h-px flex-1 bg-ink-700" />
            </div>
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="w-full rounded-lg border border-ink-700 px-4 py-3 font-semibold text-ink-200 transition hover:border-ink-500"
              >
                Continue with Google
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
