import express, { Application } from 'express';
import mainRouter from './routes';

const app: Application = express();
app.use(express.json());

app.use(mainRouter);
export default app;