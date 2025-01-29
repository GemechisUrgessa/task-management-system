/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  createTaskWithFiles,
  updateTaskWithFiles,
  deleteFile,
} from "../services/taskService";
import { useTaskStore } from "../store/taskStore";
import { Task } from "../types/task";
import { FileType } from "../types/file";
import { FaTrash } from "react-icons/fa";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: Task | null;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  editingTask,
}) => {
  const { addTask, updateTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"pending" | "in progress" | "completed">(
    "pending"
  );
  const [dueDate, setDueDate] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ [key: string]: string | null }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setPriority(editingTask.priority || "medium");
      setStatus(editingTask.status || "pending");
      setDueDate(
        editingTask.due_date
          ? new Date(editingTask.due_date).toISOString().split("T")[0]
          : ""
      );
      setExistingFiles(editingTask.files || []);
    }
  }, [editingTask]);

  // ✅ Handle File Upload (New files)
  const onDrop = (acceptedFiles: File[]) =>
    setNewFiles((prev) => [...prev, ...acceptedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
    },
  });

  // ✅ Remove New File Before Upload
  const handleRemoveNewFile = (fileToRemove: File) =>
    setNewFiles((prev) => prev.filter((file) => file !== fileToRemove));

  // ✅ Remove Existing File (Server-side deletion)
  const handleRemoveExistingFile = async (fileId: number) => {
    if (!window.confirm("Are you sure you want to remove this file?")) return;
    setLoading(true);

    try {
      await deleteFile(fileId);
      setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      console.error("Error deleting file:", err);
      setError({ general: "Failed to delete file. Try again." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Validate Form Before Submission
  const validateForm = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!priority) newErrors.priority = "Priority is required.";
    if (!status) newErrors.status = "Status is required.";
    if (!dueDate) newErrors.dueDate = "Due date is required.";
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Create / Update Task
  const handleSubmit = async () => {
    setError({});
    setSuccessMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    if (description) formData.append("description", description);
    formData.append("priority", priority);
    formData.append("status", status);
    formData.append("dueDate", dueDate);
    newFiles.forEach((file) => formData.append("files", file));

    try {
      if (editingTask) {
        const updatedTask = await updateTaskWithFiles(editingTask.id, formData);
        updateTask({
          ...updatedTask.task,
          files: [...existingFiles, ...updatedTask.files],
        } as Task);
        setSuccessMessage("Task updated successfully!");
      } else {
        const createdTask = await createTaskWithFiles(formData);
        addTask({ ...createdTask.task, files: createdTask.files } as Task);
        setSuccessMessage("Task created successfully!");
      }

      // ✅ Reset Fields
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("pending");
      setDueDate("");
      setNewFiles([]);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error creating/updating task:", error);
      setError({
        general:
          error.response?.data?.error ||
          "Task creation/updating failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-20 z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-md max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editingTask ? "Edit Task" : "Create New Task"}
        </h2>

        {successMessage && (
          <p className="text-green-600 text-sm mb-2">{successMessage}</p>
        )}
        {error.general && (
          <p className="text-red-600 text-sm mb-2">{error.general}</p>
        )}

        {/* Title Input */}
        <label className="block mb-1 font-semibold">Title</label>
        <input
          className={`border w-full p-2 rounded-md ${
            error.title ? "border-red-500" : "border-gray-300"
          }`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        {error.title && (
          <p className="text-red-500 text-sm mt-1">{error.title}</p>
        )}

        {/* Description */}
        <label className="block mt-4 mb-1 font-semibold">Description</label>
        <textarea
          className="border w-full p-2 mb-4 rounded-md"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />

        {/* Priority */}
        <label className="block mb-1 font-semibold">Priority</label>
        <select
          className="border w-full p-2 rounded-md"
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "low" | "medium" | "high")
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Status */}
        <label className="block mt-4 mb-1 font-semibold">Status</label>
        <select
          className="border w-full p-2 rounded-md"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "pending" | "in progress" | "completed")
          }
        >
          <option value="pending">To Do</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Due Date */}
        <label className="block mt-4 mb-1 font-semibold">Due Date</label>
        <input
          type="date"
          className="border w-full p-2 rounded-md"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* File Upload Section */}
        <h3 className="text-md font-semibold mt-4 mb-2">Attachments</h3>

        {/* Existing Files */}
        {existingFiles.length > 0 && (
          <ul className="mb-4 border border-gray-200 rounded-md p-2 bg-gray-50">
            {existingFiles.map((file) => (
              <li key={file.id} className="flex justify-between items-center">
                <a
                  href={file.file_url}
                  className="text-blue-600 hover:underline"
                  download
                >
                  {file.file_url.split("/").pop()?.slice(0, 20) ?? ""}
                  {"..."}
                </a>
                <button
                  className="text-red-600 ml-2"
                  onClick={() => handleRemoveExistingFile(file.id)}
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* New Files Upload UI */}
        <div
          {...getRootProps()}
          className={`p-4 border-2 border-dashed rounded-md cursor-pointer mb-4 ${
            isDragActive ? "border-green-400" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            Drag & drop new files here, or click to select
          </p>
        </div>

        {/* List of Newly Added Files */}
        {newFiles.length > 0 && (
          <ul className="mb-4">
            {newFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                {file.name}
                <button
                  className="text-red-600 ml-2"
                  onClick={() => handleRemoveNewFile(file)}
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => {
              onClose();
              setTitle("");
              setDescription("");
              setPriority("medium");
              setStatus("pending");
              setDueDate("");
              setNewFiles([]);
              setExistingFiles([]);
              setError({});
              setSuccessMessage(null);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md mt-4"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
          >
            {loading
              ? "Processing..."
              : editingTask
              ? "Update Task"
              : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
