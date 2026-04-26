import { createMiddleware } from 'hono/factory'

export const backendService = createMiddleware(async (c, next) => {
    const secret = c.req.header("x-internal-secret");
    if (secret !== process.env.INTERNAL_SECRET) {
        return c.text("Unauthorized", 401);
    }
    await next();
})