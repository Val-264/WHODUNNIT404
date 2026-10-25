import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get("/", verifyToken, (req, res, next) => ProfileController.getProfile(req, res, next));

export default router;