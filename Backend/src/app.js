import express from 'express';
import usersRouter from './routes/users.js';
import medicalRoutes from './routes/medicalRoutes.js';
import recordsRouter from './routes/medical/records.js';

const app = express();

app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/api/medical', medicalRoutes);
app.use('/api/medical/records', recordsRouter);

export default app;