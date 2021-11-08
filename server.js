import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import User from "./routes/User.js";

dotenv.config();

const app = express();
const server = http.Server(app);
const io = new Server(server);
const peerServer = ExpressPeerServer(server, { debug: true });

app.use("/peerjs", peerServer);

app.use(bodyParser.json({ extended: true, limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

io.on("connection", (socket) => {
  console.log(socket);
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

app.use("/auth", User);

const CONNECTION_URI = process.env.CONNECTION_URI;
const PORT = process.env.PORT || 3001;

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
