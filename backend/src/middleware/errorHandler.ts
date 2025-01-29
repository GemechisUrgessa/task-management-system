import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors';


export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log error stack in development
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    if (err instanceof HttpError) {
        return res.status((err as HttpError).statusCode).json({
            error: err.message
        });
    }

    // Handle other specific errors
    if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Invalid data format'
        });
    }

    // Generic server error
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};