import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, initialAmount } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({ message: 'Email in use' });
            return;
        }

        const hashedPassword = await Password.toHash(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                initialAmount: Number(initialAmount),
            }
        });

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_KEY!
        );

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                initialAmount: user.initialAmount
            },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const passwordsMatch = await Password.compare(
            user.password,
            password
        );

        if (!passwordsMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_KEY!
        );

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                initialAmount: user.initialAmount
            },
            token
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            id: true,
            email: true,
            initialAmount: true
        }
    });

    res.json(user);
};

export const updateInitialAmount = async (req: Request, res: Response): Promise<void> => {
    const { amount } = req.body;

    const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { initialAmount: amount },
        select: {
            id: true,
            email: true,
            initialAmount: true
        }
    });

    res.json(user);
};
