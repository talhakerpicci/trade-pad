import express from 'express';
import { requireAuth } from '../middleware/require-auth';
import { validateRequest } from '../middleware/validate-request';
import { body } from 'express-validator';
import { resetPortfolio, getPortfolioHistory } from '../controllers/portfolio-controller';

const router = express.Router();

router.post(
    '/reset',
    requireAuth,
    [
        body('newAmount')
            .isFloat({ gt: 0 })
            .withMessage('New amount must be greater than 0'),
    ],
    validateRequest,
    resetPortfolio
);

router.get('/history', requireAuth, getPortfolioHistory);

export { router as portfolioRouter };
