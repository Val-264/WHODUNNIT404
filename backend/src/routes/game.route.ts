import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/cases', verifyToken, (req, res, next) => GameController.getCases(req,res,next));

router.post('/start', verifyToken, (req, res, next) => GameController.startGame(req, res, next)); // start game route
router.post('/restart', verifyToken, (req, res, next) => GameController.startGame(req, res, next));
router.get('/:id', verifyToken, (req, res, next) => GameController.getGameById(req, res, next));

export default router;