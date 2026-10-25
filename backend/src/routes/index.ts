import { Router } from "express";
import authRoutes from "./auth.route";
import profileRoutes from "./profile.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

export default router;
// POST /api/auth/register