import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Subtask } from '../entities/Subtask';
import { Task } from '../entities/Task';
import { BadRequestError, NotFoundError } from '../utils/errors';


// Common validation constants
const ALLOWED_STATUSES = ['pending', 'completed', 'in progress' ];

export const createSubtask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { taskId } = req.params;
        const { title, status } = req.body;

        // Validate input
        const taskIdNum = Number(taskId);
        if (isNaN(taskIdNum)) throw new BadRequestError('Invalid task ID');
        if (!title?.trim()) throw new BadRequestError('Title is required');
        if (status && !ALLOWED_STATUSES.includes(status)) {
            throw new BadRequestError(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
        }

        // Find parent task
        const task = await AppDataSource.getRepository(Task).findOneBy({ id: taskIdNum });
        if (!task) throw new NotFoundError('Parent task not found');

        // Create and save subtask
        const subtaskRepository = AppDataSource.getRepository(Subtask);
        const newSubtask = subtaskRepository.create({
            title: title.trim(),
            status: status || 'pending',
            task
        });
        
        await subtaskRepository.save(newSubtask);
        res.status(201).json(newSubtask);
    } catch (error) {
        next(error);
    }
};

export const getSubtasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { taskId } = req.params;
        const taskIdNum = Number(taskId);
        if (isNaN(taskIdNum)) throw new BadRequestError('Invalid task ID');

        const subtasks = await AppDataSource.getRepository(Subtask).find({
            where: { task: { id: taskIdNum } },
            order: { created_at: 'DESC' }
        });

        res.status(200).json(subtasks);
    } catch (error) {
        next(error);
    }
};

export const updateSubtask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, status, due_date } = req.body;

        // Validate input
        const subtaskId = Number(id);
        if (isNaN(subtaskId)) throw new BadRequestError('Invalid subtask ID');
        if (status && !ALLOWED_STATUSES.includes(status)) {
            throw new BadRequestError(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
        }

        // Find and update subtask
        const subtaskRepository = AppDataSource.getRepository(Subtask);
        const subtask = await subtaskRepository.findOneBy({ id: subtaskId });
        if (!subtask) throw new NotFoundError('Subtask not found');

        subtaskRepository.merge(subtask, {
            ...(title && { title: title.trim() }),
            ...(status && { status }),
            ...(due_date && { due_date })
        });

        const updatedSubtask = await subtaskRepository.save(subtask);
        res.status(200).json(updatedSubtask);
    } catch (error) {
        next(error);
    }
};

export const deleteSubtask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const subtaskId = Number(id);
        if (isNaN(subtaskId)) throw new BadRequestError('Invalid subtask ID');

        const result = await AppDataSource.getRepository(Subtask).delete(subtaskId);
        if (result.affected === 0) throw new NotFoundError('Subtask not found');

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const updateSubtaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate input
        const subtaskId = Number(id);
        if (isNaN(subtaskId)) throw new BadRequestError('Invalid subtask ID');
        if (!ALLOWED_STATUSES.includes(status)) {
            throw new BadRequestError(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
        }

        // Find and update subtask
        const subtaskRepository = AppDataSource.getRepository(Subtask);
        const subtask = await subtaskRepository.findOneBy({ id: subtaskId });
        if (!subtask) throw new NotFoundError('Subtask not found');

        subtask.status = status;
        const updatedSubtask = await subtaskRepository.save(subtask);
        res.status(200).json(updatedSubtask);
    } catch (error) {
        next(error);
    }
};

export const updateSubtaskPriority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { priority } = req.body;

        // Validate input
        const subtaskId = Number(id);
        if (isNaN(subtaskId)) throw new BadRequestError('Invalid subtask ID');
        if (!['low', 'medium', 'high'].includes(priority)) {
            throw new BadRequestError('Priority must be one of: low, medium, high');
        }

        // Find and update subtask
        const subtaskRepository = AppDataSource.getRepository(Subtask);
        const subtask = await subtaskRepository.findOneBy({ id: subtaskId });
        if (!subtask) throw new NotFoundError('Subtask not found');

        subtask.priority = priority;
        const updatedSubtask = await subtaskRepository.save(subtask);
        res.status(200).json(updatedSubtask);
    } catch (error) {
        next(error);
    }
}