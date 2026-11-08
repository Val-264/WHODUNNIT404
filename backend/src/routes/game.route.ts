import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/cases', verifyToken, (req, res, next) => GameController.getCases(req,res,next));

export default router;