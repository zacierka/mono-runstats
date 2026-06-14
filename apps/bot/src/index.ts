import { Hono } from "hono";
import { logger } from "hono/logger";
import { waitForReady } from "./discord";
import routes from "./routes";
import adminRoutes from "./adminRoutes";
import { name, version } from "../package.json";

console.log(`${name} v${version}`);

const app = new Hono();
const port = Number(process.env.PORT) || 4000;
app.use(logger());

// Mount routes
app.route("/", routes);
app.route("/", adminRoutes);

app.all("*", (c) => {
  return c.json({ error: "Not found" }, 404);
});

await waitForReady();
console.log(`[Server] Hono listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};