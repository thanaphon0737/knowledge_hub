import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import mainRouter from './routes';

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mainRouter);
export default app;