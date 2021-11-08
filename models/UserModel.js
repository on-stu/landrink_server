import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickname: { type: String, required: true },
    socialLogin: { type: String },
    sex: { type: String },
    friends: { type: Array },
    askingFriends: { type: Array },
    askedFriends: { type: Array },
    photoURL: { type: String },
    bottles: { type: Number },
  },
  {
    collection: "users",
  }
);

const UserModel = mongoose.model("UserSchema", UserSchema);

export default UserModel;
