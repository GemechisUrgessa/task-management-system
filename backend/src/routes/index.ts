import express from 'express';
import {
    // createTask,
    getTasks,
    updateTask,
    deleteTask,
    updateTaskStatus,
    createTaskWithFiles
} from '../controllers/taskController';
import {
    createSubtask,
    getSubtasks,
    updateSubtask,
    deleteSubtask,
    updateSubtaskStatus,
    updateSubtaskPriority
} from '../controllers/subtaskController';
import multer from 'multer';
import { validateFile } from '../middleware/fileValidation';
import { deleteFile, getFilesForTask, uploadFile } from '../controllers/fileController';
import { body , query} from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Task Routes
const validateTaskInput = [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['pending', 'in progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  validateRequest
];
router.post('/tasks',   upload.array("files", 5), validateTaskInput, createTaskWithFiles);
router.get('/tasks', [
  query('status').optional().isIn(['pending', 'in progress', 'completed']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('search').optional().trim(),
  validateRequest
], getTasks);
router.put('/tasks/:id', upload.array("files", 5), validateTaskInput, updateTask);
router.put('/tasks/:id/status', updateTaskStatus);
router.put('/tasks/:id/priority', [
    body('priority').notEmpty().isIn(['low', 'medium', 'high']),
    validateRequest
    ], updateTask);
router.delete('/tasks/:id', deleteTask);


// Subtask Routes
router.post('/tasks/:taskId/subtasks', createSubtask);
router.get('/tasks/:taskId/subtasks', getSubtasks);
router.put('/subtasks/:id', updateSubtask);
router.put('/subtasks/:id/status', [
  body('status').notEmpty().isIn(['pending', 'in progress', 'completed']),
  validateRequest
],
  updateSubtaskStatus);
router.delete('/subtasks/:id', deleteSubtask);
router.put('/subtasks/:id/priority', [
  body('priority').notEmpty().isIn(['low', 'medium', 'high']),
  validateRequest
], updateSubtaskPriority);

// file routes
// const upload = multer({ dest: 'uploads/' }); // Temporary storage

// router.post('/tasks/:taskId/files', upload.single('file'), validateFile, uploadFile);
router.get('/tasks/:taskId/files', getFilesForTask);
router.delete('/files/:id', deleteFile);


export default router;