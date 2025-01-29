import React, { useState, useEffect } from "react";
import { createSubtask, updateSubtask } from "../services/taskService"; // API call
import { useTaskStore } from "../store/taskStore";
import { Task } from "../types/task";
import { Subtask } from "../types/subTask";

interface CreateSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentTask: Task | null;
  editingSubtask?: Subtask | null;
}

const CreateSubtaskModal: React.FC<CreateSubtaskModalProps> = ({
  isOpen,
  onClose,
  parentTask,
  editingSubtask,
}) => {
  const { updateTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [due_date, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingSubtask) {
      setTitle(editingSubtask.title);
      setStatus(editingSubtask.status);
      setDueDate(
        editingSubtask.due_date
          ? new Date(editingSubtask.due_date).toISOString().split("T")[0]
          : ""
      );
    }
  }, [editingSubtask]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Subtask title is required.");
      return;
    }

    setLoading(true);

    try {
      if (parentTask) {
        if (editingSubtask) {
          const updatedSubtask: Subtask = await updateSubtask(
            editingSubtask.id,
            {
              title,
              status,
              due_date,
            }
          );
          const updatedSubtasks: Subtask[] = parentTask.subtasks.map((sub) =>
            sub.id === editingSubtask.id ? updatedSubtask : sub
          );

          updateTask({
            ...parentTask,
            subtasks: updatedSubtasks,
          });
        } else {
          const newSubtask: Subtask = await createSubtask(
            parentTask.id,
            title,
            due_date
          );
          updateTask({
            ...parentTask,
            subtasks: [...(parentTask.subtasks || []), newSubtask],
          });
        }
      }
      setTitle("");
      setDueDate("");
      setStatus("pending");
      onClose();
    } catch (err) {
      console.error("Error handling subtask:", err);
      setError("Subtask action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-20 z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {editingSubtask ? "Edit Subtask" : "Create Subtask"}
        </h2>

        <label className="block mb-2 font-medium">Subtask Title</label>
        <input
          className="border w-full p-2 mb-4 rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Subtask Title"
        />

        <label className="block mb-2 font-medium">Due Date</label>
        <input
          type="date"
          className="border w-full p-2 mb-4 rounded-md"
          value={due_date}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <label className="block mb-2 font-medium">Status</label>
        <select
          className="border w-full p-2 mb-4 rounded-md"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-end space-x-2">
          <button
            className="bg-red-500 px-4 py-2 rounded-md"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : editingSubtask ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSubtaskModal;
