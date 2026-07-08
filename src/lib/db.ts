import { PrismaClient } from '@prisma/client'

// Singleton PrismaClient — survives Next.js dev-server hot reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Raw, unscoped client. Import ONLY from auth code, org bootstrap, and
 * Stripe/Plaid webhooks (which resolve their own org). Everything that
 * touches org data must go through `orgDb(orgId)` below.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Models that carry an orgId column and must always be scoped by it. */
const ORG_SCOPED_MODELS = [
  'connectedSource',
  'transaction',
  'subscription',
  'auditReport',
] as const

type OrgScopedArgs = { where?: Record<string, unknown> } & Record<string, unknown>

function injectOrgId<A extends OrgScopedArgs>(args: A | undefined, orgId: string): A {
  const base = (args ?? {}) as A
  return { ...base, where: { ...(base.where ?? {}), orgId } }
}

/**
 * Returns a Prisma client whose queries against org-scoped models are
 * forced to include `where: { orgId }` — reads AND writes. This is the
 * only client dashboard pages and API routes should use, so a missing
 * filter can never leak another org's financial data.
 *
 * Note: Subscription-child models (SubscriptionCharge, Flag) have no
 * orgId column; query them through their scoped parent relation.
 */
export function orgDb(orgId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const scoped = ORG_SCOPED_MODELS.some(
            (m) => m.toLowerCase() === model.toLowerCase(),
          )
          if (!scoped) return query(args)

          switch (operation) {
            case 'findFirst':
            case 'findFirstOrThrow':
            case 'findMany':
            case 'findUnique':
            case 'findUniqueOrThrow':
            case 'updateMany':
            case 'deleteMany':
            case 'count':
            case 'aggregate':
            case 'groupBy':
              return query(injectOrgId(args as OrgScopedArgs, orgId))
            case 'create': {
              const a = (args ?? {}) as { data?: Record<string, unknown> }
              return query({ ...a, data: { ...(a.data ?? {}), orgId } } as never)
            }
            case 'createMany': {
              const a = (args ?? {}) as { data?: Record<string, unknown>[] | Record<string, unknown> }
              const data = Array.isArray(a.data)
                ? a.data.map((d) => ({ ...d, orgId }))
                : { ...(a.data ?? {}), orgId }
              return query({ ...a, data } as never)
            }
            // Singular writes take a unique `where` (usually just an id).
            // Scope them too, so a caller passing a foreign id can never
            // mutate/delete another org's row — the whole point of orgDb.
            case 'update':
            case 'delete':
              return query(injectOrgId(args as OrgScopedArgs, orgId))
            case 'upsert': {
              const a = (args ?? {}) as OrgScopedArgs & {
                create?: Record<string, unknown>
                update?: Record<string, unknown>
              }
              return query({
                ...a,
                where: { ...(a.where ?? {}), orgId },
                create: { ...(a.create ?? {}), orgId },
              } as never)
            }
            default:
              return query(args)
          }
        },
      },
    },
  })
}

export type OrgDb = ReturnType<typeof orgDb>
