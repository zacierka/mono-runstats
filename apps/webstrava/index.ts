import { Hono } from "hono";
import { stravaRoutes } from "./src/routes/strava";
import { name, version } from "./package.json";

console.log(`${name} v${version}`);

const app = new Hono();

app.route("/", stravaRoutes);

export default app;