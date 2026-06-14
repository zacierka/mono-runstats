import type { SectionProps } from "@/lib/form";
import type { GuildConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = SectionProps;

const TOGGLES: Array<{
  key: keyof Pick<GuildConfig, "hide_strava_link" | "hide_location" | "hide_strava_pii">;
  label: string;
  description: string;
}> = [
  {
    key: "hide_strava_link",
    label: "Hide Strava profile link",
    description: "Remove the link to a member's public Strava profile from embeds.",
  },
  {
    key: "hide_location",
    label: "Hide location hints",
    description: "Suppress city and country from embeds.",
  },
  {
    key: "hide_strava_pii",
    label: "Hide Strava PII",
    description: "Omit name, profile picture, and other Strava personal data from embeds.",
  },
];

export function PrivacySection({ values, set }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Privacy</h2>
        <p className="text-sm text-muted-foreground">
          Control what personal information appears in public run embeds.
        </p>
      </div>

      <div className="space-y-3">
        {TOGGLES.map(({ key, label, description }) => (
          <div key={key} className="flex items-start justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor={`switch-${key}`} className="cursor-pointer">
                {label}
              </Label>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
              id={`switch-${key}`}
              checked={values[key]}
              onCheckedChange={(v) => set(key, v)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
