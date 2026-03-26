// Vercel serverless entry — re-exports the Express app without calling listen()
import app from "../src/app.js";

export default app;
