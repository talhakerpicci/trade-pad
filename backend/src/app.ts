import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { tradeRoutes } from './routes/trade-routes';
import { userRoutes } from './routes/user-routes';
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './errors/not-found-error';
import { portfolioRouter } from './routes/portfolio-routes';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(json());

app.use('/api/trades', tradeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/portfolio', portfolioRouter);

app.all('*', (req, res, next) => {
    next(new NotFoundError());
});

app.use(errorHandler);

export { app };
