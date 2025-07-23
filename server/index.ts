import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes} from "./routes";
import { setupVite, serveStatic, log } from "./vite";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${status}: ${message}`);
  res.status(status).json({message});
});

async function startServer() {
  const server = await registerRoutes(app);

  // Set up Vite for development or server static files for production
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
}
const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
})
}  

startServer();