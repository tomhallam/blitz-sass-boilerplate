import { resolver, SecurePassword } from "blitz"
import db from "db"
import { Signup } from "app/auth/validations"
import slugify from "slugify"

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ email, password, organizationName }, ctx) => {
    const hashedPassword = await SecurePassword.hash(password.trim())
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
    })

    const s = await ctx.session.$create({
      userId: user.id,
      roles: [user.role, user.memberships[0].role],
      organizationId: user.memberships[0].organizationId,
      subscriptionStatus: "incomplete",
    })

    console.log("session", s)

    return user
  }
)
