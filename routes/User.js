import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

const router = express.Router();

const JWT_SECRET = "adfiaoendddczzncjnaw2$$asjd5if23348u%%^$ufnnjsbbshdfknc";

router.post("/login", async (req, res) => {
  const {
    body: { username, password },
  } = await req;
  const user = await UserModel.findOne({ username }).lean();

  if (!user) {
    return res.json({ status: "error", error: "아이디가 틀립니다." });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET
    );
    return res.json({ status: "success", token: token });
  } else {
    return res.json({ status: "error", error: "비밀번호가 틀립니다." });
  }
});

router.post("/register", async (req, res) => {
  const {
    body: { username, password, nickname, photoURL, sex, age, bottles },
  } = await req;
  const hashedPassword = await bcrypt.hash(password, 10);

  if (typeof username !== "string") {
    return res.json({ status: "error", error: "사용할 수 없는 아이디" });
  }

  if (typeof password !== "string") {
    return res.json({ status: "error", error: "사용할 수 없는 비밀번호" });
  }

  if (username === "") {
    return res.json({ status: "error", error: "아이디를 입력해주세요" });
  }

  if (password.length < 6) {
    return res.json({
      status: "error",
      error: "비밀번호가 너무 짧습니다. 비밀번호는 최소 6자여야 합니다.",
    });
  }

  if (nickname === "") {
    return res.json({ status: "error", error: "닉네임을 입력해주세요" });
  }
  try {
    const response = await UserModel.create({
      username,
      password: hashedPassword,
      nickname,
      photoURL,
      sex,
      age,
      bottles,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ status: "error", error: "아이디가 이미 사용중입니다" });
    }
  }
  res.send({ status: "success", username, password, nickname });
});

router.get("/myinfo", async (req, res) => {
  const { token } = await req.query;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const userInfo = await UserModel.findOne({ _id: user.id }).lean();
    res.send({ status: "success", user: userInfo });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.get("/userinfo", async (req, res) => {
  const { id } = req.query;

  try {
    const profile = await UserModel.find({ _id: id }).lean();
    res.send({ status: "success", profile: profile });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.post("/kakaoLogin", async (req, res) => {
  const {
    body: { id, nickname, profile_image },
  } = req;

  const user = await UserModel.findOne({ username: id }).lean();
  if (!user) {
    const response = await UserModel.create({
      username: id,
      password: id,
      nickname,
      socialLogin: "kakao",
      photoURL: profile_image,
    });
    const token = jwt.sign(
      {
        id: response._id,
        username: response.username,
      },
      JWT_SECRET
    );
    res.send({ status: "success", token: token });
  } else {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      JWT_SECRET
    );
    res.send({ status: "success", token: token });
  }
});

router.put("/user", async (req, res) => {
  const {
    body: { updatedUser },
  } = req;
  try {
    const response = await UserModel.updateOne(
      { _id: updatedUser._id },
      { $set: updatedUser }
    );
    res.send({ status: "success", data: response });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.put("/password", async (req, res) => {
  const { token, password, newpassword } = req.body;
  if (typeof newpassword !== "string") {
    return res.json({ status: "error", error: "사용할 수 없는 비밀번호" });
  }

  if (newpassword.length < 5) {
    return res.json({
      status: "error",
      error: "비밀번호가 너무 짧습니다. 비밀번호는 최소 6자여야 합니다.",
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const _id = user.id;
    const userObj = await UserModel.findOne({ _id: user.id }).lean();
    if (await bcrypt.compare(password, userObj.password)) {
      const hashedPassword = await bcrypt.hash(newpassword, 10);

      await UserModel.updateOne(
        { _id },
        {
          $set: { password: hashedPassword },
        }
      );
      return res.send({ status: "success" });
    } else {
      res.send({ status: "error", error: "비밀번호가 틀립니다." });
    }
  } catch (error) {
    res.json({ status: "error", error });
    console.log(error);
  }
});

router.post("/ask", async (req, res) => {
  const {
    body: { fromId, toId },
  } = req;
  try {
    const data1 = await UserModel.updateOne(
      { _id: fromId },
      { $addToSet: { askingFriends: [toId] } }
    );
    const data2 = await UserModel.updateOne(
      { _id: toId },
      { $addToSet: { askedFriends: [fromId] } }
    );
    res.send({ status: "success", data1, data2 });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

router.post("/confirm", async (req, res) => {
  const {
    body: { fromId, toId },
  } = req;
  try {
    const data1 = await UserModel.updateMany(
      { _id: toId },
      { $pull: { askingFriends: fromId }, $addToSet: { friends: [fromId] } }
    );
    const data2 = await UserModel.updateOne(
      { _id: fromId },
      { $pull: { askedFriends: toId }, $addToSet: { friends: [toId] } }
    );
    res.send({ status: "success", data1, data2 });
  } catch (error) {
    res.send({ status: "error", error });
  }
});

export default router;
