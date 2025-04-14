// DeleteProject.js
import React from "react";
import axios from "axios";

function DeleteProject({ projectId, onDelete }) {
  const handleDelete = async () => {
    try {
      await axios.delete(`/project/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onDelete(projectId); // Call the parent function to remove the project from UI
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}

export default DeleteProject;
