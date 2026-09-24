import type {
  CommandContext,
  CommandHandler,
} from "./command.types";

export const reportCommand: CommandHandler = {
  name: "report",

  async execute(context: CommandContext) {
    const report = context.options.text;

    if (typeof report !== "string" || !report.trim()) {
      throw new Error("Report text is required.");
    }

    return {
      response: `📋 Report received.\n\n${report}`,
      mirrorNotification:
        `🚨 New Report\n` +
        `User: ${context.username}\n` +
        `Report: ${report}`,
    };
  },
};