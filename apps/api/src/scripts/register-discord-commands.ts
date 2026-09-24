import "dotenv/config";
import { registerGlobalCommands } from "../integrations/discord/discord.commands";

registerGlobalCommands()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });