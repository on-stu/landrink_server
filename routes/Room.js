import express from "express";
import { CheckIsValid } from "../functions/CheckIsValid.js";
import RoomModel from "../models/RoomModel.js";

const router = express.Router();

//create a room
router.post("/", async (req, res) => {
  const {
    body: { title, isSecret, password, creatorId, createdAt },
  } = req;
  try {
    if (isSecret) {
      const data = await RoomModel.create({
        title,
        isSecret,
        createdAt,
        password,
        creatorId,
      });
      res.send({ status: "success", data });
    } else {
      const data = await RoomModel.create({
        title,
        isSecret,
        creatorId,
        createdAt,
      });
      res.send({ status: "success", data });
    }
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.get("/", async (req, res) => {
  //get one room info
  const {
    query: { roomId },
  } = req;
  try {
    const data = await RoomModel.findOne({ _id: roomId });
    res.send({ status: "success", data });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

//방에 참가했을때
router.post("/participate", async (req, res) => {
  const {
    body: { roomId, userId },
  } = req;

  try {
    const response = await RoomModel.updateOne(
      { _id: roomId },
      {
        $addToSet: { participants: userId },
      }
    );
    res.send({ status: "success", data: response });
  } catch (error) {
    console.log(error);
    res.send({ status: "error", error });
  }
});

router.post("/getout", async (req, _) => {
  const {
    body: { roomId, userId },
  } = req;
  if (roomId && userId) {
    await RoomModel.updateOne(
      { _id: roomId },
      {
        $pull: { participants: userId },
      }
    );
  }
});

export default router;
