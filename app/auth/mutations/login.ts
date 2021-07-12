import { resolver, SecurePassword, AuthenticationError } from "blitz";
import db from "db";
import { Login } from "../validations";
import { Role } from "types";

export const authenticateUser = async (rawEmail: string, rawPassword: string) => {
  const email = rawEmail.toLowerCase().trim();
  const password = rawPassword.trim();
  const user = await db.user.findFirst({ where: { email }, include: { memberships: true } });
  if (!user) throw new AuthenticationError();

  const result = await SecurePassword.verify(user.hashedPassword, password);

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password);
    await db.user.update({ where: { id: user.id }, data: { hashedPassword: improvedHash } });
  }

  const { hashedPassword, ...rest } = user;
  return rest;
};

export default resolver.pipe(resolver.zod(Login), async ({ email, password }, ctx) => {
  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password);

  const organization = await db.organization.findFirst({
    where: {
      // @ts-ignore
      id: user.memberships[0].organizationId,
    },
  });

  if (!organization) {
    throw new Error("User not associated to an organization");
  }

  await ctx.session.$create({
    userId: user.id,
    // @ts-ignore
    roles: [user.role, user.memberships[0].role],
    // @ts-ignore
    organizationId: user.memberships[0].organizationId,
    subscriptionStatus: organization.subscriptionStatus,
  });

  return user;
});
