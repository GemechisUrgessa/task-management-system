import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import router from './routes/index';
import { AppDataSource } from './data-source';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api', router);

AppDataSource.initialize()
    .then(() => {
app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
        app.get('/', (req, res) => {
            res.send('Task Management System API is running');
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

// Error Handling Middleware
interface CustomError extends Error {
    status?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
});
