/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import { Task } from "../types/task";

// ✅ Fetch all tasks with filters
export const fetchTasks = async (filters?: { status?: string; priority?: string; startDate?: string; endDate?: string; search?: string; }): Promise<Task[]> => {
  const response = await api.get("/tasks", { params: filters });
  return response.data;
};

// ✅ Create a task with files (FormData)
export const createTaskWithFiles = async (formData: FormData) => {
  try {
    const response = await api.post("/tasks", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating task:", error.response?.data || error.message);
    throw error.response?.data || { error: "Task creation failed. Please try again." };
  }
};

// ✅ Update a task with files (FormData)
export const updateTaskWithFiles = async (taskId: number, formData: FormData) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating task:", error.response?.data || error.message);
    throw error.response?.data || { error: "Task update failed. Please try again." };
  }
};

// ✅ Update task details (excluding status/priority)
export const updateTask = async (task: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${task.id}`, task);
  return response.data;
};

// ✅ Update only task status
export const updateTaskStatus = async (taskId: number, status: "pending" | "in progress" | "completed") => {
  const response = await api.put(`/tasks/${taskId}/status`, { status });
  return response.data;
};

// ✅ Update only task priority
export const updateTaskPriority = async (taskId: number, priority: "low" | "medium" | "high") => {
  const response = await api.put(`/tasks/${taskId}/priority`, { priority });
  return response.data;
};

// ✅ Delete a task
export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

// ✅ Create a subtask
export const createSubtask = async (taskId: number, title: string, due_date: string
) => {
  const response = await api.post(`/tasks/${taskId}/subtasks`, { title , due_date });
  return response.data;
};

// ✅ Fetch all subtasks for a task
export const fetchSubtasks = async (taskId: number) => {
  const response = await api.get(`/tasks/${taskId}/subtasks`);
  return response.data;
};

// ✅ Update a subtask
export const updateSubtask = async (subtaskId: number, updatedFields: any) => {
  const response = await api.put(`/subtasks/${subtaskId}`, updatedFields);
  return response.data;
};

// ✅ Update subtask status
export const updateSubtaskStatus = async (subtaskId: number, status: "pending" | "in progress" | "completed") => {
    console.log("inner",subtaskId, status);
  const response = await api.put(`/subtasks/${subtaskId}/status`, { status });
  return response.data;
};

// ✅ Update subtask priority
export const updateSubtaskPriority = async (subtaskId: number, priority: "low" | "medium" | "high") => {
  const response = await api.put(`/subtasks/${subtaskId}/priority`, { priority });
  return response.data;
};

// ✅ Delete a subtask
export const deleteSubtask = async (subtaskId: number): Promise<void> => {
  await api.delete(`/subtasks/${subtaskId}`);
};

// ✅ Upload a file for a task
export const uploadFileForTask = async (taskId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/tasks/${taskId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ✅ Get all files for a task
export const fetchFilesForTask = async (taskId: number) => {
  const response = await api.get(`/tasks/${taskId}/files`);
  return response.data;
};

// ✅ Delete a file
export const deleteFile = async (fileId: number): Promise<void> => {
  await api.delete(`/files/${fileId}`);
};