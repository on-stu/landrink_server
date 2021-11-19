import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    createdAt: { type: Date, required: true },
    creatorId: { type: String, required: true },
    participants: { type: Array },
    isSecret: { type: Boolean, required: true },
    password: { type: String },
  },
  {
    collection: "rooms",
  }
);

const RoomModel = mongoose.model("RoomSchema", RoomSchema);

export default RoomModel;
