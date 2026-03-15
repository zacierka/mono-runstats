
export type EmbedPayload = {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: boolean;
};

export type StravaRunActivity = {
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  average_speed?: number; // m/s
  average_heartrate?: number;
  calories?: number;
  start_date: string; // ISO string
};

export class StravaFormatter {
  private static STRAVA_ORANGE = 0xfc4c02;

  /* ---------- Public API ---------- */

  static stravaRun(activity: StravaRunActivity): EmbedPayload {
    const distanceKm = this.metersToKm(activity.distance);
    const pace = activity.average_speed
      ? this.formatPace(activity.average_speed)
      : "—";

    return {
      title: "🏃‍♂️ New Run on Strava",
      description: `**${activity.name}**`, // add user mention 
      color: this.STRAVA_ORANGE,
      fields: [
        {
          name: "Distance",
          value: `${distanceKm} km`,
          inline: true,
        },
        {
          name: "Time",
          value: this.formatDuration(activity.moving_time),
          inline: true,
        },
        {
          name: "Pace",
          value: pace,
          inline: true,
        },
        {
          name: "Elevation Gain",
          value: `${Math.round(activity.total_elevation_gain)} m`,
          inline: true,
        },
        {
          name: "Avg HR",
          value: activity.average_heartrate
            ? `${Math.round(activity.average_heartrate)} bpm`
            : "—",
          inline: true,
        },
        {
          name: "Calories",
          value: activity.calories
            ? `${Math.round(activity.calories)} kcal`
            : "—",
          inline: true,
        },
      ],
      footer: {
        text: "Data from Strava",
      },
      timestamp: true,
    };
  }

  /* ---------- Formatting Helpers ---------- */

  private static metersToKm(meters: number): string {
    return (meters / 1000).toFixed(2);
  }

  private static formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }

    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  private static formatPace(speedMps: number): string {
    const paceSeconds = Math.round(1000 / speedMps);
    const minutes = Math.floor(paceSeconds / 60);
    const seconds = paceSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")} / km`;
  }
}
