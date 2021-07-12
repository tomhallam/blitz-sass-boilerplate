import { resolver, SecurePassword } from "blitz";
import db from "db";
import slugify from "slugify";

import { Signup } from "app/auth/validations";

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ email, password, organizationName }, ctx) => {
    const hashedPassword = await SecurePassword.hash(password.trim());
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        hashedPassword,
        role: "USER",
        memberships: {
          create: {
            role: "OWNER",
            organization: {
              create: {
                name: organizationName,
                slug: slugify(organizationName),
                role: "CUSTOMER",
              },
            },
          },
        },
      },
      select: { id: true, name: true, email: true, role: true, memberships: true },
    });

    const s = await ctx.session.$create({
      userId: user.id,
      // @ts-ignore
      roles: [user.role, user.memberships[0].role],
      // @ts-ignore
      organizationId: user.memberships[0].organizationId,
      subscriptionStatus: "incomplete",
    });

    return user;
  }
);
