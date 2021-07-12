import { Ctx } from "blitz";
import db from "db";

export default async function getCurrentUser(_ = null, { session }: Ctx) {
  if (!session.userId) return null;

  const organization = await db.organization.findFirst({
    where: {
      id: session.organizationId,
    },
    select: { subscriptionStatus: true, price: true },
  });

  const user = await db.user.findFirst({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, memberships: true },
  });

  return {
    ...user,
    price: organization?.price,
    subscriptionStatus: organization?.subscriptionStatus,
    currentOrganizationId: session.organizationId,
  };
}
