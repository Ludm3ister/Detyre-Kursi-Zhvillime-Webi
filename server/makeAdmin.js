// One-off script: promote a user to admin by email.
// Usage: node makeAdmin.js user@example.com
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import User from "./models/User.js";

// Load .env sitting next to this script, regardless of current working dir.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node makeAdmin.js <email>");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  // updateOne avoids triggering the password-hash pre-save hook.
  const result = await User.updateOne(
    { email: email.toLowerCase() },
    { $set: { role: "admin" } }
  );

  if (result.matchedCount === 0) {
    console.error(`No user found with email: ${email}`);
  } else if (result.modifiedCount === 0) {
    console.log(`${email} was already an admin. No change.`);
  } else {
    console.log(`Success: ${email} is now an admin.`);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await mongoose.disconnect();
}
