import type { SectionProps } from "@/lib/form";
import type { ApiRole } from "@/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props extends SectionProps {
  roles: ApiRole[];
}

function roleColor(color: number): string {
  return color === 0 ? "#99aab5" : `#${color.toString(16).padStart(6, "0")}`;
}

export function RolesSection({ values, set, roles }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Roles</h2>
        <p className="text-sm text-muted-foreground">
          Automatically assign a role when a member links their Strava account.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="linked-role">Linked Strava role</Label>
        <Select
          value={values.linked_role_id ?? "__none__"}
          onValueChange={(v) => set("linked_role_id", v === "__none__" ? null : v)}
        >
          <SelectTrigger id="linked-role">
            <SelectValue placeholder="None (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                <span
                  className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: roleColor(r.color) }}
                />
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
