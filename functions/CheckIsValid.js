import RoomModel from "../models/RoomModel.js";

export const CheckIsValid = async (roomId) => {
  const roomState = await RoomModel.findOne({ _id: roomId });
  if (
    (roomState && !roomState.participants) ||
    roomState.participants.length == 0
  ) {
    await RoomModel.deleteOne({ _id: roomId });
  }
};

export const PullUser = async (roomId, userId) => {
  if (roomId && userId) {
    await RoomModel.updateOne(
      { _id: roomId },
      {
        $pull: { participants: userId },
      }
    ).then(() => {
      CheckIsValid(roomId);
    });
  }
};
