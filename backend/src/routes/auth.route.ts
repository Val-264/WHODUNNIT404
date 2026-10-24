import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post('/register', (req, res, next) => AuthController.registerPlayer(req, res, next));
router.post('/login', (req, res, next) => AuthController.login(req, res, next));
router.get('/me', verifyToken, (req, res, next) => AuthController.getProfile(req, res, next));

export default router;