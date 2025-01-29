import React from "react";
// import TaskList from "../components/TaskList";
import TaskBoard from "../components/TaskBoard";
import Navbar from "../components/Navbar";
import TaskFilter from "../components/TaskFilter";

const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        {/* <TaskList /> */}
        <TaskFilter />
        <TaskBoard />
      </div>
    </div>
  );
};

export default Home;
