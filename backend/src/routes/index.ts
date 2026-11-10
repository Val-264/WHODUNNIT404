import { Router } from "express";
import authRoutes from "./auth.route";
import profileRoutes from "./profile.route";
import gameRoutes from "./game.route"

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/games", gameRoutes)

export default router;
// POST /api/auth/register