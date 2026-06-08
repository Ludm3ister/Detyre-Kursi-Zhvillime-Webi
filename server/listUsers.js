// One-off script: list all users.
// Usage: node listUsers.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import User from "./models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

try {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find().sort({ createdAt: 1 }).lean();

  if (users.length === 0) {
    console.log("No users found in the database.");
  } else {
    console.log(`Total users: ${users.length}\n`);
    users.forEach((u, i) => {
      console.log(
        `${i + 1}. ${u.name} | ${u.email} | role: ${u.role} | created: ${
          u.createdAt ? new Date(u.createdAt).toISOString() : "n/a"
        }`
      );
    });
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await mongoose.disconnect();
}
