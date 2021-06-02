import jwt from "jsonwebtoken";
import User from "./models/userModel.js";

//generate token
export const generateToken = async (user) => {
  const { _id, name, email, isAdmin } = user;
  const token = jwt.sign(
    { _id, name, email, isAdmin },
    process.env.JWT_SECRET || "somethingsecret",
    {
      expiresIn: "30d",
    }
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//user auth middleware
export const isAuth = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer xxxxxxx  to ignore first 7 digits
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "somethingsecret"
    );
    try {
      const user = await User.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });
      console.log(user);
      if (user) {
        req.token = token;
        req.user = user;
      } else {
        throw new Error();
      }
      next();
    } catch (error) {
      res.status(401).send({ message: "Invalid token" });
    }
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

//admin auth middleware
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};
