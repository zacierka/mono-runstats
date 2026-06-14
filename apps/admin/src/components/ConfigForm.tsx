import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { GuildConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GeneralSection } from "./sections/GeneralSection";
import { RolesSection } from "./sections/RolesSection";
import { DisplaySection } from "./sections/DisplaySection";
import { PrivacySection } from "./sections/PrivacySection";
import { CronSection } from "./sections/CronSection";
import { FiltersSection } from "./sections/FiltersSection";
import { AppearanceSection } from "./sections/AppearanceSection";

const DEFAULT_CONFIG: GuildConfig = {
  run_logs_channel_id: null,
  linked_role_id: null,
  units: "miles",
  timezone: "UTC",
  embed_color: "#FC4C02",
  hide_strava_link: false,
  hide_location: false,
  hide_strava_pii: false,
  leaderboard_cron: null,
  weekly_stats_cron: null,
  min_distance_meters: 0,
  sport_types_filter: ["Run", "Walk", "Hike", "Ride", "Swim"],
};

export function ConfigForm({ guildId }: { guildId: string }) {
  const qc = useQueryClient();

  const configQuery = useQuery({
    queryKey: ["config", guildId],
    queryFn: api.getConfig,
  });

  const channelsQuery = useQuery({
    queryKey: ["channels", guildId],
    queryFn: api.getChannels,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles", guildId],
    queryFn: api.getRoles,
  });

  const mutation = useMutation({
    mutationFn: api.updateConfig,
    onSuccess: (data) => {
      qc.setQueryData(["config", guildId], data);
    },
  });

  const [values, setValues] = useState<GuildConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (configQuery.data) {
      setValues(configQuery.data);
    }
  }, [configQuery.data]);

  const set = <K extends keyof GuildConfig>(key: K, value: GuildConfig[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  if (configQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading config…</p>;
  }

  const channels = channelsQuery.data ?? [];
  const roles = rolesQuery.data ?? [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(values);
      }}
      className="space-y-8"
    >
      <GeneralSection values={values} set={set} channels={channels} />
      <Separator />
      <RolesSection values={values} set={set} roles={roles} />
      <Separator />
      <DisplaySection values={values} set={set} />
      <Separator />
      <PrivacySection values={values} set={set} />
      <Separator />
      <CronSection values={values} set={set} />
      <Separator />
      <FiltersSection values={values} set={set} />
      <Separator />
      <AppearanceSection values={values} set={set} />
      <Separator />

      <div className="flex items-center gap-4 pb-8">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
        {mutation.isSuccess && (
          <p className="text-sm text-green-600">Saved successfully.</p>
        )}
        {mutation.isError && (
          <p className="text-sm text-destructive">Failed to save. Please try again.</p>
        )}
      </div>
    </form>
  );
}
