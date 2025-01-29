import { Request, Response, NextFunction } from 'express';

// Define allowed file types and maximum file size
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFile = (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    if (!file) {
        return next(new Error('No file uploaded')); // Pass error to error handling middleware
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return next(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return next(new Error(`File size exceeds the limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`));
    }

    next(); // Proceed to the next middleware
};

