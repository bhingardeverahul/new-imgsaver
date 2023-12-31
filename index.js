const express = require("express");
const path = require("path");
const fs = require("fs");
require("./db/connect");
const mongoose = require("mongoose");
const User = require("./models/user");
var session = require("express-session");
const ejs = require("ejs");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8000;
const multer = require("multer");

//set ejs

const files = path.join(__dirname, "views");
app.set("view engine", "ejs");
app.set("views", files);
app.use(express.static("public"));
// mongoose.set("strictQuery",true)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const { throws } = require("assert");

//session
app.use(
  session({
    secret: "imrahul",
    resave: false,
    saveUninitialized: true,
    // cookie: { maxAge: 3000 }
  })
);

// //storing session
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});
app.use(express.static("uploads"));

app.get("/api/contact", (req, res) => {
  res.render("contact");
});
app.get("/api/about", (req, res) => {
  res.render("about");
});

//upload images

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");
//create a user

app.get("/api/add", (req, res) => {
  res.render("add");
});

app.post("/api/add", upload, async (req, res) => {
  try {
    const email = req.body.email;
    const Register = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });
    const data = await Register.save();
    console.log(data);
    // res.send(data)
    req.session.message = {
      type: "success",
      message: "User add successfully",
      // maxAge: 3000
    };
    //if we use render alert not show use only below
    res.redirect("/api/home");
  } catch (error) {
    console.log(error);
  }
});

//display data on screen
app.get("/api/home", async (req, res) => {
  try {
    const users = await User.find();
    res.render("homess", {
      users: users,
    });
  } catch (error) {
    console.log(error);
  }
});

//edit a user
app.get("/api/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById({ _id: id });
    console.log(user);
    res.render("edit", { user: user });
  } catch (error) {
    console.log(error);
  }
});

// update
app.post("/api/update/:id", upload, async (req, res) => {
  try {
    const id = req.params.id;
    let new_image = " ";
    if (req.file) {
      new_image = req.file.filename;
      const filename = fs.unlink("./public/uploads" + req.body.old_image);
    } else {
      new_image = req.body.old_image;
    }
    const upd = await User.findByIdAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
      }
    );
    req.session.message = {
      type: "success",
      message: "User Updated successfully",
    };
    res.redirect("/api/homeapi/home");
  } catch (error) {
    console.log(error);
  }
});

//delete photo
app.get("/api/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const Deletef = await User.deleteOne({ _id: id });
    // function(err,result){

    //   if (result.image !=" ") {
    //     const removed= fs.unlinkSync('./uploads/' + result.image)

    //   }
    req.session.message = {
      type: "info",
      message: "User Deleted successfully",
    };
    res.redirect("/api/home/home");
    // }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
