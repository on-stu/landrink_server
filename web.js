import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import User from "./routes/User.js";
import Room from "./routes/Room.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
const server = http.Server(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index");
});

app.use(bodyParser.json({ extended: true, limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userInfo) => {
    socket.userInfo = userInfo;
    socket.join(roomId);
    io.to(roomId).emit("user-connected", userInfo);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
    socket.on("disconnecting", () => {
      // PullUser(roomId, socket.userInfo.dbId);
      io.to(roomId).emit("user-disconnected", userInfo);
    });
  });
});

app.use("/auth", User);
app.use("/room", Room);

const CONNECTION_URI = process.env.CONNECTION_URI;
const PORT = process.env.PORT || 8001;

mongoose
  .connect(CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () =>
      console.log(`Server is running on port: ${PORT}`)
    );
  })
  .catch((error) => {
    console.log(error);
  });
