import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    await Task.deleteMany();
    await User.deleteMany();
    console.log("Cleared old users and tasks");

    const admin = await User.create({
      name: "Admin User",
      email: "admin@taskflow.com",
      password: "admin123",
      role: "admin",
    });

    const member = await User.create({
      name: "Demo User",
      email: "user@taskflow.com",
      password: "user123",
      role: "user",
    });

    console.log("Created admin@taskflow.com / admin123");
    console.log("Created user@taskflow.com  / user123");

    await Task.insertMany([
      {
        title: "Design the landing page",
        description: "Wireframe and pick a colour palette.",
        status: "in-progress",
        priority: "high",
        owner: member._id,
      },
      {
        title: "Set up MongoDB Atlas",
        description: "Create a free cluster and add the connection string.",
        status: "done",
        priority: "medium",
        owner: member._id,
      },
      {
        title: "Write project documentation",
        description: "Explain how to run the project.",
        status: "todo",
        priority: "low",
        owner: member._id,
      },
      {
        title: "Review pull requests",
        status: "todo",
        priority: "medium",
        owner: admin._id,
      },
    ]);

    console.log("Seed complete");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

run();
