import UserModel from "../models/UserModel.js";

export const toOnline = async (id) => {
  console.log(id);
  const response = await UserModel.updateOne(
    { _id: id },
    { $set: { online: true } }
  );
  console.log(response);
};

export const toOffline = async (id) => {
  const response = await UserModel.updateOne(
    { _id: id },
    { $set: { online: false } }
  );
  console.log(response);
};
