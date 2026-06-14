import type { SectionProps } from "@/lib/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = SectionProps;

const TIMEZONES = (Intl as typeof Intl & { supportedValuesOf(key: string): string[] }).supportedValuesOf("timeZone");

export function DisplaySection({ values, set }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Display</h2>
        <p className="text-sm text-muted-foreground">
          Units and timezone used in activity embeds.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Distance units</Label>
        <div className="flex gap-4">
          {(["miles", "km"] as const).map((u) => (
            <label key={u} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="units"
                value={u}
                checked={values.units === u}
                onChange={() => set("units", u)}
                className="accent-primary"
              />
              {u === "miles" ? "Miles" : "Kilometres"}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="timezone">Timezone</Label>
        <Select value={values.timezone} onValueChange={(v) => set("timezone", v)}>
          <SelectTrigger id="timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
