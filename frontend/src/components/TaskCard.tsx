import React, { useState } from "react";
import { Task } from "../types/task";
import { Subtask } from "../types/subTask";
import {
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
} from "../services/taskService";
import {
  updateSubtaskStatus,
  updateSubtaskPriority,
  deleteSubtask,
} from "../services/taskService";
import { useTaskStore } from "../store/taskStore";
import { FaTrash, FaDownload, FaPlus, FaEdit } from "react-icons/fa";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onAddSubtask: (task: Task) => void;
  onSubTaskEdit: (subtask: Subtask, task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onAddSubtask,
  onSubTaskEdit,
}) => {
  const { removeTask, updateTask } = useTaskStore();
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Handle Task Status Change
  const handleStatusChange = async (
    newStatus: "pending" | "in progress" | "completed"
  ) => {
    setLoading(true);
    try {
      await updateTaskStatus(task.id, newStatus);
      setStatus(newStatus);
      updateTask({ ...task, status: newStatus });
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Failed to update status. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Task Priority Change
  const handlePriorityChange = async (
    newPriority: "low" | "medium" | "high"
  ) => {
    setLoading(true);
    try {
      await updateTaskPriority(task.id, newPriority);
      setPriority(newPriority);
      updateTask({ ...task, priority: newPriority });
    } catch (err) {
      console.error("Error updating task priority:", err);
      setError("Failed to update priority. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Delete Task
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    try {
      await deleteTask(task.id);
      removeTask(task.id);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Subtask Status Change
  const handleSubtaskStatusChange = async (
    subtask: Subtask,
    newStatus: "pending" | "in progress" | "completed"
  ) => {
    try {
      await updateSubtaskStatus(subtask.id, newStatus);
      updateTask({
        ...task,
        subtasks: task.subtasks.map((st) =>
          st.id === subtask.id ? { ...st, status: newStatus } : st
        ),
      });
    } catch (err) {
      console.error("Error updating subtask status:", err);
      setError("Failed to update subtask status.");
    }
  };

  const handleDownload = async (url: string, id: string): Promise<void> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // ✅ Use `id` directly as the filename (includes correct extension)
      const filename = decodeURIComponent(id); // Decode in case of URL encoding

      // ✅ Create download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename; // Correct filename from `id`
      document.body.appendChild(link); // Append to body (for compatibility)
      link.click();
      document.body.removeChild(link); // Remove from DOM after clicking
      URL.revokeObjectURL(link.href); // Free memory
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // ✅ Handle Subtask Priority Change
  const handleSubtaskPriorityChange = async (
    subtask: Subtask,
    newPriority: "low" | "medium" | "high"
  ) => {
    try {
      await updateSubtaskPriority(subtask.id, newPriority);
      updateTask({
        ...task,
        subtasks: task.subtasks.map((st) =>
          st.id === subtask.id ? { ...st, priority: newPriority } : st
        ),
      });
    } catch (err) {
      console.error("Error updating subtask priority:", err);
      setError("Failed to update subtask priority.");
    }
  };

  // ✅ Handle Delete Subtask
  const handleDeleteSubtask = async (subtaskId: number) => {
    if (!window.confirm("Are you sure you want to delete this subtask?"))
      return;
    try {
      await deleteSubtask(subtaskId);
      updateTask({
        ...task,
        subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
      });
    } catch (err) {
      console.error("Error deleting subtask:", err);
      setError("Failed to delete subtask.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-5 mb-4 border border-gray-200 transition hover:shadow-lg">
      {/* Title & Actions */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">{task.title}</h2>
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onEdit(task)}
          >
            <FaEdit />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "..." : <FaTrash />}
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600">{task.description}</p>
      {/* task Due date */}
      <div className="mt-2">
        <label className="text-sm font-semibold">Due Date:</label>
        <span className="ml-2 text-gray-600">
          {new Date(task.due_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Priority & Status */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <label className="text-sm font-semibold">Priority:</label>
          <select
            className="ml-2 p-1 border rounded-md bg-gray-50"
            value={priority}
            onChange={(e) =>
              handlePriorityChange(e.target.value as "low" | "medium" | "high")
            }
            disabled={loading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Status:</label>
          <select
            className="ml-2 p-1 border rounded-md bg-gray-50"
            value={status}
            onChange={(e) =>
              handleStatusChange(
                e.target.value as "pending" | "in progress" | "completed"
              )
            }
            disabled={loading}
          >
            <option value="pending">To Do</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Done</option>
          </select>
        </div>
      </div>

      {/* Files (Preview & Download) */}
      {task.files && task.files.length > 0 && (
        <div className="mt-3">
          <h3 className="text-sm font-semibold mb-1">Files:</h3>
          <ul className="text-sm text-gray-700 pl-4">
            {task.files.map((file) => (
              <li key={file.id} className="flex justify-between items-center">
                <a
                  href={file.file_url}
                  target={
                    file.file_type.startsWith("image/") ||
                    file.file_type === "application/pdf"
                      ? "_blank"
                      : "_self"
                  }
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {file.public_id.split("/").pop()?.slice(0, 20) ?? ""}
                </a>
                <a
                  onClick={() => handleDownload(file.file_url, file.public_id)}
                  className="text-green-600 hover:text-green-800 ml-2 cursor-pointer"
                >
                  <FaDownload />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Subtasks */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Subtasks:</h3>
          <button
            className="text-green-600 hover:text-green-800 flex items-center"
            onClick={() => onAddSubtask(task)}
          >
            <FaPlus className="mr-1" /> Add Subtask
          </button>
        </div>
        <div className="space-y-2">
          {task?.subtasks?.map((subtask) => (
            <div
              key={subtask.id}
              className="flex flex-wrap justify-between items-center text-sm p-2 border rounded-md bg-gray-50"
            >
              <span className="w-full sm:w-auto">{subtask.title}</span>
              <div className="flex flex-wrap items-center space-x-2 mt-2 sm:mt-0">
                <span className="text-gray-600">
                  {new Date(task.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <select
                  className="p-1 border rounded-md bg-white"
                  value={subtask.priority}
                  onChange={(e) =>
                    handleSubtaskPriorityChange(
                      subtask,
                      e.target.value as "low" | "medium" | "high"
                    )
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  className="p-1 border rounded-md bg-white"
                  value={subtask.status}
                  onChange={(e) =>
                    handleSubtaskStatusChange(
                      subtask,
                      e.target.value as "pending" | "in progress" | "completed"
                    )
                  }
                >
                  <option value="pending">To Do</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => onSubTaskEdit(subtask, task)}>
                  <FaEdit className="text-blue-600 hover:text-blue-800" />
                </button>
                <button onClick={() => handleDeleteSubtask(subtask.id)}>
                  <FaTrash className="text-red-600 hover:text-red-800" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default TaskCard;
