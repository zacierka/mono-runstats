import type { EmbedPayload } from "../types";

export function formatActivity(activity: any, discordId: string): EmbedPayload {
  const distanceMiles = (activity.distance_meters / 1609.344).toFixed(2);
  const pacePerMile = activity.moving_time_seconds / (activity.distance_meters / 1609.344);
  const paceMinutes = Math.floor(pacePerMile / 60);
  const paceSeconds = Math.round(pacePerMile % 60).toString().padStart(2, "0");
  const durationHours = Math.floor(activity.moving_time_seconds / 3600);
  const durationMinutes = Math.floor((activity.moving_time_seconds % 3600) / 60);
  const durationSeconds = (activity.moving_time_seconds % 60).toString().padStart(2, "0");
  const elevationFeet = Math.round(activity.elevation_gain * 3.28084);
  const weekly_miles = activity.weekly_miles;
  const weekly_run_count = activity.weekly_run_count;
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
      {
        name: "────────────────────────",
        value: `**Weekly Distance**: ${weekly_miles} mi | **Run** #${weekly_run_count}`,
        inline: false
      },
    ],
    footer: { text: "Strava Activity" },
    timestamp: true,
  };
}
