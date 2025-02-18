import { client as RedisClient } from "@trivo/kv";
import { getUser } from "@trivo/supabase/cached-queries/platform";
import { Ratelimit } from "@upstash/ratelimit";
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "10s"),
  redis: RedisClient,
});

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const actionClientWithMeta = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
      track: z
        .object({
          event: z.string(),
          channel: z.string(),
        })
        .optional(),
    });
  },
});

export const authActionClient = actionClientWithMeta
  .use(async ({ next }) => {
    const result = await next({ ctx: {} });

    return result;
  })
  .use(async ({ next, metadata }) => {
    const ip = (await headers()).get("x-forwarded-for");

    const { success, remaining } = await ratelimit.limit(
      `${ip}-${metadata.name}`
    );

    if (!success) {
      throw new Error("Too many requests");
    }

    return next({
      ctx: {
        ratelimit: {
          remaining,
        },
      },
    });
  })
  .use(async ({ next }) => {
    const user = await getUser();

    if (!user?.data) {
      throw new Error("Unauthorized");
    }

    return next({ ctx: { user: user.data } });
  });
