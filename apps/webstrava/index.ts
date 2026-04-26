import { Hono } from "hono";
import { stravaRoutes } from "./src/routes/strava";

const app = new Hono();

app.route("/", stravaRoutes);

export default app;