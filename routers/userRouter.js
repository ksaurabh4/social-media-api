import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import { generateToken, isAdmin, isAuth } from "../utils.js";
import User from "../models/userModel.js";
const userRouter = express.Router();

//regiter user

userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    const checkUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    console.log(checkUser);
    if (!checkUser) {
      const user = new User({
        username,
        email,
        password: bcrypt.hashSync(password, 8),
      });
      try {
        const createUser = await user.save();
        console.log(createUser);
        res.send({
          _id: createUser._id,
          username: createUser.username,
          email: createUser.email,
          isAdmin: createUser.isAdmin,
          token: await generateToken(createUser),
        });
      } catch (error) {
        res.status(401).send({ message: error });
      }
    } else {
      res.status(401).send({ message: "User Already Exist!" });
    }
  })
);

//Sign in
userRouter.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const { _id, username, email, isAdmin } = user;
        res.send({
          _id,
          username,
          email,
          isAdmin,
          token: await generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid Email or Password" });
  })
);

//logout the user from perticular system like desktop or mobile
userRouter.post(
  "/logout",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log(req.token, req.user, req.user.tokens);
    try {
      console.log(req.user.tokens);
      req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token;
      });

      await req.user.save();
      res.send({ message: "Logout Successful!" });
    } catch (e) {
      res.status(500).send({ message: e });
    }
  })
);

//logout from all the systems
userRouter.post("/logoutall", isAuth, async (req, res) => {
  try {
    req.user.tokens = [];
    req.user.save();
    res.send({ message: "All accounts logout Successfully!" });
  } catch (e) {
    res.status(500).send();
  }
});

//update user

userRouter.put(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log(req.params.id, req.user._id.toString());
    if (req.params.id === req.user._id.toString() || req.user.isAdmin) {
      const requestedUpdates = Object.keys(req.body);
      const user = await User.findById(req.params.id);
      if (user) {
        requestedUpdates.forEach((update) => {
          user[update] = req.body[update];
        });
        if (req.body.password) {
          user.password = bcrypt.hashSync(req.body.password, 8);
        }
        console.log(req.user);
        const updatedUser = await user.save();
        res.send({ message: "User Updated", user: updatedUser });
      } else {
        res.status(404).send({ message: "User Not Found" });
      }
    } else {
      res.status(401).send({
        message: "You are not allowed to change this other user details!",
      });
    }
  })
);

//delete user
userRouter.delete(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString() || req.user.isAdmin) {
      try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Account has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can delete only your account!");
    }
  })
);
//get a user
//get user
userRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (user) {
        const { password, updatedAt, ...others } = user._doc;
        res.send(others);
      } else {
        res.status(404).send({ message: "User Not Found!" });
      }
    } catch (error) {
      res.status(500).send({ message: error });
    }
  })
);
//follow a user

userRouter.put(
  "/:id/follow",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.params.id !== req.user._id.toString()) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!user.followers.includes(req.user._id)) {
          await user.updateOne({ $push: { followers: req.user._id } });
          await currentUser.updateOne({ $push: { followings: req.params.id } });
          res.status(200).send({ message: "User Has Been Followed!" });
        } else
          res
            .status(404)
            .send({ message: "You Have Already Followed This User!" });
      } catch (error) {
        res.status(500).send({ message: error });
      }
    } else {
      res.status(404).send({ message: "You Cannot Follow Yourself!" });
    }
  })
);

//unfollow a user
userRouter.put(
  "/:id/unfollow",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.params.id !== req.user._id.toString()) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);
        if (user.followers.includes(req.user._id)) {
          await user.updateOne({ $pull: { followers: req.user._id } });
          await currentUser.updateOne({ $pull: { followings: req.params.id } });
          res.status(200).send({ message: "User Has Unfollowed!" });
        } else
          res.status(404).send({ message: "You Havent Followed This User!" });
      } catch (error) {
        res.status(500).send({ message: error });
      }
    } else {
      res.status(404).send({ message: "You Cant Unfollow Yourself!" });
    }
  })
);
export default userRouter;
