import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";
import { isAdmin } from "../utils/roles.js";

const canAccess = (task, user) =>
  isAdmin(user) || task.owner.equals(user._id);

export const getTasks = asyncHandler(async (req, res) => {
  const filter = {};

  if (!isAdmin(req.user)) {
    filter.owner = req.user._id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: "i" };
  }

  const tasks = await Task.find(filter)
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  res.json(tasks);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate("owner", "name email");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (!canAccess(task, req.user)) {
    res.status(403);
    throw new Error("Not authorized to view this task");
  }

  res.json(task);
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Task title is required");
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
    owner: req.user._id,
  });

  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (!canAccess(task, req.user)) {
    res.status(403);
    throw new Error("Not authorized to update this task");
  }

  const { title, description, status, priority, dueDate } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;

  const updated = await task.save();
  res.json(updated);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (!canAccess(task, req.user)) {
    res.status(403);
    throw new Error("Not authorized to delete this task");
  }

  await task.deleteOne();
  res.json({ message: "Task removed", id: req.params.id });
});
