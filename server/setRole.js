// One-off script: set a user's role by email.
// Usage: node setRole.js <email> [role]   (role defaults to "admin")
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import User from "./models/User.js";
import { ADMIN_ROLES } from "./utils/roles.js";

// Load .env sitting next to this script, regardless of current working dir.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const email = process.argv[2];
const role = process.argv[3] || "admin";
const ALLOWED = ["user", ...ADMIN_ROLES];

if (!email) {
  console.error("Usage: node setRole.js <email> [role]");
  process.exit(1);
}
if (!ALLOWED.includes(role)) {
  console.error(`Invalid role "${role}". Allowed: ${ALLOWED.join(", ")}`);
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  // updateOne avoids triggering the password-hash pre-save hook.
  const result = await User.updateOne(
    { email: email.toLowerCase() },
    { $set: { role } }
  );

  if (result.matchedCount === 0) {
    console.error(`No user found with email: ${email}`);
  } else if (result.modifiedCount === 0) {
    console.log(`${email} already had role "${role}". No change.`);
  } else {
    console.log(`Success: ${email} is now "${role}".`);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
} finally {
  await mongoose.disconnect();
}
