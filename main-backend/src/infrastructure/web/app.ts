import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import mainRouter from './routes';
import cors from 'cors';
const app: Application = express();

const corsOption = {

    // origin: 'http://localhost:3001',
    origin: ['http://localhost:3001','https://b2hwc5zg-3001.asse.devtunnels.ms'],
    credentials: true,
}

app.use(cors(corsOption));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(mainRouter);


export default app;