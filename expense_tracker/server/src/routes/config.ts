import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    user1Name: process.env.USER1_NAME || 'User 1',
    user2Name: process.env.USER2_NAME || 'User 2',
  });
});

export default router;
