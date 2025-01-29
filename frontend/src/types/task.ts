import { Subtask } from "./subTask";
import { FileType } from "./file";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  files: FileType[];
  subtasks: Subtask[];
}