import type { SectionProps } from "@/lib/form";
import type { ApiChannel } from "@/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props extends SectionProps {
  channels: ApiChannel[];
}

export function GeneralSection({ values, set, channels }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">General</h2>
        <p className="text-sm text-muted-foreground">
          Channel where run activity embeds are posted.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="run-logs-channel">Run logs channel</Label>
        <Select
          value={values.run_logs_channel_id ?? "__none__"}
          onValueChange={(v) => set("run_logs_channel_id", v === "__none__" ? null : v)}
        >
          <SelectTrigger id="run-logs-channel">
            <SelectValue placeholder="Select a channel…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {channels.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                # {ch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
