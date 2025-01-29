import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Task } from '../entities/Task';
import { File } from '../entities/File';
import { BadRequestError, NotFoundError } from '../utils/errors';
import path from 'path';
import streamifier from 'streamifier';
// import { getRepository } from 'typeorm';
import cloudinary from '../utils/cloudinary';


export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, priority, startDate, endDate, search } = req.query;
        const taskRepository = AppDataSource.getRepository(Task);
        const query = taskRepository.createQueryBuilder('task')
            .leftJoinAndSelect('task.subtasks', 'subtasks')
            .leftJoinAndSelect('task.files', 'files');

        if (status) query.andWhere('task.status = :status', { status });
        if (priority) query.andWhere('task.priority = :priority', { priority });
        if (startDate && endDate) {
            query.andWhere('task.created_at BETWEEN :startDate AND :endDate', { 
                startDate: new Date(startDate as string), 
                endDate: new Date(endDate as string) 
            });
        }
        if (search) {
    query.andWhere(
        `to_tsvector('english', coalesce(task.title, '') || ' ' || coalesce(task.description, '')) 
         @@ plainto_tsquery('english', :search)`,
        { search: search as string }
    )
    .addOrderBy(
        `ts_rank_cd(
            to_tsvector('english', coalesce(task.title, '') || ' ' || coalesce(task.description, '')),
            plainto_tsquery('english', :search)
        )`,
        'DESC'
    );
}

        query.orderBy('task.created_at', 'DESC');
        
        const tasks = await query.getMany();
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

export const createTaskWithFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { title, description, priority } = req.body;
        const files = req.files as Express.Multer.File[] | undefined;

        console.log("Received Files:", files);

        // ✅ Validate title
        if (!title || !title.trim()) {
            throw new BadRequestError("Title is required");
        }

        // ✅ 1️⃣ Create task first
        const taskRepository = AppDataSource.getRepository(Task);
        const task = taskRepository.create({
            title: title.trim(),
            description: description?.trim() || null,
            status: "pending",
            priority: priority || "medium",
        });

        await queryRunner.manager.save(task);

        // ✅ 2️⃣ Handle file upload if files exist
        const fileRepository = AppDataSource.getRepository(File);
        const uploadedFiles: File[] = [];

        if (files && files.length > 0) {
            // Process files asynchronously
            await Promise.all(
                files.map(
                    (file) =>
                        new Promise<void>((resolve, reject) => {
                            try {
                                const timestamp = Math.round(Date.now() / 1000);
                                const fileExtension = path.extname(file.originalname).toLowerCase();
                                const isImage = [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExtension);
                                const resourceType = isImage ? "image" : "raw";

                                console.log(`Uploading file: ${file.originalname}`);
                                console.log("Cloudinary Config:", cloudinary.config());

                                

                                // ✅ Convert buffer to stream for upload
                                const uploadStream = cloudinary.uploader.upload_stream(
                                    {
                                        public_id: path.basename(file.originalname, fileExtension),
                                        timestamp,
                                        resource_type: resourceType,
                                    },
                                    async (error, result) => {
                                        if (error) {
                                            console.error("File upload failed:", error);
                                            reject(new Error("File upload failed. Task creation rolled back."));
                                            return;
                                        }

                                        // ✅ Save file metadata in DB
                                        const newFile = fileRepository.create({
                                            file_url: result?.secure_url,
                                            file_type: file.mimetype,
                                            public_id: result?.public_id,
                                            task,
                                        });

                                        uploadedFiles.push(newFile);
                                        resolve();
                                    }
                                );

                                // ✅ Stream the buffer data to Cloudinary
                                streamifier.createReadStream(file.buffer).pipe(uploadStream);
                            } catch (uploadError) {
                                console.error("File upload failed:", uploadError);
                                reject(uploadError);
                            }
                        })
                )
            );
        }

        // ✅ 3️⃣ Save files and commit transaction
        await queryRunner.manager.save(uploadedFiles);
        await queryRunner.commitTransaction();
        await queryRunner.release();

        res.status(201).json({ task, files: uploadedFiles });
        return;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release(); // ✅ Release only in error case
        next(error);
    }
};


export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;
        const { title, description, priority, status, due_date } = req.body;
        const files = req.files as Express.Multer.File[] | undefined;

        const taskId = Number(id);
        if (isNaN(taskId)) throw new BadRequestError("Invalid task ID");

        const taskRepository = AppDataSource.getRepository(Task);
        const fileRepository = AppDataSource.getRepository(File);

        // ✅ Check if task exists
        const task = await taskRepository.findOneBy({ id: taskId });
        if (!task) throw new NotFoundError("Task not found");

        // ✅ Merge updated fields
        taskRepository.merge(task, {
            ...(title && { title: title.trim() }),
            ...(description && { description: description.trim() }),
            ...(priority && { priority }),
            ...(status && { status }),
            ...(due_date && { due_date: new Date(due_date) }),
        });

        await queryRunner.manager.save(task);

        // ✅ Handle file upload (if new files are provided)
        const uploadedFiles: File[] = [];
        if (files && files.length > 0) {
            await Promise.all(
                files.map(
                    (file) =>
                        new Promise<void>((resolve, reject) => {
                            try {
                                const timestamp = Math.round(Date.now() / 1000);
                                const fileExtension = path.extname(file.originalname).toLowerCase();
                                const isImage = [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(fileExtension);
                                const resourceType = isImage ? "image" : "raw";

                                console.log(`Uploading file: ${file.originalname}`);

                                // ✅ Convert buffer to stream for upload
                                const uploadStream = cloudinary.uploader.upload_stream(
                                    {
                                        public_id: path.basename(file.originalname, fileExtension),
                                        timestamp,
                                        resource_type: resourceType,
                                    },
                                    async (error, result) => {
                                        if (error) {
                                            console.error("File upload failed:", error);
                                            reject(new Error("File upload failed. Task update rolled back."));
                                            return;
                                        }

                                        // ✅ Save file metadata in DB
                                        const newFile = fileRepository.create({
                                            file_url: result?.secure_url,
                                            file_type: file.mimetype,
                                            public_id: resourceType === "raw" ? `${result?.public_id}${fileExtension}` : result?.public_id,
                                            task,
                                        });

                                        uploadedFiles.push(newFile);
                                        resolve();
                                    }
                                );

                                // ✅ Stream the buffer data to Cloudinary
                                streamifier.createReadStream(file.buffer).pipe(uploadStream);
                            } catch (uploadError) {
                                console.error("File upload failed:", uploadError);
                                reject(uploadError);
                            }
                        })
                )
            );
        }

        // ✅ Save uploaded files
        if (uploadedFiles.length > 0) {
            await queryRunner.manager.save(uploadedFiles);
        }

        // ✅ Commit transaction
        await queryRunner.commitTransaction();
        await queryRunner.release();

        res.status(200).json({ message: "Task updated successfully", task, files: uploadedFiles });
        return;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const taskId = Number(id);
        if (isNaN(taskId)) throw new BadRequestError('Invalid task ID');

        const result = await AppDataSource.getRepository(Task).delete(taskId);
        if (result.affected === 0) throw new NotFoundError('Task not found');

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const taskId = Number(id);
        if (isNaN(taskId)) throw new BadRequestError('Invalid task ID');

        const taskRepository = AppDataSource.getRepository(Task);
        const task = await taskRepository.findOneBy({ id: taskId });

        if (!task) throw new NotFoundError('Task not found');

        task.status = status;
        const updatedTask = await taskRepository.save(task);
        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

export const updateTaskPriority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { priority } = req.body;

        const taskId = Number(id);
        if (isNaN(taskId)) throw new BadRequestError('Invalid task ID');

        const taskRepository = AppDataSource.getRepository(Task);
        const task = await taskRepository.findOneBy({ id: taskId });

        if (!task) throw new NotFoundError('Task not found');

        task.priority = priority;
        const updatedTask = await taskRepository.save(task);
        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};