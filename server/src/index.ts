import express from "express";
import cors from "cors";
import { createServer } from "http";
import { resolve } from "path";
import { env } from "./config/env.js";
import { getAllowedOrigins } from "./config/cors.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import { createSocketServer } from "./sockets/index.js";
import { registerAllHandlers } from "./events/index.js";
import { emit } from "./events/index.js";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: getAllowedOrigins(), credentials: true }));
app.use(express.json({ limit: "20mb" }));
app.use("/uploads", express.static(resolve(import.meta.dirname, "../uploads")));

app.use("/api", routes);

app.use(errorHandler);

const io = createSocketServer(httpServer);

registerAllHandlers(io);

async function start() {
  await connectDB();
  httpServer.listen(env.PORT, () => {
    emit("system:startup", { version: "1.0.0" });
    console.log(`[Server] Running on http://localhost:${env.PORT}`);
  });
}

start();
