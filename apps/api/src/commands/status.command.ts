import type {
  CommandContext,
  CommandHandler,
} from "./command.types";

export const statusCommand: CommandHandler = {
  name: "status",

  async execute(context: CommandContext) {
    return {
      response: "🟢 Bot is operational.",
      mirrorNotification: `/${statusCommand.name} executed by ${context.username}`,
    };
  },
};