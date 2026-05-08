import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// Global Middlewares
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(helmet()); // Set security HTTP headers
app.use(morgan("dev")); // HTTP request logger
app.use(express.json({ limit: "16kb" })); // Parse JSON payloads
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded payloads
app.use(express.static("public")); // Serve static files (if any)
app.use(cookieParser()); // Parse cookies

// Routes Import
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import userRouter from "./routes/user.routes.js";

// Routes Declaration
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/users", userRouter);

// Global Error Handling Middleware (should be at the end)
import { ApiError } from "./utils/ApiError.js";

app.use((err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(response);
});

export { app };
