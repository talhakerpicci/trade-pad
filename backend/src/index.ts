import { app } from './app';
import { prisma } from './lib/prisma';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    try {
        await prisma.$connect();
        console.log('Connected to database');
    } catch (err) {
        console.error(err);
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

start();
