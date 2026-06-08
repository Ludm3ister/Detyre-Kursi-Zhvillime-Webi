import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { isAdmin } from "../utils/roles.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user no longer exists");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

export const admin = (req, res, next) => {
  if (req.user && isAdmin(req.user)) {
    return next();
  }
  res.status(403);
  throw new Error("Access denied, admin privileges required");
};

export const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    return next();
  }
  res.status(403);
  throw new Error("Access denied, super admin privileges required");
};
