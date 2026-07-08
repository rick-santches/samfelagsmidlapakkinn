import { requireOrg } from '@/lib/session'

export default async function SettingsPage() {
  const { org, role } = await requireOrg()
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-6 rounded-xl border border-ink-800 bg-ink-900 p-6">
        <p className="text-sm text-ink-400">Organization</p>
        <p className="mt-1 font-semibold">{org.name}</p>
        <p className="mt-4 text-sm text-ink-400">Plan</p>
        <p className="mt-1 font-semibold">{org.plan}</p>
        <p className="mt-4 text-sm text-ink-400">Your role</p>
        <p className="mt-1 font-semibold">{role}</p>
      </div>
      <p className="mt-6 text-sm text-ink-400">
        Team, billing, and alert preferences land in Phases 7–8.
      </p>
    </div>
  )
}
