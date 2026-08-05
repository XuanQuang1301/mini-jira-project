import express from "express";
import cors from "cors";
import "dotenv/config";
import rootRouter from "./routes"; 

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", rootRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const cyanUrl = `\x1b[36m\x1b[4mhttp://localhost:${PORT}\x1b[0m`;
  console.log(` \x1b[1mMini Jira Backend Server Ready!\x1b[0m`);
  console.log(` \x1b[32m➜\x1b[0m API Base URL: ${cyanUrl}`);
});