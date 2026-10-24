import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";

const router = Router();

router.post('/register', (req, res, next) => AuthController.registerPlayer(req, res, next));

export default router;