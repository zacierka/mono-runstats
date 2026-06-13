import type { EmbedPayload } from "../types";
import { METERS_PER_MILE, FEET_PER_METER } from "@packages/shared/src/strava/constants";

export function formatActivity(activity: any, discordId: string): EmbedPayload {
  const distanceMiles = (activity.distance_meters / METERS_PER_MILE).toFixed(2);
  const pacePerMile = activity.moving_time_seconds / (activity.distance_meters / METERS_PER_MILE);
  const paceMinutes = Math.floor(pacePerMile / 60);
  const paceSeconds = Math.round(pacePerMile % 60).toString().padStart(2, "0");
  const durationHours = Math.floor(activity.moving_time_seconds / 3600);
  const durationMinutes = Math.floor((activity.moving_time_seconds % 3600) / 60);
  const durationSeconds = (activity.moving_time_seconds % 60).toString().padStart(2, "0");
  const elevationFeet = Math.round(activity.elevation_gain * FEET_PER_METER);
  const weekly_miles = activity.weekly_miles ?? 0;
  const weekly_run_count = activity.weekly_run_count ?? 0;
  const duration = durationHours > 0
    ? `${durationHours}h ${durationMinutes}m ${durationSeconds}s`
    : `${durationMinutes}m ${durationSeconds}s`;

  return {
    title: `${activity.name}`,
    description: `<@${discordId}> just logged a ${activity.sport_type.toLowerCase()}!`,
    color: 0xFC4C02,
    fields: [
      { name: "Distance", value: `**${distanceMiles} mi**`, inline: false },
      { name: "Duration", value: duration, inline: true },
      { name: "Pace", value: `${paceMinutes}:${paceSeconds}/mi`, inline: true },
      { name: "Elevation", value: `${elevationFeet} ft`, inline: true },
      ...(weekly_miles > 0 || weekly_run_count > 0 ? [{
        name: "────────────────────────",
        value: `**Weekly Distance**: ${weekly_miles.toFixed(2)} mi | **Run** #${weekly_run_count}`,
        inline: false as const
      }] : []),
    ],
    footer: { text: "Strava Activity" },
    timestamp: activity.start_date,
  };
}
