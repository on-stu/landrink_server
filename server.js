import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(bodyParser.json({ extended: true, limit: 5000000 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const CONNECTION_URI = process.env.CONNECTION_URI;
const PORT = process.env.PORT || 3001;

mongoose
  .connect(CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
  })
  .catch((error) => {
    console.log(error);
  });
