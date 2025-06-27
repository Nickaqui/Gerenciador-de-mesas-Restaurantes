import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import reservaRoutes from "./routes/reservaRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

connectDB();

app.use("/api", reservaRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

