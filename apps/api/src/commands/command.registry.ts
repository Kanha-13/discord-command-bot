import type { CommandHandler } from "./command.types";
import { reportCommand } from "./report.command";
import { statusCommand } from "./status.command";

const commands: CommandHandler[] = [
  statusCommand,
  reportCommand,
];

const commandMap = new Map(
  commands.map((command) => [command.name, command]),
);

export function getCommand(
  commandName: string,
): CommandHandler | undefined {
  return commandMap.get(commandName);
}

export function getRegisteredCommands(): CommandHandler[] {
  return commands;
}