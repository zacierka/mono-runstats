import type { GuildConfig } from "@/types";

export type SetField = <K extends keyof GuildConfig>(key: K, value: GuildConfig[K]) => void;

export interface SectionProps {
  values: GuildConfig;
  set: SetField;
}
