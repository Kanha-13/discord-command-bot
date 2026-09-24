import dotenv from "dotenv";
import path from "path";

import app from "./app";
import { prisma } from "./configs/database";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const PORT = Number(process.env.PORT) || 5001;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
}

startServer()