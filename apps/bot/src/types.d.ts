import type { Command } from "./commands/command";
import type { Collection } from "discord.js";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}
