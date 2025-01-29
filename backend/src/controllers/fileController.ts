import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { File } from '../entities/File';
import { Task } from '../entities/Task';
import cloudinary from '../utils/cloudinary';
import { BadRequestError, NotFoundError } from '../utils/errors';


// Upload a file for a task
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.params;
        const file = req.file;

        if (!file) {
            throw new BadRequestError('No file uploaded');
        }

        // Validate task existence
        const taskRepository = AppDataSource.getRepository(Task);
        const task = await taskRepository.findOneBy({ id: parseInt(taskId) });
        if (!task) {
            throw new NotFoundError('Task not found');
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'auto',
        });

        // Save file metadata to the database
        const fileRepository = AppDataSource.getRepository(File);
        const newFile = fileRepository.create({
            file_url: result.secure_url,
            file_type: file.mimetype,
            public_id: result.public_id, // Store Cloudinary public ID for deletion
            task,
        });

        await fileRepository.save(newFile);
        res.status(201).json(newFile);
    } catch (error) {
        next(error);
    }
};

// Fetch all files for a task
export const getFilesForTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.params;

        // Validate task ID
        const taskIdNum = parseInt(taskId);
        if (isNaN(taskIdNum)) {
            throw new BadRequestError('Invalid task ID');
        }

        // Fetch files for the task
        const fileRepository = AppDataSource.getRepository(File);
        const files = await fileRepository.find({
            where: { task: { id: taskIdNum } },
            order: { uploaded_at: 'DESC' },
        });

        res.status(200).json(files);
    } catch (error) {
        next(error);
    }
};

// Delete a file
export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Validate file ID
        const fileId = parseInt(id);
        if (isNaN(fileId)) {
            throw new BadRequestError('Invalid file ID');
        }

        // Find the file in the database
        const fileRepository = AppDataSource.getRepository(File);
        const file = await fileRepository.findOneBy({ id: fileId });
        if (!file) {
            throw new NotFoundError('File not found');
        }

        // Delete the file from Cloudinary
        if (file.public_id) {
            await cloudinary.uploader.destroy(file.public_id);
        }

        // Delete the file from the database
        await fileRepository.delete(fileId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};