import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token =req.cookies.token; 

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided'});
    }

    try {
        const secret = process.env.JWT_SECRET || 'default_secret';
        const decoded = jwt.verify(token, secret) as JwtPayload;
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' })
    }
}