import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import userRouter from "./Routers/userRouter.js";
import postRouter from "./routers/postRouter.js";
const app = express();

dotenv.config();
mongoose.connect(
  "mongodb://localhost/social",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  () => {
    console.log("Mongo is Connected");
  }
);
//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

//apis
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});
//start server
app.listen(5000, () => {
  console.log("Backend Server is running");
});
