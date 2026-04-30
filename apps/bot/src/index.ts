import { Hono } from "hono";
import { logger } from "hono/logger";
import { waitForReady } from "./discord";
import routes from "./routes";

console.log(`ENV VARS:\n${JSON.stringify(process.env, null, 2)}\n---`);

const app = new Hono();
const port = Number(process.env.PORT) || 4000;
app.use(logger());

// Mount routes
app.route("/", routes);

app.all("*", (c) => {
  return c.json({ error: "Not found" }, 404);
});

await waitForReady();
console.log(`[Server] Hono listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};