import express from 'express';
import { body } from 'express-validator';
import {
    signup,
    signin,
    getCurrentUser,
    updateInitialAmount
} from '../controllers/user-controller';
import { validateRequest } from '../middleware/validate-request';
import { requireAuth } from '../middleware/require-auth';

const router = express.Router();

router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 6, max: 20 })
            .withMessage('Password must be between 6 and 20 characters'),
        body('initialAmount')
            .isFloat({ gt: 0 })
            .withMessage('Initial amount must be greater than 0'),
    ],
    validateRequest,
    signup
);

router.post(
    '/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password'),
    ],
    validateRequest,
    signin
);

router.get('/current', requireAuth, getCurrentUser);

router.patch(
    '/initial-amount',
    requireAuth,
    [
        body('amount')
            .isFloat({ gt: 0 })
            .withMessage('Amount must be greater than 0'),
    ],
    validateRequest,
    updateInitialAmount
);

export { router as userRoutes };
