import type { SectionProps } from "@/lib/form";
import type { GuildConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Props = SectionProps;

const JOBS: Array<{
  key: keyof Pick<GuildConfig, "leaderboard_cron" | "weekly_stats_cron">;
  label: string;
  description: string;
  defaultCron: string;
  hint: string;
}> = [
  {
    key: "leaderboard_cron",
    label: "Leaderboard post",
    description: "Automatically post a distance leaderboard on a schedule.",
    defaultCron: "0 9 * * 1",
    hint: "Every Monday at 9am UTC — 0 9 * * 1",
  },
  {
    key: "weekly_stats_cron",
    label: "Weekly stats post",
    description: "Post a weekly summary of server-wide running stats.",
    defaultCron: "0 8 * * 1",
    hint: "Every Monday at 8am UTC — 0 8 * * 1",
  },
];

export function CronSection({ values, set }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Scheduled Jobs</h2>
        <p className="text-sm text-muted-foreground">
          Enable automatic posts using cron expressions (all times UTC).
        </p>
      </div>

      <div className="space-y-4">
        {JOBS.map(({ key, label, description, defaultCron, hint }) => {
          const enabled = values[key] !== null;
          return (
            <div key={key} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor={`switch-${key}`} className="cursor-pointer">
                    {label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Switch
                  id={`switch-${key}`}
                  checked={enabled}
                  onCheckedChange={(v) => set(key, v ? defaultCron : null)}
                />
              </div>
              {enabled && (
                <div className="space-y-1.5">
                  <Label htmlFor={`cron-${key}`} className="text-xs">
                    Cron expression
                  </Label>
                  <Input
                    id={`cron-${key}`}
                    value={values[key] ?? ""}
                    onChange={(e) => set(key, e.target.value || null)}
                    placeholder={defaultCron}
                    className="font-mono text-sm max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
