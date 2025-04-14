// DeleteTask.js
import React from "react";
import axios from "axios";

function DeleteTask({ projectId, taskId, onDelete }) {
  const handleDelete = async () => {
    try {
      // Send a DELETE request to delete the task by ID
      await axios.delete(`/project/${projectId}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onDelete(taskId); // Call the parent function to remove the task from UI
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete Task</button>
    </div>
  );
}

export default DeleteTask;
