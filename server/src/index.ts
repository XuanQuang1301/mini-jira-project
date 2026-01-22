import express from "express";
import cors from "cors";
import "dotenv/config";
import rootRouter from "./routes"; 

const app = express();

app.use(cors());
app.use(express.json());

// Sử dụng Router tổng
app.use("/api", rootRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});