import db, { GlobalRole } from "db";
import { GuardBuilder, PrismaModelsType } from "@blitz-guard/core";

type ExtendedResourceTypes = "comment" | "article" | PrismaModelsType<typeof db>;

type ExtendedAbilityTypes = "send email";

const Guard = GuardBuilder<ExtendedResourceTypes, ExtendedAbilityTypes>(
  async (ctx, { can, cannot }) => {
    cannot("manage", "all");

    if (ctx.session.$isAuthorized()) {
      // @ts-ignore
      can("manage", "organization", (_args) => {
        // @ts-ignore
        return Promise.resolve(ctx.session.roles?.includes("OWNER"));
      });
    }
    /*
		Your rules go here, you can start by removing access to everything
		and gradually adding the necessary permissions

		eg:
		cannot("manage", "comment")
		cannot("manage", "article")

		can("read", "article")
		can("read", "comment")

		if (ctx.session.isAuthorized()) {
			can("create", "article")
			can("create", "comment")
			can("send email", "comment")

			can("delete", "comment", async (_args) => {
				return (await db.comment.count({ where: { userId: ctx.session.userId } })) === 1
			})
		}
    */
  }
);

export default Guard;
