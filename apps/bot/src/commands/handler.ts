import { Client, Collection } from "discord.js";
import { Command } from "./command";
import { readdir } from "node:fs/promises";
import path from "node:path";

export async function loadCommands(client: Client) {
  client.commands = new Collection<string, Command>();  
  const glob = new Bun.Glob("**/*.ts");
  
  for await (const file of glob.scan(import.meta.dir)) {
    if (!file.endsWith(".ts") || file === "handler.ts" || file === "command.ts") continue;

    const filePath = path.join(import.meta.dir, file);
    const commandModule = await import(filePath);
    const command: Command = commandModule.default;

    client.commands.set(command.data.name, command);
    console.log(`Loaded Command: ${command.data.name}`);
    
  }
}
