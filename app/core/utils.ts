import { Ctx } from "blitz"
import { Prisma, GlobalRole } from "db"

export default function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export const setDefaultOrganizationId = <T extends Record<any, any>>(
  input: T,
  { session }: Ctx
): T & { organizationId: Prisma.IntNullableFilter | number } => {
  assert(session.organizationId, "Missing session.orgId in setDefaultOrganizationId")
  if (input.organizationId) {
    // Pass through the input
    return input as T & { organizationId: number }
  } else if (session.roles?.includes(GloblRole.SUPERADMIN)) {
    // Allow viewing any organization
    return { ...input, organizationId: { not: 0 } }
  } else {
    // Set organizationId to session.orgId
    return { ...input, organizationId: session.organizationId }
  }
}

export const enforceSuperAdminIfNotCurrentOrganization = <T extends Record<any, any>>(
  input: T,
  ctx: Ctx
): T => {
  assert(ctx.session.organizationId, "missing session.orgId")
  assert(input.organizationId, "missing input.organizationId")

  if (input.organizationId !== ctx.session.organizationId) {
    ctx.session.$authorize(GlobalRole.SUPERADMIN)
  }
  return input
}
