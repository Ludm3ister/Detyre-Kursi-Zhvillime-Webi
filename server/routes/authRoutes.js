import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  deleteUser,
  updateUserRole,
} from "../controllers/authController.js";
import { protect, admin, superAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again in a few minutes." },
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

router.get("/me", protect, getMe);

router.get("/users", protect, admin, getUsers);
router.delete("/users/:id", protect, admin, deleteUser);
router.patch("/users/:id/role", protect, superAdmin, updateUserRole);

export default router;
