import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth } from "../utils.js";
import Post from "../models/postModel.js";
const postRouter = express.Router();

//create a post
postRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newPost = new Post(req.body);
    try {
      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } catch (err) {
      res.status(500).json(err);
    }
  })
);
//update a post
postRouter.put(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {})
);
//delete a post
postRouter.delete(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {})
);
//like a post
postRouter.put(
  "/:id/like",
  isAuth,
  expressAsyncHandler(async (req, res) => {})
);
//get a post
postRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {})
);
//get timeline posts
postRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {})
);

export default postRouter;
