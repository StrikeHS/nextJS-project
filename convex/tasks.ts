import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    // const identity = await ctx.auth.getUserIdentity();
    // console.log(identity);

    // if (!identity) {
    //   return [];
    // }

    return await ctx.db.query("tasks").collect();
  },
});
