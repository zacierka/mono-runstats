import { useRef } from "react";
import type { SectionProps } from "@/lib/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = SectionProps;

export function AppearanceSection({ values, set }: Props) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customise the colour of activity embeds.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="embed-color-text">Embed colour</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="h-10 w-10 rounded-md border border-input shadow-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: values.embed_color }}
            aria-label="Pick colour"
          />
          <input
            ref={colorInputRef}
            type="color"
            value={values.embed_color}
            onChange={(e) => set("embed_color", e.target.value)}
            className="sr-only"
            tabIndex={-1}
          />
          <Input
            id="embed-color-text"
            value={values.embed_color}
            onChange={(e) => set("embed_color", e.target.value)}
            maxLength={7}
            className="w-32 font-mono text-sm uppercase"
            placeholder="#FC4C02"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Click the swatch or enter a hex value. Default is Strava orange (#FC4C02).
        </p>
      </div>
    </section>
  );
}
