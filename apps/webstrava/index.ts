import { Hono } from "hono";
import { stravaRoutes } from "./routes/strava";

const app = new Hono();

app.route("/", stravaRoutes);

export default app;