// import React, { useEffect } from "react";
// import { fetchTasks } from "../services/taskService";
// import { useTaskStore } from "../store/taskStore";
// import TaskCard from "./TaskCard";

// const TaskList: React.FC = () => {
//   const { tasks, setTasks, deleteTask } = useTaskStore();

//   useEffect(() => {
//     const loadTasks = async () => {
//       const tasks = await fetchTasks();
//       setTasks(tasks);
//     };

//     loadTasks();
//   }, [setTasks]);

//   return (
//     <div>
//       {tasks.map((task) => (
//         <TaskCard
//           key={task.id}
//           task={task}
//           onEdit={(task) => console.log("Edit", task)} // Replace with edit logic
//           onDelete={(taskId) => deleteTask(taskId)}
//         />
//       ))}
//     </div>
//   );
// };

// export default TaskList;
