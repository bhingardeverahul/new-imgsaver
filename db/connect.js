const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected sucessfully...!");
  })
  .catch((err) => {
    console.log(err);
  });
