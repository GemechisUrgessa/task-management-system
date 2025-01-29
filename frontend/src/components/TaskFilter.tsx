import React, { useState, useEffect } from "react";
import { useTaskStore } from "../store/taskStore";
import { fetchTasks } from "../services/taskService";

const TaskFilter: React.FC = () => {
  const { setTasks } = useTaskStore();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  // ✅ Fetch tasks whenever filters change
  useEffect(() => {
    const loadFilteredTasks = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (status) queryParams.append("status", status);
        if (priority) queryParams.append("priority", priority);
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);
        if (search.trim()) queryParams.append("search", search.trim());

        const tasks = await fetchTasks({
          status,
          priority,
          startDate,
          endDate,
          search: search.trim(),
        });
        setTasks(tasks);
      } catch (error) {
        console.error("Error fetching filtered tasks:", error);
      }
    };

    loadFilteredTasks();
  }, [status, priority, startDate, endDate, search, setTasks]);

  // ✅ Reset filters
  const resetFilters = () => {
    setStatus(undefined);
    setPriority(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setSearch("");
  };

  return (
    <div className="bg-white shadow-md rounded-md p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Status
        </label>
        <select
          className="border p-2 rounded-md w-full"
          value={status || ""}
          onChange={(e) => setStatus(e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="pending">To Do</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Done</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Priority
        </label>
        <select
          className="border p-2 rounded-md w-full"
          value={priority || ""}
          onChange={(e) => setPriority(e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Start Date Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          className="border p-2 rounded-md w-full"
          value={startDate || ""}
          onChange={(e) => setStartDate(e.target.value || undefined)}
        />
      </div>

      {/* End Date Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">
          End Date
        </label>
        <input
          type="date"
          className="border p-2 rounded-md w-full"
          value={endDate || ""}
          onChange={(e) => setEndDate(e.target.value || undefined)}
        />
      </div>

      {/* Search Bar */}
      <div className="flex-grow">
        <label className="block text-sm font-semibold text-gray-700">
          Search
        </label>
        <input
          type="text"
          className="border p-2 rounded-md w-full"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="bg-gray-200 px-3 py-2 rounded-md shadow-md hover:bg-gray-300"
      >
        Reset
      </button>
    </div>
  );
};

export default TaskFilter;
