import React, { useEffect, useState } from "react";
import { useTaskStore } from "../store/taskStore";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import CreateSubtaskModal from "./CreateSubtaskModal";
import { Task } from "../types/task";
import { fetchTasks } from "../services/taskService";
import { Subtask } from "../types/subTask";

const TaskBoard: React.FC = () => {
  const { tasks, setTasks } = useTaskStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [subTaskEditing, setSubTaskEditing] = useState<Subtask | null>(null);
  const [parentTask, setParentTask] = useState<Task | null>(null);

  // ✅ Fetch tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      const tasks = await fetchTasks();
      setTasks(tasks);
    };
    loadTasks();
  }, [setTasks]);

  const columns = {
    pending: "To Do",
    "in progress": "In Progress",
    completed: "Done",
  };

  // ✅ Open Task Modal (Create / Edit)
  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // ✅ Open Subtask Modal (Create)
  const handleAddSubtask = (task: Task) => {
    setParentTask(task);
    setSubTaskEditing(null);
    setIsSubtaskModalOpen(true);
  };

  // ✅ Open Subtask Modal (Edit)
  const handleEditSubTask = (subtask: Subtask, task: Task) => {
    setSubTaskEditing(subtask);
    setParentTask(task);
    setIsSubtaskModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {Object.entries(columns).map(([status, label]) => (
        <div
          key={status}
          className={`p-4 rounded-lg relative shadow-md border ${
            status === "pending"
              ? "border-yellow-400 bg-yellow-50"
              : status === "in progress"
              ? "border-blue-400 bg-blue-50"
              : "border-green-400 bg-green-50"
          }`}
        >
          {/* Column Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">{label}</h2>
            {status === "pending" && (
              <button
                onClick={handleAddTask}
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition transform hover:scale-105"
              >
                + New Task
              </button>
            )}
          </div>

          {/* Task Cards */}
          <div className="space-y-4">
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onSubTaskEdit={handleEditSubTask}
                  onAddSubtask={handleAddSubtask}
                />
              ))}
          </div>
        </div>
      ))}

      {/* Create/Edit Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        editingTask={editingTask}
      />

      {/* Create/Edit Subtask Modal */}
      <CreateSubtaskModal
        isOpen={isSubtaskModalOpen}
        onClose={() => setIsSubtaskModalOpen(false)}
        parentTask={parentTask}
        editingSubtask={subTaskEditing}
      />
    </div>
  );
};

export default TaskBoard;
