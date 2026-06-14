import type { SectionProps } from "@/lib/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type Props = SectionProps;

const SPORT_TYPES = [
  "Run",
  "Walk",
  "Hike",
  "Ride",
  "Swim",
  "VirtualRun",
  "VirtualRide",
  "WeightTraining",
  "Workout",
];

export function FiltersSection({ values, set }: Props) {
  const toggleSport = (sport: string, checked: boolean) => {
    const next = checked
      ? [...values.sport_types_filter, sport]
      : values.sport_types_filter.filter((s) => s !== sport);
    set("sport_types_filter", next);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Activity Filters</h2>
        <p className="text-sm text-muted-foreground">
          Only post activities that match these criteria.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="min-distance">Minimum distance (metres)</Label>
        <Input
          id="min-distance"
          type="number"
          min={0}
          step={100}
          value={values.min_distance_meters}
          onChange={(e) => set("min_distance_meters", Number(e.target.value))}
          className="max-w-[180px]"
        />
        <p className="text-xs text-muted-foreground">
          Set 0 to post all activities regardless of distance.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Activity types to post</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SPORT_TYPES.map((sport) => (
            <label key={sport} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={values.sport_types_filter.includes(sport)}
                onCheckedChange={(v) => toggleSport(sport, !!v)}
              />
              {sport}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
