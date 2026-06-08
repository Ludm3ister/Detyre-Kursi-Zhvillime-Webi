import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("An account with that email already exists");
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user._id.equals(req.user._id)) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }

  // Super admins are protected: no one can delete a super admin.
  if (user.role === "superadmin") {
    res.status(403);
    throw new Error("Super admins cannot be deleted");
  }

  // A normal admin may only delete regular users, not other admins.
  // (Super admins fall through and can delete admins and users.)
  if (req.user.role === "admin" && user.role === "admin") {
    res.status(403);
    throw new Error("Admins cannot delete other admins");
  }

  await user.deleteOne();
  res.json({ message: "User removed", id: req.params.id });
});

// Super-admin only: promote a user to admin or demote an admin to user.
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error('Role must be either "user" or "admin"');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user._id.equals(req.user._id)) {
    res.status(400);
    throw new Error("You cannot change your own role");
  }

  if (user.role === "superadmin") {
    res.status(403);
    throw new Error("A super admin's role cannot be changed");
  }

  // updateOne avoids triggering the password-hash pre-save hook.
  await User.updateOne({ _id: user._id }, { $set: { role } });

  res.json({ _id: user._id, name: user.name, email: user.email, role });
});
