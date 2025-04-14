// CreateProject.js
import React, { useState } from "react";
import axios from "axios";

function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/project", // Use the correct API endpoint
        {
          projectName,
          projectDescription,
          startDate,
          endDate,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } } // Use JWT token from localStorage or context
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error creating project", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <textarea
        placeholder="Project Description"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button type="submit">Create Project</button>
    </form>
  );
}

export default CreateProject;
