const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user.model");

const UserRoutes = express.Router();

UserRoutes.post("/register", async (req, res) => {
  let { password, username } = req.body;

  try {
    const users = await UserModel.find({ username });
    if (users.length > 0) {
      res.status(200).send("user is already exist try with new username");
    } else {
      bcrypt.hash(password, 5, async (err, hash) => {
        if (err) {
          res.status(500).send(err);
        } else {
          const user = new UserModel({
            username,

            password: hash,
          });
          await user.save();
          res.status(201).send("user Registered successfully");
        }
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

UserRoutes.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });

    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res.status(500).send(err);
        } else if (result) {
          const token = jwt.sign({ userId: user._id }, process.env.key);
          res.status(200).send({
            msg: "Login Successfull",
            name: user.username,
            token: token,
          });
        } else {
          res.status(200).send("Wrong Credntials");
        }
      });
    } else {
      res.status(200).send("Wrong Credntials");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = { UserRoutes };
