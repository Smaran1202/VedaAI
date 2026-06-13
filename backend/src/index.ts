import { createServer } from "http";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import { env } from "./config/env";
import { connectDatabase, getDatabaseStatus, registerDatabaseShutdown } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { assignmentRouter } from "./routes/assignment.routes";
import { userRouter } from "./routes/user.routes";
import { workspaceProfileRouter } from "./routes/workspaceProfile.routes";
import { initializeSocket } from "./socket";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.clientUrl
  }
});

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(":method :url :response-time ms"));
app.use("/api", apiRateLimiter);

app.get("/health", (_request, response) => {
  response.json({
    success: true,
    message: "Health check passed",
    data: {
      status: "ok",
      database: getDatabaseStatus()
    }
  });
});

app.use("/api/users", userRouter);
app.use("/api/workspace", workspaceProfileRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/assignments", assignmentRouter);

initializeSocket(io);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  registerDatabaseShutdown();

  httpServer.listen(env.port, () => {
    console.info(`VedaAI API listening on port ${env.port}`);
  });

  void connectDatabase();
}

void bootstrap();
