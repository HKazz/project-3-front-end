// EditTask.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function EditTask({ projectId, taskId }) {
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`/project/${projectId}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTask(response.data);
      } catch (error) {
        console.error("Error fetching task", error);
      }
    };
    fetchTask();
  }, [projectId, taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/project/${projectId}/tasks/${taskId}`, 
        task,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={task?.taskName || ""}
        onChange={(e) => setTask({ ...task, taskName: e.target.value })}
      />
      <textarea
        value={task?.taskDescription || ""}
        onChange={(e) => setTask({ ...task, taskDescription: e.target.value })}
      />
      <input
        type="date"
        value={task?.startDate || ""}
        onChange={(e) => setTask({ ...task, startDate: e.target.value })}
      />
      <input
        type="date"
        value={task?.endDate || ""}
        onChange={(e) => setTask({ ...task, endDate: e.target.value })}
      />
      <button type="submit">Save Changes</button>
    </form>
  );
}

export default EditTask;
